import {Shape} from "react-konva";

import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage';
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { Vector2D } from '@compx/common/Types';
import {CalculatePortLocation} from "../../utils";


type MouseDraggingPortType = {
    block: VisualBlockStorageType<any, any>,
    isOutput: boolean,
    portInd: number,
    mouseLoc: Vector2D
}

type StaticEdgeBlockType = { edge: VisualEdgeStorageType<any> }

type PropType = (MouseDraggingPortType | StaticEdgeBlockType) & {
    canvasTranslation: Vector2D, canvasZoom: number, screenSize: Vector2D
};

export default (props: PropType) => {
    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                let points: Vector2D[] = []
                const radius = 20*props.canvasZoom;

                // @ts-ignore
                if (props.edge === undefined) {
                    const portLoc = CalculatePortLocation(
                        // @ts-ignore
                        props.block, props.isOutput, props.portInd,
                        props.canvasTranslation, props.canvasZoom, props.screenSize
                    )
                    const gap = Vector2D.subtract(
                        // @ts-ignore
                        props.isOutput?props.mouseLoc:portLoc, props.isOutput?portLoc:props.mouseLoc
                    );

                    // @ts-ignore
                    if (props.isOutput) {
                        points = [
                            portLoc,
                            Vector2D.add(portLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)),
                            Vector2D.add(Vector2D.add(portLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)), new Vector2D(0, gap.y)),
                            // @ts-ignore
                            props.mouseLoc
                        ]
                    } else {
                        points = [
                            portLoc,
                            Vector2D.subtract(portLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)),
                            Vector2D.subtract(Vector2D.subtract(portLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)), new Vector2D(0, gap.y)),
                            // @ts-ignore
                            props.mouseLoc
                        ]
                    }
                }

                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i ++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.fillStrokeShape(shape);




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

            }}
            stroke="white"
            strokeWidth={2}
        />
    );
};


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
//