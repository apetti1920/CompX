import React, {Component} from 'react';
import { Circle } from 'react-konva';

import { Vector2D } from '@compx/common/Types';
import { PortStorageWithIDType } from '@compx/common/Network/GraphItemStorage/PortStorage';

type PropType = {
    blockPosition: Vector2D
    blockSize: Vector2D
    inputPorts: PortStorageWithIDType<any>[]
    outputPorts: PortStorageWithIDType<any>[]
};

type StateType = {};

export default class PortList extends Component<PropType, StateType> {
    constructor(props: PropType) {
        super(props);
    }

    render() {
        const vertDistInput = this.props.blockSize.y / (this.props.inputPorts.length + 1);
        const vertDistOutput = this.props.blockSize.y / (this.props.outputPorts.length + 1);
        return (
            <React.Fragment>
                {this.props.inputPorts.map((p, i) => (
                    <Circle key={`input-port-${i}`} x={this.props.blockPosition.x}
                            y={this.props.blockPosition.y + (vertDistInput * (i+1))}
                            radius={4} fill="red"/>
                ))}

                {this.props.outputPorts.map((p, i) => (
                    <Circle key={`output-port-${i}`} x={this.props.blockPosition.x + this.props.blockSize.x}
                            y={this.props.blockPosition.y + (vertDistOutput * (i+1))}
                            radius={4} fill="red"/>
                ))}
            </React.Fragment>
        )
    }
}