import React from "react";
import { Line, Group } from "react-konva";

import { LinearInterp } from '@compx/common/Helpers/Other'
import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { Vector2D } from '@compx/common/Types';

import {ArrowDirectionType, CalculatePortLocation} from "../../utils";



type MouseDraggingPortType = {
    block: VisualBlockStorageType<any, any>,
    isOutput: boolean,
    portInd: number,
    mouseLoc: Vector2D
}

export type StaticEdgeBlockType = Omit<VisualEdgeStorageType<any>, "input" | "output"> & {
    input: { block: VisualBlockStorageType<any, any>, portInd: number },
        output: { block: VisualBlockStorageType<any, any>, portInd: number }
}

type PropType = (MouseDraggingPortType | { edge: StaticEdgeBlockType }) & {
    canvasTranslation: Vector2D, canvasZoom: number, screenSize: Vector2D,
    SetCursorStyle: (side?: ArrowDirectionType)=>void
};

const ShapeWrapperComponent = (props: {points: Vector2D[], SetCursorStyle: (side?: ArrowDirectionType)=>void}) => {
    if (props.points.length <= 2) return <React.Fragment/>

    return (
        <Group>
            <Line points={props.points.slice(0, 2).map(p => [p.x, p.y]).flat()} stroke="white" strokeWidth={2}/>
            {props.points.slice(1, props.points.length-2).map((p, i) => (
                <Group key={`lineseg-${i}`} >
                    <Line points={[p.x, p.y, props.points[i+2].x, props.points[i+2].y]}
                          stroke="white" strokeWidth={2}
                    />
                    <Line points={[p.x, p.y, props.points[i+2].x, props.points[i+2].y]}
                          stroke="transparent" strokeWidth={10} onMouseEnter={()=>props.SetCursorStyle(i%2===0?"ew":"ns")}
                          onMouseLeave={()=>props.SetCursorStyle()}
                    />
                </Group>
            ))}
            <Line points={props.points.slice(props.points.length-2, props.points.length).map(p => [p.x, p.y]).flat()} stroke="white" strokeWidth={2}/>
        </Group>
    )
}

const CalculateMidPoints = (
    start: Vector2D, end: Vector2D, percentages: number[]
): Vector2D[] => {
    const points = [start];
    let gap = Vector2D.subtract(end, start);
    percentages.forEach((p, i) => {
        if (p !== 0.0) {
            points.push(new Vector2D(
                i%2==0?(p*gap.x)+start.x:points[points.length-1].x,
                i%2==0?points[points.length-1].y:(p*gap.y)+start.y
            ));
        }
    });
    points.push(new Vector2D(points[points.length-1].x, end.y))
    points.push(end);
    return points;
}

const CalculateMidPercent = (
    outputNumPorts: number, outputPortInd: number, inputNumPorts: number, inputPortInd: number, dir1: boolean
): number => {
    const tmpMidPercent = 0.5 * (((outputPortInd+1) / outputNumPorts) + ((inputPortInd+1) / inputNumPorts));
    return LinearInterp(tmpMidPercent, 0, 1, dir1?0.75:0.25, dir1?0.25:0.75)
}

export default (props: PropType) => {
    let radius = 20 * props.canvasZoom;
    let points: Vector2D[];

    // @ts-ignore
    if (props.edge === undefined) {
        const portLoc = CalculatePortLocation(
            // @ts-ignore
            props.block, props.isOutput, props.portInd,
            props.canvasTranslation, props.canvasZoom, props.screenSize
        ).port;

        // @ts-ignore
        const startPos = props.isOutput ? portLoc : props.mouseLoc;
        // @ts-ignore
        const endPos = props.isOutput ? props.mouseLoc : portLoc

        if (endPos.x >= startPos.x + radius) {
            points = CalculateMidPoints(startPos, endPos, [0.5]);
        } else {
            const p1 = Vector2D.add(startPos, new Vector2D(radius, 0.0));
            points = [
                startPos,
                ...CalculateMidPoints(p1, endPos, [])
            ]
        }
    } else {
        // @ts-ignore
        const edge: StaticEdgeBlockType = props.edge;
        const outputPortLoc = CalculatePortLocation(
            edge.output.block, true, edge.output.portInd,
            props.canvasTranslation, props.canvasZoom, props.screenSize
        )
        const inputPortLoc = CalculatePortLocation(
            edge.input.block, false, edge.input.portInd,
            props.canvasTranslation, props.canvasZoom, props.screenSize
        )

        if (outputPortLoc.block.size.x <= 25.0 || outputPortLoc.block.size.y <= 25.0 ||
            inputPortLoc.block.size.x <= 25.0 || inputPortLoc.block.size.y <= 25.0)
            return <React.Fragment/>

        if (edge.midPoints.length > 0) {
            points = CalculateMidPoints(outputPortLoc.port, inputPortLoc.port, edge.midPoints);
        } else {
            const midPercent = CalculateMidPercent(
                edge.output.block.outputPorts.length, edge.output.portInd,
                edge.input.block.inputPorts.length, edge.input.portInd,
                inputPortLoc.port.y >= outputPortLoc.port.y
            )
            const newRadius = radius*(1+midPercent)**2;
            if (inputPortLoc.port.x - newRadius >= outputPortLoc.port.x + newRadius) {
                points = CalculateMidPoints(outputPortLoc.port, inputPortLoc.port, [midPercent]);
            } else {
                const p1 = Vector2D.add(outputPortLoc.port, new Vector2D(newRadius, 0.0));
                const p2 = Vector2D.subtract(inputPortLoc.port, new Vector2D((radius*50/newRadius), 0.0));
                points = [
                    outputPortLoc.port,
                    ...CalculateMidPoints(p1, p2, [0.0, midPercent, 1.0]),
                    inputPortLoc.port
                ]
            }
        }
    }

    return <ShapeWrapperComponent points={points} SetCursorStyle={props.SetCursorStyle}/>
}