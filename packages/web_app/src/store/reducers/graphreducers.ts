import _ from 'lodash';

import {ActionPayloadType, StateType} from "../types";
import { MovedBlockActionType, SelectedBlockActionType, DeselectedBlockActionType } from "../actions/actiontypes";
import { PointType } from '@compx/common/Types';

function GraphReducer(state: StateType, action: ActionPayloadType): StateType {
    switch (action.type) {
        case (MovedBlockActionType): {
            const tempState  = _.cloneDeep(state);
            const delta: PointType = action.payload['delta'];

            // Loop through to change position of all the selected blocks
            tempState.currentGraph.blocks.filter(block => block.selected).forEach(block => block.position = {
                x: block.position.x + delta.x,
                y: block.position.y + delta.y
            });

            return tempState;
        } case (SelectedBlockActionType): {
            let tempState  = _.cloneDeep(state);
            const blockId = action.payload['blockId'];
            const selectMultiple = action.payload['selectMultiple']

            const blockInd = tempState.currentGraph.blocks.findIndex(block => block.id === blockId);
            if (!selectMultiple) {
                tempState = GraphReducer(tempState, {type: DeselectedBlockActionType, payload: {}});
                tempState.currentGraph.blocks[blockInd].selected = true;
            } else {
                tempState.currentGraph.blocks[blockInd].selected = !tempState.currentGraph.blocks[blockInd].selected;
            }

            return tempState;
        } case (DeselectedBlockActionType): {
            const tempState  = _.cloneDeep(state);
            tempState.currentGraph.blocks.forEach(block => block.selected = false);
            return tempState;
        } default: {
                return state
        }
    }
}

export default GraphReducer;