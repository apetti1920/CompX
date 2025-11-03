import { CanvasReducerName, GraphReducerName } from './actionnames';

// Graph Reducer Strings
export const UpdateLibraryActionType = `@@${GraphReducerName}/UPDATED_LIBRARY`;
export const LoadLibraryBlocksActionType = `@@${GraphReducerName}/LOAD_LIBRARY_BLOCKS`;
export const AddBlockActionType = `@@${GraphReducerName}/ADD_BLOCK`;
export const MovedBlockActionType = `@@${GraphReducerName}/MOVED_BLOCK`;
export const ResizedBlockActionType = `@@${GraphReducerName}/RESIZED_BLOCK`;
export const SelectedObjectActionType = `@@${GraphReducerName}/SELECTED_OBJECT`;
export const DeselectedObjectActionType = `@@${GraphReducerName}/DESELECTED_OBJECT`;
export const DeletedObjectActionType = `@@${GraphReducerName}/DELETED_OBJECT`;
export const AddEdgeActionType = `@@${GraphReducerName}/ADD_EDGE`;
export const MovedEdgeActionType = `@@${GraphReducerName}/MOVED_EDGE`;
export const AddEdgeSplitActionType = `@@${GraphReducerName}/ADD_EDGE_SPLIT`;
export const RemoveEdgeSplitActionType = `@@${GraphReducerName}/REMOVED_EDGE_SPLIT`;
export const UpdateVisualizationDataActionType = `@@${GraphReducerName}/UPDATE_VISUALIZATION_DATA`;

// Canvas Reducer Strings
export const TranslatedCanvasActionType = `@@${CanvasReducerName}/TRANSLATED_CANVAS`;
export const ZoomedCanvasActionType = `@@${CanvasReducerName}/ZOOMED_CANVAS`;
