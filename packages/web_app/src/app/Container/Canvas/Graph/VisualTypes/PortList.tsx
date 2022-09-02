import React, {Component, useState} from 'react';
import { Circle } from 'react-konva';

import { Vector2D } from '@compx/common/Types';
import { PortStorageWithIDType } from '@compx/common/Network/GraphItemStorage/PortStorage';

type PortPropType = { i: number, blockPosition: Vector2D,
    onMouseDown: (portLocation: Vector2D)=>void,
    onMouseUp: ()=>void } & (
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
                    onMouseDown={(e)=> {
                        e.evt.stopPropagation();
                        props.onMouseDown(new Vector2D(x, y))
                    }}
                    onMouseUp={props.onMouseUp}
                    radius={12} fill="transparent"/>
        </React.Fragment>
    )
}

type PropType = {
    blockShape: { position: Vector2D, size: Vector2D },
    inputPorts: PortStorageWithIDType<any>[],
    outputPorts: PortStorageWithIDType<any>[],
    onMouseDown: (portId: string, isOutput: boolean, portLocation: Vector2D)=>void,
    onMouseUp: (portId: string, isOutput: boolean)=>void
};

type StateType = {};

export default class PortList extends Component<PropType, StateType> {
    constructor(props: PropType) {
        super(props);

        this.state = {
            hovering: false
        }
    }

    render() {
        const vertDistInput = this.props.blockShape.size.y / (this.props.inputPorts.length + 1);
        const vertDistOutput = this.props.blockShape.size.y / (this.props.outputPorts.length + 1);

        return (
            <React.Fragment>
                {this.props.inputPorts.map((p, i) => (
                    <PortComponent
                        key={`input-port-${i}`} i={i}
                        blockPosition={this.props.blockShape.position} vertDistInput={vertDistInput}
                        onMouseDown={(portLocation)=>
                            this.props.onMouseDown(p.id, false, portLocation)}
                        onMouseUp={()=>this.props.onMouseUp(p.id, false)}
                    />
                ))}

                {this.props.outputPorts.map((p, i) => (
                    <PortComponent
                        key={`output-port-${i}`} i={i}
                        blockPosition={this.props.blockShape.position} vertDistOutput={vertDistOutput}
                        blockWidth={this.props.blockShape.size.x}
                        onMouseDown={(portLocation)=>
                            this.props.onMouseDown(p.id, true, portLocation)}
                        onMouseUp={()=>this.props.onMouseUp(p.id, true)}
                    />
                ))}
            </React.Fragment>
        )
    }
}