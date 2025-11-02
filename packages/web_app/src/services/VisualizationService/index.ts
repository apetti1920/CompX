/**
 * Visualization Service
 *
 * Service for fetching visualization data from the electron main process
 * Handles IPC communication for visualization data
 */

import { VisualizationData } from '@compx/common/Network/GraphItemStorage/BlockStorage';

/**
 * Electron global interface (when running in Electron)
 */
interface ElectronGlobal {
  ipcRenderer?: {
    invoke(channel: string, ...args: any[]): Promise<any>;
  };
}

/**
 * Extended window interface with optional electron property
 */
declare global {
  interface Window {
    electron?: ElectronGlobal;
  }
}

/**
 * Get IPC renderer for Electron environment
 * @returns IPC renderer or null if not available
 */
function getIpcRenderer(): { invoke(channel: string, ...args: any[]): Promise<any> } | null {
  // Try to get IPC renderer from window.electron (preload script)
  if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
    return window.electron.ipcRenderer;
  }

  // Fallback: Try direct require if nodeIntegration is enabled
  if (typeof window !== 'undefined' && typeof (window as any).require === 'function') {
    try {
      const { ipcRenderer } = (window as any).require('electron');
      return ipcRenderer;
    } catch (error) {
      // Ignore error, will return null
    }
  }

  return null;
}

/**
 * Get visualization data for all blocks
 * @returns Map of block ID to visualization data
 */
export async function getVisualizationData(): Promise<Record<string, VisualizationData>> {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    // Electron environment - use IPC
    return await ipcRenderer.invoke('graph-execution:get-visualization-data');
  } else {
    // Web environment - use HTTP API (not implemented yet)
    // For now, return empty object
    console.warn('Visualization data fetching not implemented for web environment');
    return {};
  }
}

/**
 * Get visualization data for a specific block
 * @param blockId - The ID of the block
 * @returns Visualization data for the block, or undefined if not found
 */
export async function getBlockVisualizationData(blockId: string): Promise<VisualizationData | undefined> {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    // Electron environment - use IPC
    return await ipcRenderer.invoke('graph-execution:get-block-visualization-data', blockId);
  } else {
    // Web environment - use HTTP API (not implemented yet)
    console.warn('Visualization data fetching not implemented for web environment');
    return undefined;
  }
}

/**
 * Execute the graph and return visualization data
 * @param graphStorage - The graph storage to execute
 * @param T - Total time or 'infinite'
 * @param dt - Time step
 * @param libraryBlocks - Library blocks with visualization config
 * @returns Visualization data for all blocks
 */
export async function executeGraphAndGetVisualizationData(
  graphStorage: any,
  T: number | 'infinite',
  dt: number,
  libraryBlocks?: Array<{ name: string; visualization?: any }>
): Promise<Record<string, VisualizationData>> {
  const ipcRenderer = getIpcRenderer();
  if (ipcRenderer) {
    // Electron environment - use IPC
    // Execute the graph
    await ipcRenderer.invoke('graph-execution:execute', graphStorage, T, dt, libraryBlocks);

    // Get visualization data after execution
    return await getVisualizationData();
  } else {
    // Web environment - use HTTP API (not implemented yet)
    console.warn('Graph execution not implemented for web environment');
    return {};
  }
}
