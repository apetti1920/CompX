/**
 * ElectronBlockService
 * IPC-based block library service for Electron desktop application
 */

import { BlockDefinition } from '@compx/common';
import { BlockService } from './interface';
import {
  BlockSearchQuery,
  LibraryChangeEvent,
  BlockPackInstallResult,
  BlockPackUninstallResult,
  BlockServiceError,
  BlockServiceErrorCode
} from './types';

/**
 * IPC channel names for block library communication
 */
const IPC_CHANNELS = {
  GET_ALL: 'block-library:get-all',
  GET_BLOCK: 'block-library:get',
  SEARCH: 'block-library:search',
  CHANGED: 'block-library:changed',
  ERROR: 'block-library:error',
  INSTALL_PACK: 'block-library:install-pack',
  UNINSTALL_PACK: 'block-library:uninstall-pack'
} as const;

/**
 * Electron IPC renderer interface
 * (Minimal interface to avoid direct electron dependency)
 */
interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
  on(channel: string, listener: (event: any, ...args: any[]) => void): void;
  removeListener(channel: string, listener: (...args: any[]) => void): void;
}

/**
 * ElectronBlockService implementation
 *
 * Communicates with Electron main process via IPC to access the block library.
 * Provides real-time updates through IPC event listeners.
 *
 * @example
 * ```typescript
 * const service = new ElectronBlockService(window.electron.ipcRenderer);
 * const blocks = await service.getAvailableBlocks();
 * ```
 */
export class ElectronBlockService implements BlockService {
  private ipc: IpcRenderer;
  private changeListeners: Set<(event: LibraryChangeEvent) => void> = new Set();
  private ipcChangeHandler: ((event: any, changeEvent: LibraryChangeEvent) => void) | null = null;

  /**
   * Create a new ElectronBlockService
   *
   * @param ipcRenderer - Electron IPC renderer instance
   *
   * @example
   * ```typescript
   * // In Electron renderer process
   * const { ipcRenderer } = require('electron');
   * const service = new ElectronBlockService(ipcRenderer);
   * ```
   */
  constructor(ipcRenderer: IpcRenderer) {
    this.ipc = ipcRenderer;
    this.setupIpcListeners();
  }

  /**
   * Set up IPC event listeners for library changes
   * @private
   */
  private setupIpcListeners(): void {
    // Create bound handler for IPC events
    this.ipcChangeHandler = (_event: any, changeEvent: LibraryChangeEvent) => {
      // Notify all registered listeners
      this.changeListeners.forEach((callback) => {
        try {
          callback(changeEvent);
        } catch (error) {
          console.error('Error in library change listener:', error);
        }
      });
    };

    // Register IPC listener
    this.ipc.on(IPC_CHANNELS.CHANGED, this.ipcChangeHandler);
  }

  /**
   * Clean up IPC listeners (call when service is no longer needed)
   */
  public dispose(): void {
    if (this.ipcChangeHandler) {
      this.ipc.removeListener(IPC_CHANNELS.CHANGED, this.ipcChangeHandler);
      this.ipcChangeHandler = null;
    }
    this.changeListeners.clear();
  }

  /**
   * Get all available blocks from the library
   */
  async getAvailableBlocks(): Promise<BlockDefinition[]> {
    try {
      const blocks = await this.ipc.invoke(IPC_CHANNELS.GET_ALL);
      return blocks;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to get available blocks: ${(error as Error).message}`,
        BlockServiceErrorCode.IPC_ERROR,
        error
      );
    }
  }

  /**
   * Get a specific block by name
   */
  async getBlock(name: string): Promise<BlockDefinition | null> {
    try {
      const block = await this.ipc.invoke(IPC_CHANNELS.GET_BLOCK, name);
      return block;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to get block '${name}': ${(error as Error).message}`,
        BlockServiceErrorCode.IPC_ERROR,
        error
      );
    }
  }

  /**
   * Search for blocks matching query criteria
   */
  async searchBlocks(query: BlockSearchQuery): Promise<BlockDefinition[]> {
    try {
      const blocks = await this.ipc.invoke(IPC_CHANNELS.SEARCH, query);
      return blocks;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to search blocks: ${(error as Error).message}`,
        BlockServiceErrorCode.IPC_ERROR,
        error
      );
    }
  }

  /**
   * Subscribe to library change events
   *
   * @param callback - Function to call when library changes
   * @returns Unsubscribe function
   */
  onLibraryChanged(callback: (event: LibraryChangeEvent) => void): () => void {
    this.changeListeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.changeListeners.delete(callback);
    };
  }

  /**
   * Install a block pack (IPC call to main process)
   *
   * @param packUrl - URL or file path to block pack
   * @returns Installation result
   */
  async installBlockPack(packUrl: string): Promise<BlockPackInstallResult> {
    try {
      const result = await this.ipc.invoke(IPC_CHANNELS.INSTALL_PACK, packUrl);
      return result;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to install block pack: ${(error as Error).message}`,
        BlockServiceErrorCode.PACK_INSTALL_ERROR,
        error
      );
    }
  }

  /**
   * Uninstall a block pack (IPC call to main process)
   *
   * @param packName - Name of the pack to uninstall
   * @returns Uninstallation result
   */
  async uninstallBlockPack(packName: string): Promise<BlockPackUninstallResult> {
    try {
      const result = await this.ipc.invoke(IPC_CHANNELS.UNINSTALL_PACK, packName);
      return result;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to uninstall block pack: ${(error as Error).message}`,
        BlockServiceErrorCode.PACK_UNINSTALL_ERROR,
        error
      );
    }
  }
}
