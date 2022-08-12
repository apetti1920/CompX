import {
    MovedBlockActionType, SelectedBlockActionType, DeselectedBlockActionType, ResizedBlockActionType
} from './actiontypes';
import { Vector2D, DirectionType } from '@compx/common/Types';
import {ActionPayloadType, ActionType} from "../types";

// Action to select a block
export const SelectBlockAction: ActionType = (blockId: string, selectMultiple: boolean): ActionPayloadType => ({
    type: SelectedBlockActionType,
    payload: {blockId: blockId, selectMultiple: selectMultiple}
});

// Action to deselect a block
export const DeselectBlockAction: ActionType = (): ActionPayloadType => ({
    type: DeselectedBlockActionType,
    payload: {}
});

// Creates the Payload type and action to move a block in a graph
export const MovedBlocksAction: ActionType = (delta: Vector2D): ActionPayloadType => ({
    type: MovedBlockActionType,
    payload: {delta: delta}
});

// Creates the Payload type and action to resize a block in a graph
export const ResizedBlocksAction: ActionType = (
    blockId: string, resizeDirection: DirectionType, delta: Vector2D
): ActionPayloadType => ({
    type: ResizedBlockActionType,
    payload: { blockId: blockId, resizeDirection: resizeDirection, delta: delta }
});

