import { TranslatedCanvasActionType, ZoomedCanvasActionType } from './actiontypes';
import { Vector2D } from '@compx/common/Types';
import { ActionPayloadType, ActionType } from "../types";

// Creates the Payload type and action to translate the canvas by a delta
export const TranslatedCanvasAction: ActionType = (point: Vector2D): ActionPayloadType => ({
    type: TranslatedCanvasActionType,
    payload: {point: point}
});

// Creates the Payload type and action to translate the canvas by a delta
export const ZoomedCanvasAction = (delta: number, around: Vector2D): ActionPayloadType => ({
    type: ZoomedCanvasActionType,
    payload: { delta: delta, around: around }
});