import Konva from "konva";

import {ScreenToWorld} from "../../../helpers";

import { PointType } from '@compx/common/Types';
import { LinearInterp } from '@compx/common/Helpers/Other';

export const WheelHandler = (
    e: Konva.KonvaEventObject<WheelEvent>, onZoom: (delta: number, zoomAround: PointType)=>void,
    canvasTranslation: PointType, canvasZoom: number, screenSize: PointType
) => {
    e.evt.preventDefault();
    let delta = LinearInterp(-e.evt.deltaY, -100, 100, -0.2, 0.2);

    const zoomAround =  ScreenToWorld(
        {x: e.evt.offsetX, y: e.evt.offsetY},
        canvasTranslation, canvasZoom, screenSize
    );

    onZoom(delta, zoomAround);
    e.cancelBubble = true;
}