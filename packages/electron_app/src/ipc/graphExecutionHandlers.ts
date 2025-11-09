/**
 * Graph Execution IPC Handlers
 *
 * Registers IPC channels for graph execution and visualization data
 * between renderer process and main process
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import Graph from '../../../common/src/Graph/Graph';
import { GraphStorageType } from '../../../common/src/Network/GraphItemStorage/GraphStorage';
import { VisualizationData } from '../../../common/src/Network/GraphItemStorage/BlockStorage';

/**
 * IPC channel names for graph execution
 */
export const GRAPH_EXECUTION_CHANNELS = {
  GET_VISUALIZATION_DATA: 'graph-execution:get-visualization-data',
  GET_BLOCK_VISUALIZATION_DATA: 'graph-execution:get-block-visualization-data',
  EXECUTE: 'graph-execution:execute'
} as const;

/**
 * Global graph instance (managed by the main process)
 * This should be set when the graph is loaded/created
 */
let graphInstance: Graph | null = null;

/**
 * Set the graph instance for execution
 * @param graph - The graph instance to use for execution
 */
export function setGraphInstance(graph: Graph | null): void {
  graphInstance = graph;
}

/**
 * Get the current graph instance
 * @returns The current graph instance or null
 */
export function getGraphInstance(): Graph | null {
  return graphInstance;
}

/**
 * Setup graph execution IPC handlers
 */
export function setupGraphExecutionHandlers(): void {
  console.log('Setting up graph execution IPC handlers...');

  /**
   * Get visualization data for all blocks with visualization enabled
   */
  ipcMain.handle(
    GRAPH_EXECUTION_CHANNELS.GET_VISUALIZATION_DATA,
    async (event: IpcMainInvokeEvent): Promise<Record<string, VisualizationData>> => {
      try {
        if (!graphInstance) {
          console.warn('IPC: GET_VISUALIZATION_DATA - No graph instance available');
          return {};
        }

        const visualizationData = graphInstance.GetVisualizationData();
        console.log(`IPC: GET_VISUALIZATION_DATA - Returning data for ${Object.keys(visualizationData).length} blocks`);
        return visualizationData;
      } catch (error) {
        console.error('IPC: GET_VISUALIZATION_DATA - Error:', error);
        throw error;
      }
    }
  );

  /**
   * Get visualization data for a specific block
   */
  ipcMain.handle(
    GRAPH_EXECUTION_CHANNELS.GET_BLOCK_VISUALIZATION_DATA,
    async (event: IpcMainInvokeEvent, blockId: string): Promise<VisualizationData | undefined> => {
      try {
        if (!graphInstance) {
          console.warn('IPC: GET_BLOCK_VISUALIZATION_DATA - No graph instance available');
          return undefined;
        }

        const visualizationData = graphInstance.GetBlockVisualizationData(blockId);
        if (visualizationData) {
          console.log(`IPC: GET_BLOCK_VISUALIZATION_DATA - Returning data for block ${blockId}`);
        } else {
          console.log(`IPC: GET_BLOCK_VISUALIZATION_DATA - No visualization data for block ${blockId}`);
        }
        return visualizationData;
      } catch (error) {
        console.error(`IPC: GET_BLOCK_VISUALIZATION_DATA - Error for block ${blockId}:`, error);
        throw error;
      }
    }
  );

  /**
   * Execute the graph
   */
  ipcMain.handle(
    GRAPH_EXECUTION_CHANNELS.EXECUTE,
    async (
      event: IpcMainInvokeEvent,
      graphStorage: GraphStorageType,
      T: number | 'infinite',
      dt: number,
      libraryBlocks?: Array<{ name: string; visualization?: any; metaParameters?: any }>
    ): Promise<void> => {
      try {
        if (!graphInstance) {
          console.warn('IPC: EXECUTE - No graph instance available, creating new one');
          graphInstance = new Graph(graphStorage);
        } else {
          // Update graph from storage if needed
          // For now, we'll recreate it from storage
          graphInstance = new Graph(graphStorage);
        }

        // Set visualization config and meta parameter definitions on blocks from library blocks
        if (libraryBlocks) {
          graphInstance.blocks.forEach((block) => {
            const libraryBlock = libraryBlocks.find((lb) => lb.name === block.name);
            if (libraryBlock) {
              // Set visualization config if present
              if (libraryBlock.visualization) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (block as any).visualizationConfig = libraryBlock.visualization;
                // Initialize visualization data buffers
                block.InitializeVisualization();
              }
              // Set meta parameter definitions if present
              if (libraryBlock.metaParameters) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (block as any).metaParameterDefinitions = libraryBlock.metaParameters;
                // Recreate the callback to ensure it has the correct signature with params
                // This is necessary because the callback was created before metaParameterDefinitions were set
                block.SetCallback(block.callbackString);
              }
            }
          });
        }

        console.log(`IPC: EXECUTE - Executing graph with T=${T}, dt=${dt}`);
        graphInstance.Execute(T, dt);
        console.log('IPC: EXECUTE - Execution complete');
      } catch (error) {
        console.error('IPC: EXECUTE - Error:', error);
        throw error;
      }
    }
  );

  console.log('Graph execution IPC handlers registered');
}

/**
 * Cleanup graph execution IPC handlers
 */
export function cleanupGraphExecutionHandlers(): void {
  console.log('Cleaning up graph execution IPC handlers...');

  ipcMain.removeHandler(GRAPH_EXECUTION_CHANNELS.GET_VISUALIZATION_DATA);
  ipcMain.removeHandler(GRAPH_EXECUTION_CHANNELS.GET_BLOCK_VISUALIZATION_DATA);
  ipcMain.removeHandler(GRAPH_EXECUTION_CHANNELS.EXECUTE);

  console.log('Graph execution IPC handlers cleaned up');
}
