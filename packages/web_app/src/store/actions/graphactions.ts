import {
    MovedBlockActionType,
    SelectedObjectActionType,
    DeselectedObjectActionType,
    ResizedBlockActionType,
    AddEdgeActionType,
    MovedEdgeActionType
} from './actiontypes';

import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import { Vector2D, DirectionType } from '@compx/common/Types';
import {ActionPayloadType, ActionType, SelectableItemTypes} from "../types";

// Action to select a block
export const SelectObjectAction: ActionType = (
    objectId: string, objectType: SelectableItemTypes,
    selectMultiple: boolean
): ActionPayloadType => ({
    type: SelectedObjectActionType,
    payload: {objectId: objectId, objectType: objectType, selectMultiple: selectMultiple}
});

// Action to deselect a block
export const DeselectObjectsAction: ActionType = (): ActionPayloadType => ({
    type: DeselectedObjectActionType,
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
    output: {block: VisualBlockStorageType<any, any>, portInd: number},
    input:  {block: VisualBlockStorageType<any, any>, portInd: number}
): ActionPayloadType => ({
    type: AddEdgeActionType,
    payload: { output: output, input: input }
});

// Creates the Payload type and action to move am edge in a graph
export const MovedEdgeAction: ActionType = (edgePieceInd: number, delta: number): ActionPayloadType => ({
    type: MovedEdgeActionType,
    payload: {edgePieceInd: edgePieceInd, delta: delta}
});

