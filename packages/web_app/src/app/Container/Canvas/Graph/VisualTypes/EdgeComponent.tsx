import {Shape} from "react-konva";

import { Vector2D } from '@compx/common/Types';

export default (props: { inputPortLoc: Vector2D, outputPortLoc: Vector2D, zoomLevel: number, dragging?: boolean }) => {
    // const dragging = props.dragging!==undefined?props.dragging:false;

    return (
        <Shape
            sceneFunc={(context, shape) => {
                const gap = Vector2D.subtract(props.inputPortLoc, props.outputPortLoc);
                const radius = 20*props.zoomLevel;

                context.beginPath();
                context.moveTo(props.outputPortLoc.x, props.outputPortLoc.y);

                if (gap.x / 2 >= 2*radius) {
                    context.lineTo(props.outputPortLoc.x + gap.x / 2 - radius, props.outputPortLoc.y);
                    context.quadraticCurveTo(
                        props.outputPortLoc.x + gap.x / 2, props.outputPortLoc.y,
                        props.outputPortLoc.x + gap.x / 2, props.outputPortLoc.y + radius
                    );
                    context.lineTo(props.outputPortLoc.x + gap.x / 2, props.inputPortLoc.y - radius);

                    if (gap.x / 2 >= 2*radius) {
                        context.quadraticCurveTo(
                            props.outputPortLoc.x + gap.x / 2, props.inputPortLoc.y,
                            props.outputPortLoc.x + gap.x / 2 + radius, props.inputPortLoc.y
                        );
                        context.lineTo(props.inputPortLoc.x, props.inputPortLoc.y);
                    } else {
                        context.quadraticCurveTo(
                            props.outputPortLoc.x + gap.x / 2, props.inputPortLoc.y,
                            props.inputPortLoc.x, props.inputPortLoc.y
                        );
                    }
                } else {
                    context.lineTo(props.outputPortLoc.x + radius, props.outputPortLoc.y);
                    context.quadraticCurveTo(
                        props.outputPortLoc.x + 2*radius, props.outputPortLoc.y,
                        props.outputPortLoc.x + 2*radius, props.outputPortLoc.y + radius
                    );
                    context.lineTo(props.outputPortLoc.x + 2*radius, props.inputPortLoc.y - radius);

                    if (gap.x / 2 >= 0) {
                        context.quadraticCurveTo(
                            props.outputPortLoc.x + 2*radius, props.inputPortLoc.y,
                            props.inputPortLoc.x, props.inputPortLoc.y
                        );
                    } else {
                        context.quadraticCurveTo(
                            props.outputPortLoc.x + 2*radius, props.inputPortLoc.y,
                            props.outputPortLoc.x + radius, props.inputPortLoc.y
                        );
                        context.lineTo(props.inputPortLoc.x, props.inputPortLoc.y);
                    }
                }
                // else {
                //     context.quadraticCurveTo(
                //         props.outputPortLoc.x + gap.x / 2, props.inputPortLoc.y,
                //         props.outputPortLoc.x + gap.x / 2 + radius, props.inputPortLoc.y
                //     );
                // }
                // else if (gap.x + 2*radius >= -minGapX) {
                //     context.moveTo(props.outputPortLoc.x, props.outputPortLoc.y);
                //     context.lineTo(props.outputPortLoc.x + minGapX, props.outputPortLoc.y);
                //     context.quadraticCurveTo(
                //         props.outputPortLoc.x + 2*minGapX, props.outputPortLoc.y,
                //         props.outputPortLoc.x + 2*minGapX, props.outputPortLoc.y + dir * minGapX
                //     );
                //     context.lineTo(props.outputPortLoc.x + 2*minGapX, props.inputPortLoc.y - minGapX);
                //     // context.quadraticCurveTo(
                //     //     props.outputPortLoc.x + 2*minGapX, props.inputPortLoc.y,
                //     //     props.outputPortLoc.x + minGapX, props.inputPortLoc.y
                //     // );
                //     // context.lineTo(props.inputPortLoc.x, props.inputPortLoc.y);
                // }
                context.fillStrokeShape(shape);
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