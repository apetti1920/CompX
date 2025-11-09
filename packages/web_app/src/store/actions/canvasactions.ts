import { Vector2D } from '@compx/common/Types';

import {
  TranslatedCanvasActionType,
  ZoomedCanvasActionType,
  SetConfigurationToolbarBlockActionType
} from './actiontypes';
import { ActionPayloadType, ActionType } from '../types';

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

// Action to set which block's configuration toolbar is open (null to close)
export const SetConfigurationToolbarBlockAction: ActionType = (blockId: string | null): ActionPayloadType => ({
  type: SetConfigurationToolbarBlockActionType,
  payload: { blockId }
});
