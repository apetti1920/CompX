import { PortType } from '@compx/common/BlockSchema/types';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { Vector2D } from '@compx/common/Types';
import React, { Component } from 'react';
import { Circle, Text as KonvaText } from 'react-konva';

import { getPortTypeColor } from './portTypeColors';
import { CalculatePortLocation } from '../../utils';

type PortPropType = {
  canvasTranslation: Vector2D;
  canvasZoom: number;
  screenSize: Vector2D;
  block: VisualBlockStorageType<any, any>;
  isOutput: boolean;
  portInd: number;
  onMouseDown: () => void;
  onMouseUp: () => void;
};

function PortComponent(props: PortPropType): React.ReactElement {
  const portLocation = CalculatePortLocation(
    props.block,
    props.isOutput,
    props.portInd,
    props.canvasTranslation,
    props.canvasZoom,
    props.screenSize
  );

  // Get port type and color
  const port = props.isOutput ? props.block.outputPorts?.[props.portInd] : props.block.inputPorts?.[props.portInd];

  // Default to gray, but try to get the port type color
  let portColor = '#9E9E9E';
  if (port && port.type) {
    // Port type should match one of: 'NUMBER' | 'STRING' | 'VECTOR' | 'MATRIX' | 'BOOLEAN'
    portColor = getPortTypeColor(port.type as PortType | string);
  }

  // Calculate text position and alignment
  // Text should be inside the block, very close to the port
  // Font size should scale with block size (block size already includes zoom from CalculateScreenBlockSizeAndPosition)
  const fontSize = Math.max(6, portLocation.block.size.y * 0.12); // Scale with block height, min 6px

  // Port radius should scale proportionally with block size
  const portRadius = Math.max(3, portLocation.block.size.y * 0.04); // Scale with block height, min 3px

  let textX: number;
  let textAlign: 'left' | 'right' | 'center';

  if (props.isOutput) {
    // Output ports: port center is at blockRight (right edge of block)
    // Text should be inside, to the left of the port
    // With align='right', x is where the right edge of text is
    // Position text so its right edge is inside the block, close to port center
    // Ensure text doesn't overflow left edge (keep it inside the block)

    // Gap between port and text should scale proportionally with block size
    // Use a percentage of block height to maintain proportional spacing
    const gapFromPort = Math.max(6, portLocation.block.size.y * 0.43); // Scale with block height, min 6px
    textX = portLocation.port.x - gapFromPort;
    textAlign = 'right';
  } else {
    // Input ports: port center is at blockLeft (left edge of block)
    // Text should be inside, to the right of the port
    // With align='left', x is where the left edge of text is
    // Position text so its left edge is inside the block, close to port center

    // Gap between port and text should scale proportionally with block size
    // Use a percentage of block height to maintain proportional spacing
    const gapFromPort = Math.max(6, portLocation.block.size.y * 0.1); // Scale with block height, min 6px
    textX = portLocation.port.x + gapFromPort;
    textAlign = 'left';
  }

  // Text should be vertically centered on the port
  // For Konva Text, y is the top edge, so use offsetY to center it vertically
  const textY = portLocation.port.y - 2 * portRadius;
  const textVerticalAlign = 'center';

  return (
    <React.Fragment>
      <Circle x={portLocation.port.x} y={portLocation.port.y} radius={portRadius} fill={portColor} />
      <Circle
        x={portLocation.port.x}
        y={portLocation.port.y}
        onMouseDown={(e) => {
          e.evt.stopPropagation();
          props.onMouseDown();
        }}
        onMouseUp={(e) => {
          e.evt.stopPropagation();
          props.onMouseUp();
        }}
        radius={portRadius * 3}
        fill="transparent"
      />
      {port && port.name && (
        <KonvaText
          x={textX}
          y={textY}
          text={port.name}
          fontSize={fontSize}
          fill="#FFFFFF"
          align={textAlign}
          verticalAlign={textVerticalAlign}
          listening={false}
        />
      )}
    </React.Fragment>
  );
}

type PropType = {
  canvasTranslation: Vector2D;
  canvasZoom: number;
  screenSize: Vector2D;
  block: VisualBlockStorageType<any, any>;
  onMouseDown: (block: VisualBlockStorageType<any, any>, portInd: number, isOutput: boolean) => void;
  onMouseUp: (block: VisualBlockStorageType<any, any>, portInd: number, isOutput: boolean) => void;
};

type StateType = object;

export default class PortList extends Component<PropType, StateType> {
  constructor(props: PropType) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <React.Fragment>
        {this.props.block.inputPorts.map((p, i) => (
          <PortComponent
            key={`input-port-${i}`}
            canvasTranslation={this.props.canvasTranslation}
            canvasZoom={this.props.canvasZoom}
            screenSize={this.props.screenSize}
            block={this.props.block}
            isOutput={false}
            portInd={i}
            onMouseDown={() => this.props.onMouseDown(this.props.block, i, false)}
            onMouseUp={() => this.props.onMouseUp(this.props.block, i, false)}
          />
        ))}

        {this.props.block.outputPorts.map((p, i) => (
          <PortComponent
            key={`output-port-${i}`}
            canvasTranslation={this.props.canvasTranslation}
            canvasZoom={this.props.canvasZoom}
            screenSize={this.props.screenSize}
            block={this.props.block}
            isOutput
            portInd={i}
            onMouseDown={() => this.props.onMouseDown(this.props.block, i, true)}
            onMouseUp={() => this.props.onMouseUp(this.props.block, i, true)}
          />
        ))}
      </React.Fragment>
    );
  }
}
