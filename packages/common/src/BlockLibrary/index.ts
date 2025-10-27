/**
 * Block Library Manager - Central registry and management system for CompX blocks
 *
 * @module BlockLibrary
 *
 * This module provides a comprehensive system for managing block definitions:
 * - BlockLibraryManager: Main entry point for block library operations
 * - BlockRegistry: In-memory storage with efficient search capabilities
 * - Type definitions and interfaces for the library system
 *
 * @example
 * ```typescript
 * import { BlockLibraryManager } from './BlockLibrary';
 *
 * const manager = new BlockLibraryManager({ debug: true });
 * await manager.initialize();
 *
 * // Get all blocks
 * const blocks = manager.getAllBlocks();
 *
 * // Search for blocks
 * const mathBlocks = manager.searchBlocks({ category: 'math' });
 *
 * // Listen for changes
 * manager.on('block-added', (event) => {
 *   console.log('New block added:', event.blockName);
 * });
 * ```
 */

export { BlockLibraryManager, BlockLibraryManagerOptions, getDefaultManager, resetDefaultManager } from './BlockLibraryManager';
export { BlockRegistry } from './BlockRegistry';
export {
  BlockSearchQuery,
  LibraryEventType,
  LibraryChangeEvent,
  LibraryErrorEvent,
  LibraryEvent,
  LibraryEventCallback,
  LibraryStats
} from './types';
