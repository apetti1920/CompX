import Konva from "konva";

import {ScreenToWorld} from "../../../helpers";

import { Vector2D } from '@compx/common/Types';
import { LinearInterp } from '@compx/common/Helpers/Other';

export const WheelHandler = (
    e: Konva.KonvaEventObject<WheelEvent>, onZoom: (delta: number, zoomAround: Vector2D)=>void,
    canvasTranslation: Vector2D, canvasZoom: number, screenSize: Vector2D
) => {
    e.evt.preventDefault();
    let delta = LinearInterp(-e.evt.deltaY, -100, 100, -0.2, 0.2);

    const zoomAround =  ScreenToWorld(
        new Vector2D(e.evt.offsetX, e.evt.offsetY),
        canvasTranslation, canvasZoom, screenSize
    );

    onZoom(delta, zoomAround);
    e.cancelBubble = true;
}