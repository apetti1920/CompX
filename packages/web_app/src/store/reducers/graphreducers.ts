import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import {ActionPayloadType, StateType} from "../types";
import {
    MovedBlockActionType,
    SelectedObjectActionType,
    DeselectedObjectActionType,
    ResizedBlockActionType,
    AddEdgeActionType,
    MovedEdgeActionType,
    AddEdgeSplitActionType,
    RemoveEdgeSplitActionType,
    DeletedObjectActionType
} from "../actions/actiontypes";

import { Vector2D, DirectionType } from '@compx/common/Types';
import { LinearInterp } from '@compx/common/Helpers/Other'
import { PortTypes } from '@compx/common/Graph/Port';
import { VisualEdgeStorageType } from '@compx/common/Network/GraphItemStorage/EdgeStorage'
import { VisualBlockStorageType } from '@compx/common/Network/GraphItemStorage/BlockStorage';
import {CalculatePortLocation} from "../../app/Container/Canvas/utils";

function GraphReducer(state: StateType, action: ActionPayloadType): StateType {
    switch (action.type) {
        case (MovedBlockActionType): {
            const tempState  = _.cloneDeep(state);
            const delta: Vector2D = action.payload['delta'];

            // Loop through to change position of all the selected blocks
            tempState.currentGraph.graph.blocks.filter(block => tempState.currentGraph.selected
                .filter(s => s.itemType === 'BLOCK')
                .map(s => s.id).includes(block.id)
            ).forEach(block =>
                block.position = new Vector2D(
                    block.position.x + delta.x,
                    block.position.y + delta.y
                )
            );

            return tempState;
        } case (ResizedBlockActionType): {
            let tempState  = _.cloneDeep(state);
            const resizeDirection: DirectionType = action.payload['resizeDirection'];
            let delta: Vector2D = action.payload['delta'];

            const selectedBlocks = tempState.currentGraph.selected.filter(s => s.itemType === 'BLOCK');
            if (selectedBlocks.length !== 1) return tempState;

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

            const blockInd = tempState.currentGraph.graph.blocks.findIndex(block => block.id === selectedBlocks[0].id);
            if (blockInd === undefined) return tempState;

            tempState.currentGraph.graph.blocks[blockInd].position =
                Vector2D.add(
                    tempState.currentGraph.graph.blocks[blockInd].position,
                    Vector2D.multiplyVec(delta, Vector2D.multiply(sizeMultiplier, 0.5))
                );
            tempState.currentGraph.graph.blocks[blockInd].size =
                Vector2D.add(tempState.currentGraph.graph.blocks[blockInd].size, delta);

            return tempState;
        } case (SelectedObjectActionType): {
            let tempState  = _.cloneDeep(state);
            const objectId = action.payload['objectId'];
            const objectType = action.payload['objectType'];
            const selectMultiple = action.payload['selectMultiple'];

            if (!selectMultiple) tempState.currentGraph.selected = [];
            if (objectType === "BLOCK")
                tempState.currentGraph.selected.push({itemType: "BLOCK", id: objectId});
            else if (objectType === "EDGE")
                tempState.currentGraph.selected.push({itemType: "EDGE", id: objectId});

            return tempState;
        } case (DeselectedObjectActionType): {
            const tempState  = _.cloneDeep(state);
            tempState.currentGraph.selected = [];
            return tempState;
        } case (DeletedObjectActionType): {
            const tempState  = _.cloneDeep(state);

            const selectedBlocks = tempState.currentGraph.selected.filter(s => s.itemType === "BLOCK").map(s => s.id);
            const selectedEdges = tempState.currentGraph.selected.filter(s => s.itemType === "EDGE").map(s => s.id);

            tempState.currentGraph.graph.edges = tempState.currentGraph.graph.edges.filter(e =>
                !selectedEdges.includes(e.id) &&
                !selectedBlocks.includes(e.output.blockID) &&
                !selectedBlocks.includes(e.input.blockID)
            );
            tempState.currentGraph.graph.blocks = tempState.currentGraph.graph.blocks.filter(b => !selectedBlocks.includes(b.id));
            tempState.currentGraph.selected = [];

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
            if (tempState.currentGraph.graph.edges.find(e => (
                (e.output.blockID === outputBlock.id && e.output.portID === outputPort.id &&
                e.input.blockID === inputBlock.id && e.input.portID === inputPort.id) ||
                (e.input.blockID === inputBlock.id && e.input.portID === inputPort.id)
            )) !== undefined)
                return tempState

            const outputPortLoc = CalculatePortLocation(
                outputBlock, true, outputPortInd,
                tempState.userStorage.canvas.translation, tempState.userStorage.canvas.zoom, new Vector2D(900, 900)
            )
            const inputPortLoc = CalculatePortLocation(
                inputBlock, false, inputPortInd,
                tempState.userStorage.canvas.translation, tempState.userStorage.canvas.zoom, new Vector2D(900, 900)
            )

            const dir1 = inputPortLoc.port.y >= outputPortLoc.port.y;
            const tmpMidPercent = 0.5 * (((outputPortInd+1) / outputBlock.outputPorts.length) +
                ((inputPortInd+1) / inputBlock.inputPorts.length));
            const midPercentTmp = LinearInterp(tmpMidPercent, 0, 1, dir1?0.75:0.25, dir1?0.25:0.75)

            const newRadius = 20*(1+midPercentTmp)**2; let midPercent: number[]
            if (inputPortLoc.port.x - newRadius >= outputPortLoc.port.x + newRadius) {
                midPercent = [midPercentTmp];
            } else {
                midPercent = [-0.25, midPercentTmp, 1.25]
            }

            // Create the edge
            const edge: VisualEdgeStorageType<keyof PortTypes> = {
                visualName: "", type: outputPort.type, id: uuidv4(),
                output: { blockID: outputBlock.id, portID: outputPort.id },
                input:  { blockID: inputBlock.id, portID: inputPort.id },
                midPoints: midPercent
            }
            tempState.currentGraph.graph.edges.push(edge);

            return tempState;
        } case (MovedEdgeActionType): {
            const tempState  = _.cloneDeep(state);
            const edgePieceInd: number = action.payload['edgePieceInd'];
            const delta: number = action.payload['delta'];

            // Find the selected edgeId
            const selectedEdgeIds = tempState.currentGraph.selected.filter(s => s.itemType === 'EDGE').map(s => s.id);
            if (selectedEdgeIds.length !== 1) return tempState;

            // Find the edge index
            const selectedEdgeInd = tempState.currentGraph.graph.edges.findIndex(edge => edge.id === selectedEdgeIds[0]);
            if (selectedEdgeInd === -1) return tempState;
            if (tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.length === 0)
                tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.push(0.5);
            if (edgePieceInd < 0 || edgePieceInd >= tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.length)
                return tempState;

            tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints[edgePieceInd] += delta;
            return tempState;
        } case (AddEdgeSplitActionType): {
            const tempState  = _.cloneDeep(state);
            const afterEdgePieceInd: number = action.payload['afterEdgePieceInd'];

            // Find the selected edgeId
            const selectedEdgeIds = tempState.currentGraph.selected.filter(s => s.itemType === 'EDGE').map(s => s.id);
            if (selectedEdgeIds.length !== 1) return tempState;

            // Find the edge index
            const selectedEdgeInd = tempState.currentGraph.graph.edges.findIndex(edge => edge.id === selectedEdgeIds[0]);
            if (selectedEdgeInd === -1) return tempState;
            if (tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.length === 0)
                tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.push(0.5);
            if (afterEdgePieceInd < 0 || afterEdgePieceInd >= tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.length)
                return tempState;

            const tempPoints = tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints;

            let next1: number; let next2: number;
            if (tempPoints.length === 1) {
                console.log("case 1");
                next1 = 0.5; next2 = (tempPoints[0]+1.0) / 2.0;
            } else if (afterEdgePieceInd+2 < tempPoints.length) {
                console.log("case 2");
                next1 = ((afterEdgePieceInd-1>=0?tempPoints[afterEdgePieceInd-1]:0.0) + tempPoints[afterEdgePieceInd+1]) / 2.0;
                next2 = (tempPoints[afterEdgePieceInd] + tempPoints[afterEdgePieceInd+2]) / 2.0;
            } else if (afterEdgePieceInd-2 >= 0) {
                console.log("case 3");
                next1 = ((afterEdgePieceInd+1<tempPoints.length?tempPoints[afterEdgePieceInd+1]:1.0) + tempPoints[afterEdgePieceInd-1]) / 2.0;
                next2 = (tempPoints[afterEdgePieceInd] + tempPoints[afterEdgePieceInd-2]) / 2.0;
            } else {
                console.log("case 4");
                next1 = 0.5; next2 = 0.5;
            }

            tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.splice(afterEdgePieceInd+1, 0, next2);
            tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.splice(afterEdgePieceInd+1, 0, next1);
            return tempState;
        } case (RemoveEdgeSplitActionType): {
            const tempState  = _.cloneDeep(state);
            const edgePieceInd: number = action.payload['edgePieceInd'];

            // Find the selected edgeId
            const selectedEdgeIds = tempState.currentGraph.selected.filter(s => s.itemType === 'EDGE').map(s => s.id);
            if (selectedEdgeIds.length !== 1) return tempState;

            // Find the edge index
            const selectedEdgeInd = tempState.currentGraph.graph.edges.findIndex(edge => edge.id === selectedEdgeIds[0]);
            if (selectedEdgeInd === -1) return tempState;
            if (tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.length === 0)
                tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.push(0.5);
            if (edgePieceInd < 0 ||
                edgePieceInd >= tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.length ||
                tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.length < 3
            )
                return tempState;

            tempState.currentGraph.graph.edges[selectedEdgeInd].midPoints.splice(edgePieceInd, 2);
            return tempState;
        } default: {
                return state
        }
    }
}

export default GraphReducer;