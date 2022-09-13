import Konva from "konva";

import { ScreenToWorld } from "../../../helpers";

import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage'
import { DirectionType, Vector2D } from '@compx/common/Types';
import { LinearInterp } from '@compx/common/Helpers/Other';

export const CalculateScreenBlockSizeAndPosition = (
    canvasTranslation: Vector2D, canvasZoom: number, screenSize: Vector2D, blockSize: Vector2D, blockPosition: Vector2D
): {size: Vector2D, position: Vector2D} =>
{
    const width = blockSize.x * canvasZoom;
    const height = blockSize.y * canvasZoom;

    const x = (screenSize.x/2.0) + canvasTranslation.x - (0.5*width) + (blockPosition.x * canvasZoom);
    const y = (screenSize.y/2.0) + canvasTranslation.y - (0.5*height) - (blockPosition.y * canvasZoom);
    return { size: new Vector2D(width, height), position: new Vector2D(x, y) };
}

export const CalculatePortLocation = (
    block: VisualBlockStorageType<any, any>, isOutput: boolean, portInd: number,
    canvasTranslation: Vector2D, canvasZoom: number, screenSize: Vector2D
): {block: ReturnType<typeof CalculateScreenBlockSizeAndPosition>, port: Vector2D} => {
    const blockPos = CalculateScreenBlockSizeAndPosition(
        canvasTranslation, canvasZoom, screenSize, block.size, block.position
    );
    const vertDist = blockPos.size.y / ((isOutput?block.outputPorts.length:block.inputPorts.length) + 1);
    const x = blockPos.position.x + (isOutput?blockPos.size.x:0.0);
    const y = blockPos.position.y + (vertDist * (portInd+1));
    return { block: blockPos, port: new Vector2D(x, y) }
}

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

type MouseOnBlockType = { mouseOn: "BLOCK" } | { mouseOn: "EDGE" } |
    { mouseOn: "BLOCK_EDGE", direction: DirectionType } |
    { mouseOn: "PORT", block: VisualBlockStorageType<any, any>, portInd: number, isOutput: boolean, mouseLocation?: Vector2D};
type MouseOnObjects = MouseOnBlockType["mouseOn"];
export type MouseOnBlockExtracted<T extends MouseOnObjects> = Extract<MouseOnBlockType, { mouseOn: T }>;

export type ArrowDirectionType = "ew" | "ns" | "nesw" | "nwse";