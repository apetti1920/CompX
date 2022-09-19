import React from "react";
import {Group, Line} from "react-konva";
import Konva from "konva";
import KonvaEventObject = Konva.KonvaEventObject;

import { Vector2D } from '@compx/common/Types';
import {ArrowDirectionType, MouseOnBlockExtracted} from "../../../utils";

export default (props: {
    points: Vector2D[], setCursorStyle?: (side?: ArrowDirectionType)=>void, selected?: boolean,
    onSelectComponent: (on: MouseOnBlockExtracted<"EDGE">, selectMultiple: boolean)=>void,
    onAddEdgeSplit: (on: MouseOnBlockExtracted<"EDGE">) => void,
    onDeleteEdgeSplit: (on: MouseOnBlockExtracted<"EDGE">)=>void
}) => {
    if (props.points.length <= 2) return <React.Fragment/>
    const color = props.selected ? "red" : "white";
    const strokeWidth = props.selected ? 2 : 3;

    const mouseDownHandler = (e: KonvaEventObject<MouseEvent>, on: MouseOnBlockExtracted<"EDGE">) => {
        e.evt.stopPropagation();

        if (e.evt.button === 2) {
            props.onSelectComponent(on, false);
            props.onDeleteEdgeSplit(on);
        } if ((e.evt.ctrlKey || e.evt.metaKey) && e.evt.button === 0) {
            props.onSelectComponent(on, false);
            props.onAddEdgeSplit(on);
        } else if (e.evt.shiftKey && e.evt.button === 0) {
            props.onSelectComponent(on, true);
        } else if (e.evt.button === 0) {
            props.onSelectComponent(on, false);
        }
    }

    return (
        <Group>
            <Group>
                <Line points={props.points.slice(0, 2).map(p => [p.x, p.y]).flat()} stroke={color}
                      strokeWidth={strokeWidth}/>
                <Line points={props.points.slice(0, 2).map(p => [p.x, p.y]).flat()}
                      stroke="transparent" strokeWidth={10}
                      onMouseDown={(e) =>
                          mouseDownHandler(e, {mouseOn: "EDGE"})}
                />
            </Group>
            {props.points.slice(1, props.points.length-2).map((p, i) => (
                <Group key={`lineseg-${i}`} >
                    <Line points={[p.x, p.y, props.points[i+2].x, props.points[i+2].y]}
                          stroke={color} strokeWidth={strokeWidth}
                    />
                    <Line points={[p.x, p.y, props.points[i+2].x, props.points[i+2].y]}
                          stroke="transparent" strokeWidth={10}
                          onMouseEnter={()=>props.setCursorStyle?.(i%2===0?"ew":"ns")}
                          onMouseLeave={()=>props.setCursorStyle?.()}
                          onMouseDown={(e) =>
                            mouseDownHandler(e, {
                                mouseOn: "EDGE", moveInfo: {
                                    edgePieceInd: i,
                                    inputPortLoc: i % 2 === 0 ? props.points[props.points.length - 1].x : props.points[props.points.length - 1].y,
                                    outputPortInd: i % 2 === 0 ? props.points[0].x : props.points[0].y
                                }})}
                    />
                </Group>
            ))}
            <Group>
                <Line points={props.points.slice(props.points.length-2, props.points.length).map(p => [p.x, p.y]).flat()}
                      stroke={color} strokeWidth={strokeWidth} />
                <Line points={props.points.slice(props.points.length-2, props.points.length).map(p => [p.x, p.y]).flat()}
                      stroke="transparent" strokeWidth={10}
                      onMouseDown={(e) =>
                          mouseDownHandler(e, {mouseOn: "EDGE"})}
                />
            </Group>
        </Group>
    )
}