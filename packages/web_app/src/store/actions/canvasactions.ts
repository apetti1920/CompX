// eslint-disable-next-line import/no-unresolved,@typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { Vector2D } from 'compx_common/Types';

import { ActionPayloadType, ActionType } from '../types';
import { TranslatedCanvasActionType, ZoomedCanvasActionType } from './actiontypes';

// Creates the Payload type and action to translate the canvas by a delta
export const TranslatedCanvasAction: ActionType = (point: Vector2D): ActionPayloadType => ({
  type: TranslatedCanvasActionType,
  payload: { point: point }
});

// Creates the Payload type and action to translate the canvas by a delta
export const ZoomedCanvasAction = (delta: number, around: Vector2D): ActionPayloadType => ({
  type: ZoomedCanvasActionType,
  payload: { delta: delta, around: around }
});
