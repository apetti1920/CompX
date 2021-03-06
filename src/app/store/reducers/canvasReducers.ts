import {ActionType, SidebarButtonType, StateType} from "../types";
import {
    MovedCanvasActionType,
    ZoomedCanvasActionType,
    ClickedSidebarButtonActionType,
    MovedSplitPaneActionType, MouseActionType, DraggingLibraryBlockActionType
} from "../types/actionTypes";

const _ = require('lodash');

export default function(state: StateType, action: ActionType): StateType {
    switch (action.type) {
        case MovedCanvasActionType: {
            const newTranslation = action.payload['newTranslation'];
            const tempState = _.cloneDeep(state);
            tempState.canvas.translation = newTranslation;
            return tempState
        } case ZoomedCanvasActionType: {
            const newZoom = action.payload['newZoom'];
            const tempState = _.cloneDeep(state);
            tempState.canvas.zoom = newZoom;
            return tempState;
        } case ClickedSidebarButtonActionType: {
            const tempState = _.cloneDeep(state);
            for (let i=0; i<tempState.canvas.sidebarButtons.length; i++) {
                if (tempState.canvas.sidebarButtons[i].groupId === action.payload['group']) {
                    if (tempState.canvas.sidebarButtons[i].buttonId === action.payload['id']) {
                        tempState.canvas.sidebarButtons[i].selected = !tempState.canvas.sidebarButtons[i].selected
                    } else {
                        tempState.canvas.sidebarButtons[i].selected = false;
                    }
                }
            }

            return tempState
        } case MovedSplitPaneActionType: {
            const pane = action.payload;
            const tempState = _.cloneDeep(state);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            tempState.canvas.splitSizes[pane['name']] = pane['size'];
            return tempState;
        } case (MouseActionType): {
            const tempState = _.cloneDeep(state);
            tempState.canvas.mouse = action.payload["newMouse"];
            return tempState;
        } case (DraggingLibraryBlockActionType): {
            const tempState = _.cloneDeep(state);
            tempState.canvas.isDraggingFromBlockLibrary = action.payload["draggingState"];
            return tempState;
        } default: {
            return _.cloneDeep(state);
        }
    }
}
