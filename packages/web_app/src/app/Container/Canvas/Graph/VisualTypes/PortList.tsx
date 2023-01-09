// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { VisualBlockStorageType } from 'compx_common/Network/GraphItemStorage/BlockStorage';
// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { Vector2D } from 'compx_common/Types';
import React, { Component, useState } from 'react';
import { Circle } from 'react-konva';

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
  const [hovering, setHovering] = useState(false);
  const portLocation = CalculatePortLocation(
    props.block,
    props.isOutput,
    props.portInd,
    props.canvasTranslation,
    props.canvasZoom,
    props.screenSize
  );

  return (
    <React.Fragment>
      <Circle x={portLocation.port.x} y={portLocation.port.y} radius={4} fill={hovering ? 'blue' : 'red'} />
      <Circle
        x={portLocation.port.x}
        y={portLocation.port.y}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseDown={(e) => {
          e.evt.stopPropagation();
          props.onMouseDown();
        }}
        onMouseUp={props.onMouseUp}
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

    this.state = {
      hovering: false
    };
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
