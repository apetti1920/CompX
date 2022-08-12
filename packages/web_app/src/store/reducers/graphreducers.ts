import _ from 'lodash';

import {ActionPayloadType, StateType} from "../types";
import {
    MovedBlockActionType, SelectedBlockActionType, DeselectedBlockActionType,
    ResizedBlockActionType
} from "../actions/actiontypes";
import { Vector2D, DirectionType } from '@compx/common/Types';

function GraphReducer(state: StateType, action: ActionPayloadType): StateType {
    switch (action.type) {
        case (MovedBlockActionType): {
            const tempState  = _.cloneDeep(state);
            const delta: Vector2D = action.payload['delta'];

            // Loop through to change position of all the selected blocks
            tempState.currentGraph.blocks.filter(block => block.selected).forEach(block => block.position =
                new Vector2D(
                    block.position.x + delta.x,
                    block.position.y + delta.y
                )
            );

            return tempState;
        } case (ResizedBlockActionType): {
            let tempState  = _.cloneDeep(state);
            const blockId: string = action.payload['blockId'];
            const resizeDirection: DirectionType = action.payload['resizeDirection'];
            let delta: Vector2D = action.payload['delta'];

            tempState = GraphReducer(tempState, {
                type: SelectedBlockActionType, payload: {blockId: blockId, selectMultiple: false}
            });

            switch (resizeDirection) {
                case "e":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(1, 0));
                    break;
                case "s":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(0, 1));
                    break;
                case "w":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(-1, 0));
                    break;
                case "n":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(0, -1));
                    break;
                default:
                    break;
            }

            const blockInd = tempState.currentGraph.blocks.findIndex(block => block.id === blockId);
            tempState.currentGraph.blocks[blockInd].position =
                Vector2D.add(tempState.currentGraph.blocks[blockInd].position, delta);
            tempState.currentGraph.blocks[blockInd].size =
                Vector2D.add(tempState.currentGraph.blocks[blockInd].size, delta);

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