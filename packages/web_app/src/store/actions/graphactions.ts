import {
    MovedBlockActionType, SelectedBlockActionType, DeselectedBlockActionType, ResizedBlockActionType, AddEdgeActionType
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
    resizeDirection: DirectionType, delta: Vector2D
): ActionPayloadType => ({
    type: ResizedBlockActionType,
    payload: { resizeDirection: resizeDirection, delta: delta }
});

// Creates the payload to Add an Edge
export const AddedEdgeAction: ActionType = (
    output: {blockID: string, portID: string}, input: {blockID: string, portID: string}
): ActionPayloadType => ({
    type: AddEdgeActionType,
    payload: { output: output, input: input }
});

