/**
 * BlockService Interface
 * Platform-agnostic block library service interface
 *
 * This interface defines the contract for accessing the block library
 * from the frontend, abstracting away platform-specific implementation
 * details (Electron IPC vs HTTP API).
 */

import { BlockDefinition } from '@compx/common';
import {
  BlockSearchQuery,
  LibraryChangeEvent,
  BlockPackInstallResult,
  BlockPackUninstallResult
} from './types';

/**
 * Block library service interface
 *
 * Provides frontend components with access to the block library,
 * real-time updates, and block pack management.
 *
 * @example
 * ```typescript
 * // Get all available blocks
 * const blocks = await blockService.getAvailableBlocks();
 *
 * // Search for specific blocks
 * const mathBlocks = await blockService.searchBlocks({ category: 'math' });
 *
 * // Listen for library changes
 * const unsubscribe = blockService.onLibraryChanged((event) => {
 *   if (event.type === 'block-added') {
 *     console.log(`New block added: ${event.blockName}`);
 *   }
 * });
 * ```
 */
export interface BlockService {
  /**
   * Get all available blocks in the library
   *
   * @returns Promise resolving to array of all block definitions
   * @throws {BlockServiceError} If communication with backend fails
   *
   * @example
   * ```typescript
   * const blocks = await blockService.getAvailableBlocks();
   * console.log(`Found ${blocks.length} blocks`);
   * ```
   */
  getAvailableBlocks(): Promise<BlockDefinition[]>;

  /**
   * Get a specific block by name
   *
   * @param name - Unique name of the block to retrieve
   * @returns Promise resolving to block definition, or null if not found
   * @throws {BlockServiceError} If communication with backend fails
   *
   * @example
   * ```typescript
   * const gainBlock = await blockService.getBlock('gain');
   * if (gainBlock) {
   *   console.log(`Found gain block: ${gainBlock.description}`);
   * }
   * ```
   */
  getBlock(name: string): Promise<BlockDefinition | null>;

  /**
   * Search for blocks matching query criteria
   *
   * Query parameters are combined with AND logic:
   * - name: Partial, case-insensitive match
   * - tags: Block must have at least one matching tag
   * - category: Exact match
   *
   * @param query - Search criteria
   * @returns Promise resolving to array of matching blocks
   * @throws {BlockServiceError} If communication with backend fails
   *
   * @example
   * ```typescript
   * // Find all math blocks
   * const mathBlocks = await blockService.searchBlocks({ category: 'math' });
   *
   * // Find blocks with 'signal' in name
   * const signalBlocks = await blockService.searchBlocks({ name: 'signal' });
   *
   * // Find blocks tagged with 'control' or 'pid'
   * const controlBlocks = await blockService.searchBlocks({ tags: ['control', 'pid'] });
   * ```
   */
  searchBlocks(query: BlockSearchQuery): Promise<BlockDefinition[]>;

  /**
   * Subscribe to library change events
   *
   * Callback will be invoked whenever blocks are added, updated, or removed.
   * Real-time updates enable UI components to stay synchronized with the
   * block library state.
   *
   * @param callback - Function to call when library changes occur
   * @returns Unsubscribe function to stop receiving events
   *
   * @example
   * ```typescript
   * const unsubscribe = blockService.onLibraryChanged((event) => {
   *   switch (event.type) {
   *     case 'block-added':
   *       console.log(`New block: ${event.blockName}`);
   *       break;
   *     case 'block-updated':
   *       console.log(`Updated block: ${event.blockName}`);
   *       break;
   *     case 'block-removed':
   *       console.log(`Removed block: ${event.blockName}`);
   *       break;
   *   }
   * });
   *
   * // Later, stop listening
   * unsubscribe();
   * ```
   */
  onLibraryChanged(callback: (event: LibraryChangeEvent) => void): () => void;

  /**
   * Install a block pack from a URL or file path
   *
   * **Note**: This feature is planned for future implementation.
   * Current implementation may throw "Not implemented" error.
   *
   * Block packs are collections of related blocks distributed as a unit.
   * Installation validates the pack manifest, downloads all block definitions,
   * and adds them to the library.
   *
   * @param packUrl - URL or file path to block pack manifest
   * @returns Promise resolving to installation result
   * @throws {BlockServiceError} If installation fails
   *
   * @example
   * ```typescript
   * const result = await blockService.installBlockPack(
   *   'https://example.com/control-systems-pack.json'
   * );
   *
   * if (result.success) {
   *   console.log(`Installed ${result.blocksAdded.length} blocks`);
   * } else {
   *   console.error(`Installation failed: ${result.error}`);
   * }
   * ```
   */
  installBlockPack(packUrl: string): Promise<BlockPackInstallResult>;

  /**
   * Uninstall a previously installed block pack
   *
   * **Note**: This feature is planned for future implementation.
   * Current implementation may throw "Not implemented" error.
   *
   * Removes all blocks associated with the named pack from the library.
   * Does not affect other blocks or packs.
   *
   * @param packName - Name of the block pack to uninstall
   * @returns Promise resolving to uninstallation result
   * @throws {BlockServiceError} If uninstallation fails
   *
   * @example
   * ```typescript
   * const result = await blockService.uninstallBlockPack('control-systems-pack');
   *
   * if (result.success) {
   *   console.log(`Removed ${result.blocksRemoved.length} blocks`);
   * } else {
   *   console.error(`Uninstallation failed: ${result.error}`);
   * }
   * ```
   */
  uninstallBlockPack(packName: string): Promise<BlockPackUninstallResult>;
}
