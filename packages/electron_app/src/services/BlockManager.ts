/**
 * BlockManager - Electron Main Process
 *
 * Manages block library with file system access.
 * Loads blocks from JSON files in userData/block_storage/
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';
import { BlockDefinition } from '../../../common/src/BlockSchema/types';

/**
 * Block manager error codes
 */
export enum BlockManagerErrorCode {
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  INVALID_JSON = 'INVALID_JSON',
  STORAGE_ERROR = 'STORAGE_ERROR',
  BLOCK_NOT_FOUND = 'BLOCK_NOT_FOUND'
}

/**
 * Block manager error
 */
export class BlockManagerError extends Error {
  constructor(message: string, public code: BlockManagerErrorCode, public cause?: unknown) {
    super(message);
    this.name = 'BlockManagerError';
  }
}

/**
 * Block manager for Electron main process
 *
 * Provides file system-based block library management with:
 * - JSON file loading from disk
 * - In-memory caching for performance
 * - Block search and filtering
 * - Block pack installation/uninstallation
 */
export class BlockManager {
  private blockStoragePath: string;
  private blocks: Map<string, BlockDefinition>;
  private initialized: boolean = false;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.blockStoragePath = path.join(userDataPath, 'block_storage');
    this.blocks = new Map();
  }

  /**
   * Get block storage directory path
   */
  getStoragePath(): string {
    return this.blockStoragePath;
  }

  /**
   * Initialize block manager
   * Creates storage directory and loads blocks from disk
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Ensure storage directory exists
    if (!fs.existsSync(this.blockStoragePath)) {
      fs.mkdirSync(this.blockStoragePath, { recursive: true });
      console.log(`Created block storage directory: ${this.blockStoragePath}`);
    }

    // Load blocks from disk
    await this.loadBlocksFromDisk();

    this.initialized = true;
    console.log(`BlockManager initialized with ${this.blocks.size} blocks`);
  }

  /**
   * Load all blocks from JSON files in storage directory
   */
  private async loadBlocksFromDisk(): Promise<void> {
    try {
      const files = fs.readdirSync(this.blockStoragePath);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      console.log(`Found ${jsonFiles.length} JSON files in block storage`);

      for (const file of jsonFiles) {
        try {
          const filePath = path.join(this.blockStoragePath, file);
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const blockData = JSON.parse(fileContent);

          // Validate block has required fields
          if (!blockData.name || !blockData.schema_version) {
            console.warn(`Skipping invalid block file: ${file} (missing name or schema_version)`);
            continue;
          }

          // Store block by name
          this.blocks.set(blockData.name, blockData as BlockDefinition);
          console.log(`Loaded block: ${blockData.name}`);
        } catch (error) {
          console.error(`Failed to load block from ${file}:`, error);
          // Continue loading other blocks even if one fails
        }
      }
    } catch (error) {
      throw new BlockManagerError(
        `Failed to load blocks from disk: ${(error as Error).message}`,
        BlockManagerErrorCode.STORAGE_ERROR,
        error
      );
    }
  }

  /**
   * Get all available blocks
   */
  async getAvailableBlocks(): Promise<BlockDefinition[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    return Array.from(this.blocks.values());
  }

  /**
   * Get a specific block by name
   */
  async getBlock(name: string): Promise<BlockDefinition | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    return this.blocks.get(name) || null;
  }

  /**
   * Search blocks by query string
   * Searches in name, description, category, and tags
   */
  async searchBlocks(query: string): Promise<BlockDefinition[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const lowerQuery = query.toLowerCase();
    const results: BlockDefinition[] = [];

    for (const block of this.blocks.values()) {
      // Search in name
      if (block.name.toLowerCase().includes(lowerQuery)) {
        results.push(block);
        continue;
      }

      // Search in description
      if (block.description?.toLowerCase().includes(lowerQuery)) {
        results.push(block);
        continue;
      }

      // Search in category
      if (block.category?.toLowerCase().includes(lowerQuery)) {
        results.push(block);
        continue;
      }

      // Search in tags
      if (block.tags?.some((tag: string) => tag.toLowerCase().includes(lowerQuery))) {
        results.push(block);
        continue;
      }
    }

    return results;
  }

  /**
   * Install a block pack from URL or file path
   *
   * @param source - URL or file path to block pack
   */
  async installBlockPack(source: string): Promise<void> {
    // TODO: Implement block pack installation
    // This will be implemented in a future phase
    throw new BlockManagerError('Block pack installation not yet implemented', BlockManagerErrorCode.STORAGE_ERROR);
  }

  /**
   * Uninstall a block pack
   *
   * @param packName - Name of the pack to uninstall
   */
  async uninstallBlockPack(packName: string): Promise<void> {
    // TODO: Implement block pack uninstallation
    // This will be implemented in a future phase
    throw new BlockManagerError('Block pack uninstallation not yet implemented', BlockManagerErrorCode.STORAGE_ERROR);
  }

  /**
   * Reload blocks from disk
   * Useful after external changes to block files
   */
  async reload(): Promise<void> {
    this.blocks.clear();
    await this.loadBlocksFromDisk();
    console.log(`BlockManager reloaded with ${this.blocks.size} blocks`);
  }

  /**
   * Save a block to disk
   *
   * @param block - Block definition to save
   */
  async saveBlock(block: BlockDefinition): Promise<void> {
    try {
      const filePath = path.join(this.blockStoragePath, `${block.name}.json`);
      const fileContent = JSON.stringify(block, null, 2);

      fs.writeFileSync(filePath, fileContent, 'utf-8');

      // Update in-memory cache
      this.blocks.set(block.name, block);

      console.log(`Saved block: ${block.name}`);
    } catch (error) {
      throw new BlockManagerError(
        `Failed to save block ${block.name}: ${(error as Error).message}`,
        BlockManagerErrorCode.STORAGE_ERROR,
        error
      );
    }
  }

  /**
   * Delete a block from disk and memory
   *
   * @param blockName - Name of the block to delete
   */
  async deleteBlock(blockName: string): Promise<void> {
    try {
      const filePath = path.join(this.blockStoragePath, `${blockName}.json`);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      // Remove from in-memory cache
      this.blocks.delete(blockName);

      console.log(`Deleted block: ${blockName}`);
    } catch (error) {
      throw new BlockManagerError(
        `Failed to delete block ${blockName}: ${(error as Error).message}`,
        BlockManagerErrorCode.STORAGE_ERROR,
        error
      );
    }
  }

  /**
   * Get block count
   */
  getBlockCount(): number {
    return this.blocks.size;
  }

  /**
   * Check if block exists
   */
  hasBlock(name: string): boolean {
    return this.blocks.has(name);
  }
}

// Singleton instance
let blockManagerInstance: BlockManager | null = null;

/**
 * Get the singleton BlockManager instance
 */
export function getBlockManager(): BlockManager {
  if (!blockManagerInstance) {
    blockManagerInstance = new BlockManager();
  }
  return blockManagerInstance;
}
