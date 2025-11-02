import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { VisualizationDefinition } from '@compx/common/BlockSchema/types';
import { VisualizationData, VisualizationDataPoint } from '@compx/common/Network/GraphItemStorage/BlockStorage';

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
        const backgroundColor = config.backgroundColor || 'transparent';
        const margin = config.margin || padding;

        // Calculate plot area dimensions with proper margin
        const plotWidth = props.width - margin * 2;
        const plotHeight = props.height - margin * 2;

        if (plotWidth <= 0 || plotHeight <= 0) {
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

        // Create scales - use margin for positioning, not padding
        const xScale = d3
          .scaleLinear()
          .domain([minTime - timePadding, maxTime + timePadding])
          .range([margin, plotWidth + margin]);

        const yScale = d3
          .scaleLinear()
          .domain([maxValue + valuePadding, minValue - valuePadding]) // Inverted for SVG coordinates
          .range([margin, plotHeight + margin]);

        // Draw background rectangle
        if (backgroundColor !== 'transparent') {
          svg
            .append('rect')
            .attr('x', margin)
            .attr('y', margin)
            .attr('width', plotWidth)
            .attr('height', plotHeight)
            .attr('fill', backgroundColor)
            .attr('stroke', '#ccc')
            .attr('stroke-width', 0.5);
        }

        // Create line generator
        const line = d3
          .line<VisualizationDataPoint>()
          .x((d) => xScale(d.time))
          .y((d) => yScale(d.value))
          .curve(d3.curveMonotoneX);

        // Draw axes
        const axisGroup = svg.append('g').attr('class', 'axes');

        // X-axis
        const xAxis = d3.axisBottom(xScale).ticks(Math.min(5, Math.floor(plotWidth / 60)));
        const xAxisContainer = axisGroup.append('g').attr('transform', `translate(0, ${plotHeight + margin})`);

        xAxisContainer.call(xAxis);

        // Style X-axis elements after creation - use the container group
        const xAxisNode = xAxisContainer.node();
        if (xAxisNode) {
          d3.select(xAxisNode).selectAll('text').style('font-size', '8px').style('fill', '#666');
          d3.select(xAxisNode).selectAll('line, path').style('stroke', '#ccc').style('stroke-width', '0.5');
        }

        // Y-axis
        const yAxis = d3.axisLeft(yScale).ticks(Math.min(5, Math.floor(plotHeight / 40)));
        const yAxisContainer = axisGroup.append('g').attr('transform', `translate(${padding}, 0)`);

        yAxisContainer.call(yAxis);

        // Style Y-axis elements after creation - use the container group
        const yAxisNode = yAxisContainer.node();
        if (yAxisNode) {
          d3.select(yAxisNode).selectAll('text').style('font-size', '8px').style('fill', '#666');
          d3.select(yAxisNode).selectAll('line, path').style('stroke', '#ccc').style('stroke-width', '0.5');
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
  }, [props.data, props.width, props.height, props.visualization, mounted, padding]);

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
