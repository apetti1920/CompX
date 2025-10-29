/**
 * Block Service IPC Handlers
 *
 * Registers IPC channels for block library communication
 * between renderer process (ElectronBlockService) and main process (BlockManager)
 */

import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { BlockDefinition } from '../../../common/src/BlockSchema/types';
import { getBlockManager, BlockManagerError } from '../services/BlockManager';

/**
 * IPC channel names
 * Must match channels defined in ElectronBlockService
 */
export const IPC_CHANNELS = {
  GET_ALL: 'block-library:get-all',
  GET_BLOCK: 'block-library:get',
  SEARCH: 'block-library:search',
  CHANGED: 'block-library:changed',
  ERROR: 'block-library:error',
  INSTALL_PACK: 'block-library:install-pack',
  UNINSTALL_PACK: 'block-library:uninstall-pack'
} as const;

/**
 * Setup all block service IPC handlers
 *
 * @returns Promise that resolves when handlers are registered and BlockManager is initialized
 */
export async function setupBlockServiceHandlers(): Promise<void> {
  const blockManager = getBlockManager();

  // Initialize block manager (loads blocks from disk)
  await blockManager.initialize();

  console.log('Setting up block service IPC handlers...');

  /**
   * Get all available blocks
   */
  ipcMain.handle(
    IPC_CHANNELS.GET_ALL,
    async (event: IpcMainInvokeEvent): Promise<BlockDefinition[]> => {
      try {
        console.log('IPC: GET_ALL - Fetching all blocks');
        const blocks = await blockManager.getAvailableBlocks();
        console.log(`IPC: GET_ALL - Returning ${blocks.length} blocks`);
        return blocks;
      } catch (error) {
        console.error('IPC: GET_ALL - Error:', error);
        throw error;
      }
    }
  );

  /**
   * Get a specific block by name
   */
  ipcMain.handle(
    IPC_CHANNELS.GET_BLOCK,
    async (event: IpcMainInvokeEvent, blockName: string): Promise<BlockDefinition | null> => {
      try {
        console.log(`IPC: GET_BLOCK - Fetching block: ${blockName}`);
        const block = await blockManager.getBlock(blockName);

        if (block) {
          console.log(`IPC: GET_BLOCK - Found block: ${blockName}`);
        } else {
          console.log(`IPC: GET_BLOCK - Block not found: ${blockName}`);
        }

        return block;
      } catch (error) {
        console.error(`IPC: GET_BLOCK - Error fetching ${blockName}:`, error);
        throw error;
      }
    }
  );

  /**
   * Search blocks by query string
   */
  ipcMain.handle(
    IPC_CHANNELS.SEARCH,
    async (event: IpcMainInvokeEvent, query: string): Promise<BlockDefinition[]> => {
      try {
        console.log(`IPC: SEARCH - Query: "${query}"`);
        const results = await blockManager.searchBlocks(query);
        console.log(`IPC: SEARCH - Found ${results.length} results`);
        return results;
      } catch (error) {
        console.error(`IPC: SEARCH - Error searching for "${query}":`, error);
        throw error;
      }
    }
  );

  /**
   * Install a block pack
   */
  ipcMain.handle(
    IPC_CHANNELS.INSTALL_PACK,
    async (event: IpcMainInvokeEvent, source: string): Promise<void> => {
      try {
        console.log(`IPC: INSTALL_PACK - Installing from: ${source}`);
        await blockManager.installBlockPack(source);
        console.log(`IPC: INSTALL_PACK - Installation complete`);

        // TODO: Emit library changed event to all windows
        // event.sender.send(IPC_CHANNELS.CHANGED, {
        //   type: 'pack-installed',
        //   source
        // });
      } catch (error) {
        console.error(`IPC: INSTALL_PACK - Error installing from ${source}:`, error);
        throw error;
      }
    }
  );

  /**
   * Uninstall a block pack
   */
  ipcMain.handle(
    IPC_CHANNELS.UNINSTALL_PACK,
    async (event: IpcMainInvokeEvent, packName: string): Promise<void> => {
      try {
        console.log(`IPC: UNINSTALL_PACK - Uninstalling: ${packName}`);
        await blockManager.uninstallBlockPack(packName);
        console.log(`IPC: UNINSTALL_PACK - Uninstallation complete`);

        // TODO: Emit library changed event to all windows
        // event.sender.send(IPC_CHANNELS.CHANGED, {
        //   type: 'pack-uninstalled',
        //   packName
        // });
      } catch (error) {
        console.error(`IPC: UNINSTALL_PACK - Error uninstalling ${packName}:`, error);
        throw error;
      }
    }
  );

  console.log(`Block service IPC handlers registered (${blockManager.getBlockCount()} blocks loaded)`);
}

/**
 * Cleanup all block service IPC handlers
 * Useful for hot reload or app shutdown
 */
export function cleanupBlockServiceHandlers(): void {
  console.log('Cleaning up block service IPC handlers...');

  ipcMain.removeHandler(IPC_CHANNELS.GET_ALL);
  ipcMain.removeHandler(IPC_CHANNELS.GET_BLOCK);
  ipcMain.removeHandler(IPC_CHANNELS.SEARCH);
  ipcMain.removeHandler(IPC_CHANNELS.INSTALL_PACK);
  ipcMain.removeHandler(IPC_CHANNELS.UNINSTALL_PACK);

  console.log('Block service IPC handlers cleaned up');
}

/**
 * Emit a library changed event to all renderer processes
 *
 * @param event - Library change event
 */
export function emitLibraryChangedEvent(event: {
  type: 'block-added' | 'block-updated' | 'block-removed' | 'pack-installed' | 'pack-uninstalled';
  blockName?: string;
  block?: BlockDefinition;
  packName?: string;
  source?: string;
}): void {
  // TODO: Implement broadcasting to all windows
  // This will be needed when we implement block editing in the UI
  console.log('Library changed event:', event);
}
