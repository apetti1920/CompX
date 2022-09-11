import { Shape } from "react-konva";

import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { Vector2D } from '@compx/common/Types';
import { CalculatePortLocation } from "../../utils";
import React from "react";


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
    canvasTranslation: Vector2D, canvasZoom: number, screenSize: Vector2D
};

const ShapeWrapperComponent = (props: {points: Vector2D[]}) => {
    if (props.points.length <= 2) return <React.Fragment/>

    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                ctx.beginPath();
                ctx.moveTo(props.points[0].x, props.points[0].y);
                for (let i = 1; i < props.points.length; i++) {
                    ctx.lineTo(props.points[i].x, props.points[i].y);
                }
                ctx.fillStrokeShape(shape);
            }}
            stroke="white"
            strokeWidth={2}
        />
    )
}

export default (props: PropType) => {
    let radius = 20 * props.canvasZoom;

    // @ts-ignore
    if (props.edge === undefined) {
        let points: Vector2D[];

        const portLoc = CalculatePortLocation(
            // @ts-ignore
            props.block, props.isOutput, props.portInd,
            props.canvasTranslation, props.canvasZoom, props.screenSize
        ).port;
        const gap = Vector2D.subtract(
            // @ts-ignore
            props.isOutput ? props.mouseLoc : portLoc, props.isOutput ? portLoc : props.mouseLoc
        );

        // @ts-ignore
        if (props.isOutput) {
            points = [
                portLoc,
                // @ts-ignore
                Vector2D.add(portLoc, new Vector2D(Math.max(gap.x / 2.0, radius*props.portInd), 0)),
                Vector2D.add(
                    // @ts-ignore
                    Vector2D.add(portLoc, new Vector2D(Math.max(gap.x / 2.0, radius*props.portInd), 0)),
                    new Vector2D(0, gap.y)),
                // @ts-ignore
                props.mouseLoc
            ]
        } else {
            points = [
                portLoc,
                Vector2D.subtract(portLoc, new Vector2D(Math.max(gap.x / 2.0, radius), 0)),
                Vector2D.subtract(
                    Vector2D.subtract(portLoc, new Vector2D(Math.max(gap.x / 2.0, radius), 0)),
                    new Vector2D(0, gap.y)
                ),
                // @ts-ignore
                props.mouseLoc
            ]
        }

        return (
            <ShapeWrapperComponent points={points}/>
        )
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

        const outputLead = radius * (edge.output.portInd+1); const inputLead = radius * (edge.input.portInd+1);
        const gap = (inputPortLoc.port.x - inputLead) - (outputPortLoc.port.x + outputLead);
        const outputLeadPos = Vector2D.add(
            outputPortLoc.port, new Vector2D(Math.max(gap / 2.0, outputLead), 0.0)
        );
        const inputLeadPos = Vector2D.subtract(
            inputPortLoc.port, new Vector2D(Math.max(gap / 2.0, inputLead), 0.0)
        );

        let points: Vector2D[];
        if (inputPortLoc.port.x - inputLead > outputPortLoc.port.x + outputLead) {
            points = [
                outputPortLoc.port,
                outputLeadPos,
                new Vector2D(outputLeadPos.x, inputLeadPos.y),
                inputLeadPos,
                inputPortLoc.port
            ];
        } else {
            const yGap = inputLeadPos.y - outputLeadPos.y
            const pos1 = Vector2D.add(outputLeadPos, new Vector2D(0, yGap / 2.0));

            points = [
                outputPortLoc.port,
                outputLeadPos,
                pos1,
                new Vector2D(inputLeadPos.x, pos1.y),
                inputLeadPos,
                inputPortLoc.port
            ];
        }

        return <ShapeWrapperComponent points={points}/>
    }
}


    // } else {

    //
    //  {
    //     points = [];
    //
    // }
    //
    //     points = [ outputPortLoc, inputPortLoc ];
    // }

    //
    //
    // if (!isDragging) {
    //     points = [
    //         props.outputPortLoc,
    //         Vector2D.add(props.outputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)),
    //         Vector2D.subtract(props.inputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0.0)),
    //         props.inputPortLoc
    //     ]
    // }
    //
    //
    //
    // let points: Vector2D[];
    //  else {
    //
    // }
    //
// };


// const width = props.points[props.points.length-1].x - props.points[0].x;
// const height = props.points[props.points.length-1].y - props.points[0].y;
// const arrowSize = 5/props.zoomLevel;
// const dir = Math.sign(height);
// const radius = Math.min(RADIUS, Math.abs(height / 2), Math.abs(width / 2));
//
//
//
// DrawArrow(
//     context._context,
//     new Vector2D(props.points[0].x + width / 2 - RADIUS, props.points[0].y),
//     props.points[0], 5*props.zoomLevel, "white"
// )

// // DrawArrow(
// //     context._context,
// //     props.points[props.points.length-1],
// //     new Vector2D(props.points[0].x + width / 2, props.points[props.points.length-1].y),
// //     5*props.zoomLevel, "white"
// // )