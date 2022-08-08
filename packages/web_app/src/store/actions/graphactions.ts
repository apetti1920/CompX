import { MovedBlockActionType, SelectedBlockActionType, DeselectedBlockActionType } from './actiontypes';
import { PointType } from '@compx/common/Types';
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
export const MovedBlocksAction: ActionType = (delta: PointType): ActionPayloadType => ({
    type: MovedBlockActionType,
    payload: {delta: delta}
});

