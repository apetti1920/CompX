import {Shape} from "react-konva";

import { Vector2D } from '@compx/common/Types';

export default (props: { inputPortLoc: Vector2D, outputPortLoc: Vector2D, zoomLevel: number, startedFrom?: "input"|"output" }) => {
    return (
        <Shape
            sceneFunc={(ctx, shape) => {
                const radius = 20*props.zoomLevel;
                const gap = Vector2D.subtract(props.inputPortLoc, props.outputPortLoc);

                let points: Vector2D[];
                if (props.startedFrom === "output") {
                    points = [
                        props.outputPortLoc,
                        Vector2D.add(props.outputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)),
                        Vector2D.add(Vector2D.add(props.outputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)), new Vector2D(0, gap.y)),
                        props.inputPortLoc
                    ]
                } else if (props.startedFrom === "input") {
                    points = [
                        props.inputPortLoc,
                        Vector2D.subtract(props.inputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)),
                        Vector2D.subtract(Vector2D.subtract(props.inputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)), new Vector2D(0, gap.y)),
                        props.outputPortLoc
                    ]
                } else {
                    points = [
                        props.outputPortLoc,
                        Vector2D.add(props.outputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0)),
                        Vector2D.subtract(props.inputPortLoc, new Vector2D(Math.max(gap.x/2.0, radius), 0.0)),
                        props.inputPortLoc
                    ]
                }

                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i ++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.fillStrokeShape(shape);
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