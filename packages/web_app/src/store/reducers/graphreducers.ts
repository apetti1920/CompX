import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import {ActionPayloadType, StateType} from "../types";
import {
    MovedBlockActionType, SelectedBlockActionType, DeselectedBlockActionType,
    ResizedBlockActionType, AddEdgeActionType
} from "../actions/actiontypes";

import { Vector2D, DirectionType } from '@compx/common/Types';
import { PortTypes } from '@compx/common/Graph/Port';
import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage'
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';

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
            const resizeDirection: DirectionType = action.payload['resizeDirection'];
            let delta: Vector2D = action.payload['delta'];

            let sizeMultiplier = new Vector2D(1.0, 1.0);
            switch (resizeDirection) {
                case "e":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(1.0, 0.0));
                    break;
                case "s":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(0.0, -1.0));
                    sizeMultiplier = new Vector2D(1.0, -1.0);
                    break;
                case "w":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(-1.0, 0.0));
                    sizeMultiplier = new Vector2D(-1.0, 1.0);
                    break;
                case "n":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(0.0, 1.0));
                    break;
                case "ne":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(1.0, 1.0));
                    break;
                case "se":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(1.0, -1.0));
                    sizeMultiplier = new Vector2D(1.0, -1.0);
                    break;
                case "sw":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(-1.0, -1.0));
                    sizeMultiplier = new Vector2D(-1.0, -1.0);
                    break;
                case "nw":
                    delta = Vector2D.multiplyVec(delta, new Vector2D(-1.0, 1.0));
                    sizeMultiplier = new Vector2D(-1.0, 1.0);
                    break;
                default:
                    return tempState;
            }

            const blockInd = tempState.currentGraph.blocks.findIndex(block => block.selected);
            if (blockInd === undefined) return tempState;

            tempState.currentGraph.blocks[blockInd].position =
                Vector2D.add(tempState.currentGraph.blocks[blockInd].position, Vector2D.multiplyVec(delta, Vector2D.multiply(sizeMultiplier, 0.5)));
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
        } case (AddEdgeActionType): {
            const tempState  = _.cloneDeep(state);

            // Block creation sanity checks
            const outputBlock: VisualBlockStorageType<any, any> | undefined = action.payload['output']['block'];
            const inputBlock: VisualBlockStorageType<any, any> | undefined  = action.payload['input']['block'];
            if (outputBlock === undefined || inputBlock === undefined) return tempState;
            if (outputBlock.id === inputBlock.id) return tempState;

            // Port creation sanity checks
            const outputPortInd: number | undefined = action.payload['output']['portInd'];
            const inputPortInd: number | undefined = action.payload['input']['portInd'];
            if (outputPortInd === undefined || inputPortInd === undefined) return tempState;
            if (outputPortInd < 0 || outputPortInd >= outputBlock.outputPorts.length) return tempState;
            if (inputPortInd < 0 || inputPortInd >= inputBlock.inputPorts.length) return tempState;

            // Get the ports and ensure they're the same type
            const outputPort = outputBlock.outputPorts[outputPortInd];
            const inputPort = inputBlock.inputPorts[inputPortInd];
            if (outputPort === undefined || inputPort === undefined || outputPort.type !== inputPort.type)
                return tempState;

            // Check if the edge already exists
            // or if an edge already exists going to an input (1 edge per input)
            if (tempState.currentGraph.edges.find(e => (
                (e.output.blockID === outputBlock.id && e.output.portID === outputPort.id &&
                e.input.blockID === inputBlock.id && e.input.portID === inputPort.id) ||
                (e.input.blockID === inputBlock.id && e.input.portID === inputPort.id)
            )) !== undefined)
                return tempState

            // Create the edge
            const edge: VisualEdgeStorageType<keyof PortTypes> = {
                visualName: "", type: outputPort.type, id: uuidv4(),
                output: { blockID: outputBlock.id, portID: outputPort.id },
                input:  { blockID: inputBlock.id, portID: inputPort.id },
                midPoints: []
            }
            tempState.currentGraph.edges.push(edge);

            return tempState;
        } default: {
                return state
        }
    }
}

export default GraphReducer;