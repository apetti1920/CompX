import { PortType } from '@compx/common/BlockSchema/types';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { Vector2D } from '@compx/common/Types';
import React, { Component } from 'react';
import { Circle } from 'react-konva';

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
    // Log for debugging to see what type we're getting
    // eslint-disable-next-line no-console
    console.log('Port type:', port.type, 'Type of:', typeof port.type, 'Port:', port);
    // Port type should match one of: 'NUMBER' | 'STRING' | 'VECTOR' | 'MATRIX' | 'BOOLEAN'
    portColor = getPortTypeColor(port.type as PortType | string);
  }

  return (
    <React.Fragment>
      <Circle x={portLocation.port.x} y={portLocation.port.y} radius={4} fill={portColor} />
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
        radius={12}
        fill="transparent"
      />
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

type StateType = {};

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
            isOutput={true}
            portInd={i}
            onMouseDown={() => this.props.onMouseDown(this.props.block, i, true)}
            onMouseUp={() => this.props.onMouseUp(this.props.block, i, true)}
          />
        ))}
      </React.Fragment>
    );
  }
}
