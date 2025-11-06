import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { VisualizationDefinition } from '@compx/common/BlockSchema/types';
import { VisualizationData, VisualizationDataPoint } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import ColorTheme from '../../../../theme/ColorTheme';

interface BlockVisualizationProps {
  /** Visualization configuration from block definition */
  visualization: VisualizationDefinition;
  /** Visualization data buffers */
  data?: VisualizationData;
  /** Width of the visualization area */
  width: number;
  /** Height of the visualization area */
  height: number;
  /** Padding around the visualization */
  padding?: number;
  /** Theme for color scheme */
  theme?: ColorTheme;
}

/**
 * Component that renders D3.js visualizations inside blocks
 */
export default function BlockVisualization(props: BlockVisualizationProps): JSX.Element | null {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const padding = props.padding || 4;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !props.data || !mounted) {
      return;
    }

    if (props.visualization.type !== 'line_graph') {
      return;
    }

    // Ensure we have a valid SVG element that's in the DOM
    if (!(svgRef.current instanceof SVGSVGElement)) {
      return;
    }

    // Wait a tick to ensure the SVG is fully mounted
    let timeoutId: NodeJS.Timeout | null = null;
    timeoutId = setTimeout(() => {
      if (!svgRef.current) {
        return;
      }

      try {
        const svg = d3.select(svgRef.current);

        // Safely clear previous content
        svg.selectAll('*').remove();

        const config = props.visualization.config;
        if (!config || !('inputPorts' in config)) {
          return;
        }

        const inputPorts = config.inputPorts || [];
        const colors = config.colors || ['#2196F3', '#FF9800', '#4CAF50', '#F44336', '#9C27B0', '#00BCD4', '#FFEB3B'];
        // Use theme background color if available, otherwise fall back to config or white
        const backgroundColor = props.theme ? props.theme.get('background') : config.backgroundColor || 'white';
        const margin = config.margin || padding;

        // Internal margins for axis labels inside the plot area
        const internalMarginLeft = 40; // Space for Y-axis labels
        const internalMarginBottom = 25; // Space for X-axis labels
        const internalMarginTop = 5;
        const internalMarginRight = 5;

        // Calculate plot area dimensions with proper margin
        const plotWidth = props.width - margin * 2;
        const plotHeight = props.height - margin * 2;

        if (plotWidth <= 0 || plotHeight <= 0) {
          return;
        }

        // Calculate inner plot area (for actual data) with internal margins for labels
        const innerPlotWidth = plotWidth - internalMarginLeft - internalMarginRight;
        const innerPlotHeight = plotHeight - internalMarginTop - internalMarginBottom;

        if (innerPlotWidth <= 0 || innerPlotHeight <= 0) {
          return;
        }

        // Collect all data points from specified ports
        const allData: Array<{ portName: string; points: VisualizationDataPoint[] }> = [];
        inputPorts.forEach((portName) => {
          const portData = props.data![portName];
          if (portData && portData.length > 0) {
            allData.push({ portName, points: portData });
          }
        });

        if (allData.length === 0) {
          return;
        }

        // Calculate time and value ranges
        let minTime = Infinity;
        let maxTime = -Infinity;
        let minValue = Infinity;
        let maxValue = -Infinity;

        allData.forEach(({ points }) => {
          points.forEach((point) => {
            if (point.time < minTime) minTime = point.time;
            if (point.time > maxTime) maxTime = point.time;
            if (point.value < minValue) minValue = point.value;
            if (point.value > maxValue) maxValue = point.value;
          });
        });

        // Handle edge cases
        if (minTime === maxTime) {
          maxTime = minTime + 1;
        }
        if (minValue === maxValue) {
          minValue = minValue - 1;
          maxValue = maxValue + 1;
        }

        // Add small padding to ranges
        const timeRange = maxTime - minTime;
        const valueRange = maxValue - minValue;
        const timePadding = timeRange * 0.05 || 0.1;
        const valuePadding = valueRange * 0.1 || 0.1;

        // Create scales - position inside the plot area with internal margins
        const xScale = d3
          .scaleLinear()
          .domain([minTime - timePadding, maxTime + timePadding])
          .range([margin + internalMarginLeft, margin + internalMarginLeft + innerPlotWidth]);

        const yScale = d3
          .scaleLinear()
          .domain([maxValue + valuePadding, minValue - valuePadding]) // Inverted for SVG coordinates
          .range([margin + internalMarginTop, margin + internalMarginTop + innerPlotHeight]);

        // Create shadow filter for depth effect
        const defs = svg.append('defs');
        const filter = defs
          .append('filter')
          .attr('id', 'shadow')
          .attr('x', '-50%')
          .attr('y', '-50%')
          .attr('width', '200%')
          .attr('height', '200%');

        filter.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', 3).attr('result', 'blur');

        filter.append('feOffset').attr('in', 'blur').attr('dx', 2).attr('dy', 2).attr('result', 'offsetBlur');

        const feComponentTransfer = filter.append('feComponentTransfer').attr('in', 'offsetBlur');

        feComponentTransfer.append('feFuncA').attr('type', 'linear').attr('slope', 0.3);

        const feMerge = filter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'offsetBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Draw background rectangle with shadow
        if (backgroundColor !== 'transparent') {
          // Shadow rectangle
          svg
            .append('rect')
            .attr('x', margin + 2)
            .attr('y', margin + 2)
            .attr('width', plotWidth)
            .attr('height', plotHeight)
            .attr('fill', 'rgba(0, 0, 0, 0.15)')
            .attr('rx', 2);

          // Main background rectangle
          svg
            .append('rect')
            .attr('x', margin)
            .attr('y', margin)
            .attr('width', plotWidth)
            .attr('height', plotHeight)
            .attr('fill', backgroundColor)
            .attr('rx', 2)
            .attr('filter', 'url(#shadow)');
        }

        // Create line generator
        const line = d3
          .line<VisualizationDataPoint>()
          .x((d) => xScale(d.time))
          .y((d) => yScale(d.value))
          .curve(d3.curveMonotoneX);

        // Get theme text color for axis labels
        const textColor = props.theme ? props.theme.get('heading') : '#666';

        // Calculate grid color - use a lighter/darker version of the background
        // For light backgrounds, use a darker grid; for dark backgrounds, use a lighter grid
        let gridColor = '#e0e0e0';
        if (props.theme) {
          const bgColor = props.theme.get('background');
          // Simple heuristic: if background is light (high brightness), use darker grid
          // Convert hex to RGB and calculate brightness
          const hex = bgColor.replace('#', '');
          const r = parseInt(hex.substring(0, 2), 16);
          const g = parseInt(hex.substring(2, 4), 16);
          const b = parseInt(hex.substring(4, 6), 16);
          const brightness = (r * 299 + g * 587 + b * 114) / 1000;

          if (brightness > 128) {
            // Light background - use darker grid
            const darkerR = Math.max(0, r - 30);
            const darkerG = Math.max(0, g - 30);
            const darkerB = Math.max(0, b - 30);
            gridColor = `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
          } else {
            // Dark background - use lighter grid
            const lighterR = Math.min(255, r + 30);
            const lighterG = Math.min(255, g + 30);
            const lighterB = Math.min(255, b + 30);
            gridColor = `rgb(${lighterR}, ${lighterG}, ${lighterB})`;
          }
        }

        // Draw grid lines inside the plot area (before axes so they appear behind)
        const gridGroup = svg.append('g').attr('class', 'grid');

        // Horizontal grid lines
        const yAxisTicks = yScale.ticks(Math.min(5, Math.floor(innerPlotHeight / 40)));
        gridGroup
          .selectAll('line.horizontal')
          .data(yAxisTicks)
          .enter()
          .append('line')
          .attr('class', 'horizontal')
          .attr('x1', margin + internalMarginLeft)
          .attr('x2', margin + internalMarginLeft + innerPlotWidth)
          .attr('y1', (d) => yScale(d))
          .attr('y2', (d) => yScale(d))
          .style('stroke', gridColor)
          .style('stroke-width', '0.5')
          .style('stroke-dasharray', '2,2')
          .style('opacity', 0.4);

        // Vertical grid lines
        const xAxisTicks = xScale.ticks(Math.min(5, Math.floor(innerPlotWidth / 60)));
        gridGroup
          .selectAll('line.vertical')
          .data(xAxisTicks)
          .enter()
          .append('line')
          .attr('class', 'vertical')
          .attr('x1', (d) => xScale(d))
          .attr('x2', (d) => xScale(d))
          .attr('y1', margin + internalMarginTop)
          .attr('y2', margin + internalMarginTop + innerPlotHeight)
          .style('stroke', gridColor)
          .style('stroke-width', '0.5')
          .style('stroke-dasharray', '2,2')
          .style('opacity', 0.4);

        // Draw axes inside the plot area
        const axisGroup = svg.append('g').attr('class', 'axes');

        // X-axis - positioned at the bottom of the inner plot area
        const xAxis = d3.axisBottom(xScale).ticks(Math.min(5, Math.floor(innerPlotWidth / 60)));
        const xAxisY = margin + internalMarginTop + innerPlotHeight;
        const xAxisContainer = axisGroup.append('g').attr('transform', `translate(0, ${xAxisY})`);

        xAxisContainer.call(xAxis);

        // Style X-axis elements - inside the plot area
        const xAxisNode = xAxisContainer.node();
        if (xAxisNode) {
          d3.select(xAxisNode)
            .selectAll('text')
            .style('font-size', '9px')
            .style('fill', textColor)
            .style('font-family', 'sans-serif');
          d3.select(xAxisNode).selectAll('line, path').style('stroke', gridColor).style('stroke-width', '1');
        }

        // Y-axis - positioned at the left of the inner plot area
        const yAxis = d3.axisLeft(yScale).ticks(Math.min(5, Math.floor(innerPlotHeight / 40)));
        const yAxisX = margin + internalMarginLeft;
        const yAxisContainer = axisGroup.append('g').attr('transform', `translate(${yAxisX}, 0)`);

        yAxisContainer.call(yAxis);

        // Style Y-axis elements - inside the plot area
        const yAxisNode = yAxisContainer.node();
        if (yAxisNode) {
          d3.select(yAxisNode)
            .selectAll('text')
            .style('font-size', '9px')
            .style('fill', textColor)
            .style('font-family', 'sans-serif');
          d3.select(yAxisNode).selectAll('line, path').style('stroke', gridColor).style('stroke-width', '1');
        }

        // Draw lines for each port
        const linesGroup = svg.append('g').attr('class', 'lines');
        allData.forEach(({ portName, points }, index) => {
          const color = colors[index % colors.length];
          const path = linesGroup
            .append('path')
            .datum(points)
            .attr('fill', 'none')
            .attr('stroke', color)
            .attr('stroke-width', 1.5)
            .attr('d', line)
            .style('opacity', 0.8);

          // Animate line drawing
          const totalLength = path.node()?.getTotalLength() || 0;
          path
            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(300)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);
        });
      } catch (e) {
        console.warn('Error rendering visualization:', e);
      }
    }, 0);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [props.data, props.width, props.height, props.visualization, props.theme, mounted, padding]);

  // Validate props
  const width = Number(props.width);
  const height = Number(props.height);

  if (!props.data || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    />
  );
}
