import React, {Component, useState} from 'react';
import { Circle } from 'react-konva';
import Konva from "konva";
type KonvaEventObject<T> = Konva.KonvaEventObject<T>;

import { Vector2D } from '@compx/common/Types';
import { PortStorageWithIDType } from '@compx/common/Network/GraphItemStorage/PortStorage';

type PortPropType = { i: number, blockPosition: Vector2D,
    onMouseDown: (e: KonvaEventObject<MouseEvent>)=>void,
    onMouseUp: (e: KonvaEventObject<MouseEvent>)=>void } & (
    { vertDistInput: number } |
    { vertDistOutput: number, blockWidth: number }
)
function PortComponent(props: PortPropType): React.ReactElement {
    const [hovering, setHovering] = useState(false);

    // @ts-ignore
    const x = props.blockPosition.x + (props.blockWidth!==undefined?props.blockWidth:0.0);
    // @ts-ignore
    const y = props.blockPosition.y + ((props.vertDistOutput!==undefined?props.vertDistOutput:props.vertDistInput) * (props.i+1));

    return (
        <React.Fragment>
            <Circle x={x} y={y}
                    radius={4} fill={hovering?"blue":"red"}/>
            <Circle x={x} y={y}
                    onMouseEnter={()=>setHovering(true)}
                    onMouseLeave={()=>setHovering(false)}
                    onMouseDown={props.onMouseDown} onMouseUp={props.onMouseUp}
                    radius={12} fill="transparent"/>
        </React.Fragment>
    )
}

type PropType = {
    blockPosition: Vector2D,
    blockSize: Vector2D,
    inputPorts: PortStorageWithIDType<any>[],
    outputPorts: PortStorageWithIDType<any>[],
    onMouseDown: (e: KonvaEventObject<MouseEvent>, portId: string, isOutput: boolean)=>void,
    onMouseUp: (e: KonvaEventObject<MouseEvent>, portId: string, isOutput: boolean)=>void
};

type StateType = {};

export default class PortList extends Component<PropType, StateType> {
    public static defaultProps = {
        onlyDrawTouchPoints: false
    };

    constructor(props: PropType) {
        super(props);

        this.state = {
            hovering: false
        }
    }

    render() {
        const vertDistInput = this.props.blockSize.y / (this.props.inputPorts.length + 1);
        const vertDistOutput = this.props.blockSize.y / (this.props.outputPorts.length + 1);

        return (
            <React.Fragment>
                {this.props.inputPorts.map((p, i) => (
                    <PortComponent
                        key={`input-port-${i}`} i={i}
                        blockPosition={this.props.blockPosition} vertDistInput={vertDistInput}
                        onMouseDown={(e)=>this.props.onMouseDown(e, p.id, false)}
                        onMouseUp={(e)=>this.props.onMouseUp(e, p.id, false)}
                    />
                ))}

                {this.props.outputPorts.map((p, i) => (
                    <PortComponent
                        key={`output-port-${i}`} i={i}
                        blockPosition={this.props.blockPosition} vertDistOutput={vertDistOutput}
                        blockWidth={this.props.blockSize.x}
                        onMouseDown={(e)=>this.props.onMouseDown(e, p.id, true)}
                        onMouseUp={(e)=>this.props.onMouseUp(e, p.id, true)}
                    />
                ))}
            </React.Fragment>
        )
    }
}