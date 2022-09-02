import {GraphReducerName, CanvasReducerName} from './actionnames';

// Graph Reducer Strings
export const MovedBlockActionType = `@@${GraphReducerName}/MOVED_BLOCK`;
export const ResizedBlockActionType = `@@${GraphReducerName}/RESIZED_BLOCK`;
export const SelectedBlockActionType = `@@${GraphReducerName}/SELECTED_BLOCK`;
export const DeselectedBlockActionType = `@@${GraphReducerName}/DESELECTED_BLOCK`;
export const AddEdgeActionType = `@@${GraphReducerName}/ADD_EDGE`;

// Canvas Reducer Strings
export const TranslatedCanvasActionType = `@@${CanvasReducerName}/TRANSLATED_CANVAS`;
export const ZoomedCanvasActionType     = `@@${CanvasReducerName}/ZOOMED_CANVAS`;