import {Shape} from "react-konva";

import { Vector2D } from '@compx/common/Types';

const RADIUS = 20;

export default (props: { points: Vector2D[], zoomLevel: number }) => {
    return (
        <Shape
            points={props.points.map(p => [p.x, p.y]).flat()}
            sceneFunc={(context, shape) => {
                const width = props.points[1].x - props.points[0].x;
                const height = props.points[1].y - props.points[0].y;
                const arrowSize = 5/props.zoomLevel;
                const dir = Math.sign(height);
                const radius = Math.min(RADIUS, Math.abs(height / 2), Math.abs(width / 2));

                context.beginPath();

                // Arrow 1
                context.moveTo(props.points[0].x, props.points[0].y);
                context.lineTo(props.points[0].x+(arrowSize*Math.cos(Math.PI/4)), props.points[0].x+(arrowSize*Math.sin(Math.PI/4)));
                context.moveTo(props.points[0].x, props.points[0].y);
                context.lineTo(props.points[0].x+(arrowSize*Math.cos(7*Math.PI/4)), props.points[0].x+(arrowSize*Math.sin(7*Math.PI/4)));

                context.moveTo(props.points[0].x, props.points[0].y);
                context.lineTo(props.points[0].x + width / 2 - RADIUS, props.points[0].y);
                context.quadraticCurveTo(
                    props.points[0].x + width / 2,
                    props.points[0].y,
                    props.points[0].x + width / 2,
                    props.points[0].y + dir * radius
                );
                context.lineTo(props.points[0].x + width / 2, props.points[1].y - dir * radius);
                context.quadraticCurveTo(
                    props.points[0].x + width / 2,
                    props.points[1].y,
                    props.points[0].x + width / 2 + radius,
                    props.points[1].y
                );
                context.lineTo(props.points[1].x, props.points[1].y);
                context.fillStrokeShape(shape);
            }}
            stroke="white"
            strokeWidth={2}
        />
    );
};