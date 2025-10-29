/**
 * BlockLibraryManager - Central registry for all available blocks with dynamic loading
 * This is the main entry point for the block library system
 */

import { EventEmitter } from 'events';
import { BlockDefinition, ValidationResult } from '../BlockSchema/types';
import { validateBlock } from '../BlockSchema/validator';
import { BlockRegistry } from './BlockRegistry';
import {
  BlockSearchQuery,
  LibraryEvent,
  LibraryEventCallback,
  LibraryEventType,
  LibraryStats
} from './types';

/**
 * Configuration options for BlockLibraryManager
 */
export interface BlockLibraryManagerOptions {
  /** Enable strict validation (reject blocks with warnings) */
  strictValidation?: boolean;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Central manager for the block library
 * Handles block registration, validation, search, and event notification
 */
export class BlockLibraryManager extends EventEmitter {
  /** Internal block registry */
  private registry: BlockRegistry;

  /** Configuration options */
  private options: BlockLibraryManagerOptions;

  /** Initialization state */
  private initialized: boolean;

  /** Debug logging enabled */
  private debug: boolean;

  constructor(options: BlockLibraryManagerOptions = {}) {
    super();
    this.registry = new BlockRegistry();
    this.options = {
      strictValidation: options.strictValidation ?? false,
      debug: options.debug ?? false
    };
    this.initialized = false;
    this.debug = options.debug ?? false;
  }

  /**
   * Initialize the block library
   * This should be called once during application startup
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      this.log('Block library already initialized');
      return;
    }

    this.log('Initializing block library...');

    // Note: Actual file loading will be implemented in BlockLoader
    // For now, we just mark as initialized
    this.initialized = true;

    this.emitEvent({
      type: 'library-initialized',
      blockName: '',
      timestamp: Date.now()
    });

    this.log(`Block library initialized with ${this.registry.size} blocks`);
  }

  /**
   * Get all available blocks
   * @returns Array of all block definitions
   */
  getAllBlocks(): BlockDefinition[] {
    this.ensureInitialized();
    return this.registry.getAll();
  }

  /**
   * Get a specific block by name
   * @param name - Block name
   * @returns Block definition or undefined if not found
   */
  getBlockByName(name: string): BlockDefinition | undefined {
    this.ensureInitialized();
    return this.registry.get(name);
  }

  /**
   * Search for blocks matching the query
   * @param query - Search criteria
   * @returns Array of matching blocks
   */
  searchBlocks(query: BlockSearchQuery): BlockDefinition[] {
    this.ensureInitialized();
    return this.registry.search(query);
  }

  /**
   * Get blocks by category
   * @param category - Category name
   * @returns Array of blocks in the category
   */
  getBlocksByCategory(category: string): BlockDefinition[] {
    this.ensureInitialized();
    return this.registry.getByCategory(category);
  }

  /**
   * Get blocks by tag
   * @param tag - Tag name
   * @returns Array of blocks with the tag
   */
  getBlocksByTag(tag: string): BlockDefinition[] {
    this.ensureInitialized();
    return this.registry.getByTag(tag);
  }

  /**
   * Get all available categories
   * @returns Array of category names
   */
  getAllCategories(): string[] {
    this.ensureInitialized();
    return this.registry.getAllCategories();
  }

  /**
   * Get all available tags
   * @returns Array of tag names
   */
  getAllTags(): string[] {
    this.ensureInitialized();
    return this.registry.getAllTags();
  }

  /**
   * Get library statistics
   * @returns Statistics about the library
   */
  getStats(): LibraryStats {
    this.ensureInitialized();
    return this.registry.getStats();
  }

  /**
   * Check if library is initialized
   * @returns True if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Add a new block to the library (internal, used by watcher)
   * @param definition - Block definition to add
   * @throws Error if validation fails or block already exists
   */
  addBlock(definition: BlockDefinition): void {
    this.ensureInitialized();

    // Validate the block
    const validation = this.validateBlockDefinition(definition);
    if (!validation.valid) {
      throw new Error(
        `Block '${definition.name}' validation failed: ${validation.errors.map((e) => e.message).join(', ')}`
      );
    }

    // Check for warnings in strict mode
    if (this.options.strictValidation && validation.warnings.length > 0) {
      throw new Error(
        `Block '${definition.name}' has warnings (strict mode): ${validation.warnings.map((w) => w.message).join(', ')}`
      );
    }

    // Add to registry
    try {
      this.registry.add(definition);
      this.log(`Block '${definition.name}' added to library`);

      // Emit event
      this.emitEvent({
        type: 'block-added',
        blockName: definition.name,
        block: definition,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logError(`Failed to add block '${definition.name}':`, error);
      throw error;
    }
  }

  /**
   * Update an existing block in the library (internal, used by watcher)
   * @param name - Name of block to update
   * @param definition - New block definition
   * @throws Error if validation fails or block doesn't exist
   */
  updateBlock(name: string, definition: BlockDefinition): void {
    this.ensureInitialized();

    // Validate the block
    const validation = this.validateBlockDefinition(definition);
    if (!validation.valid) {
      throw new Error(
        `Block '${definition.name}' validation failed: ${validation.errors.map((e) => e.message).join(', ')}`
      );
    }

    // Check for warnings in strict mode
    if (this.options.strictValidation && validation.warnings.length > 0) {
      throw new Error(
        `Block '${definition.name}' has warnings (strict mode): ${validation.warnings.map((w) => w.message).join(', ')}`
      );
    }

    // Update in registry
    try {
      this.registry.update(name, definition);
      this.log(`Block '${name}' updated in library`);

      // Emit event
      this.emitEvent({
        type: 'block-updated',
        blockName: name,
        block: definition,
        timestamp: Date.now()
      });
    } catch (error) {
      this.logError(`Failed to update block '${name}':`, error);
      throw error;
    }
  }

  /**
   * Remove a block from the library (internal, used by watcher)
   * @param name - Name of block to remove
   * @returns True if block was removed, false if not found
   */
  removeBlock(name: string): boolean {
    this.ensureInitialized();

    const removed = this.registry.remove(name);
    if (removed) {
      this.log(`Block '${name}' removed from library`);

      // Emit event
      this.emitEvent({
        type: 'block-removed',
        blockName: name,
        timestamp: Date.now()
      });
    } else {
      this.log(`Block '${name}' not found for removal`);
    }

    return removed;
  }

  /**
   * Register an event listener
   * @param event - Event type to listen for
   * @param callback - Callback function
   * @returns Function to unregister the listener
   */
  addEventListener(event: LibraryEventType, callback: LibraryEventCallback): () => void {
    super.on(event, callback);
    return () => this.removeEventListener(event, callback);
  }

  /**
   * Register a one-time event listener
   * @param event - Event type to listen for
   * @param callback - Callback function
   */
  addEventListenerOnce(event: LibraryEventType, callback: LibraryEventCallback): void {
    super.once(event, callback);
  }

  /**
   * Unregister an event listener
   * @param event - Event type
   * @param callback - Callback function to remove
   */
  removeEventListener(event: LibraryEventType, callback: LibraryEventCallback): void {
    super.off(event, callback);
  }

  /**
   * Clear all blocks from the library
   * This is primarily for testing purposes
   */
  clear(): void {
    this.registry.clear();
    this.log('Block library cleared');
  }

  /**
   * Validate a block definition
   * @param definition - Block definition to validate
   * @returns Validation result
   */
  private validateBlockDefinition(definition: BlockDefinition): ValidationResult {
    return validateBlock(definition);
  }

  /**
   * Emit a library event
   * @param event - Event to emit
   */
  private emitEvent(event: LibraryEvent): void {
    this.emit(event.type, event);
  }

  /**
   * Ensure the library is initialized
   * @throws Error if not initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new Error('Block library not initialized. Call initialize() first.');
    }
  }

  /**
   * Log a debug message
   * @param message - Message to log
   * @param args - Additional arguments
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.debug) {
      console.log(`[BlockLibrary] ${message}`, ...args);
    }
  }

  /**
   * Log an error
   * @param message - Error message
   * @param error - Error object
   */
  private logError(message: string, error: unknown): void {
    console.error(`[BlockLibrary] ${message}`, error);
  }
}

/**
 * Default singleton instance
 * Can be used for simple applications that only need one library manager
 */
let defaultManager: BlockLibraryManager | null = null;

/**
 * Get the default BlockLibraryManager instance
 * @param options - Configuration options (only used on first call)
 * @returns The default manager instance
 */
export function getDefaultManager(
  options?: BlockLibraryManagerOptions
): BlockLibraryManager {
  if (!defaultManager) {
    defaultManager = new BlockLibraryManager(options);
  }
  return defaultManager;
}

/**
 * Reset the default manager (primarily for testing)
 */
export function resetDefaultManager(): void {
  defaultManager = null;
}
