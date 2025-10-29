/**
 * BlockRegistry - In-memory storage and search for block definitions
 * Provides fast O(1) lookups by name and efficient searching by tags/category
 */

import { BlockDefinition } from '../BlockSchema/types';
import { BlockSearchQuery, LibraryStats } from './types';

/**
 * In-memory registry for block definitions with efficient search capabilities
 */
export class BlockRegistry {
  /** Primary storage: Map from block name to definition */
  private blocks: Map<string, BlockDefinition>;

  /** Index: Category -> Set of block names */
  private categoryIndex: Map<string, Set<string>>;

  /** Index: Tag -> Set of block names */
  private tagIndex: Map<string, Set<string>>;

  /** Last update timestamp */
  private lastUpdate: number;

  constructor() {
    this.blocks = new Map();
    this.categoryIndex = new Map();
    this.tagIndex = new Map();
    this.lastUpdate = Date.now();
  }

  /**
   * Add a block to the registry
   * @param block - Block definition to add
   * @throws Error if block with same name already exists
   */
  add(block: BlockDefinition): void {
    if (this.blocks.has(block.name)) {
      throw new Error(`Block '${block.name}' already exists in registry`);
    }

    this.blocks.set(block.name, block);
    this.updateIndexes(block);
    this.lastUpdate = Date.now();
  }

  /**
   * Update an existing block in the registry
   * @param name - Name of block to update
   * @param block - New block definition
   * @throws Error if block doesn't exist
   */
  update(name: string, block: BlockDefinition): void {
    if (!this.blocks.has(name)) {
      throw new Error(`Block '${name}' not found in registry`);
    }

    // If name changed, this is an error
    if (name !== block.name) {
      throw new Error(`Cannot change block name from '${name}' to '${block.name}' during update`);
    }

    // Remove old indexes
    const oldBlock = this.blocks.get(name)!;
    this.removeFromIndexes(oldBlock);

    // Update block and indexes
    this.blocks.set(name, block);
    this.updateIndexes(block);
    this.lastUpdate = Date.now();
  }

  /**
   * Remove a block from the registry
   * @param name - Name of block to remove
   * @returns True if block was removed, false if not found
   */
  remove(name: string): boolean {
    const block = this.blocks.get(name);
    if (!block) {
      return false;
    }

    this.blocks.delete(name);
    this.removeFromIndexes(block);
    this.lastUpdate = Date.now();
    return true;
  }

  /**
   * Get a block by name
   * @param name - Block name
   * @returns Block definition or undefined if not found
   */
  get(name: string): BlockDefinition | undefined {
    return this.blocks.get(name);
  }

  /**
   * Check if a block exists
   * @param name - Block name
   * @returns True if block exists
   */
  has(name: string): boolean {
    return this.blocks.has(name);
  }

  /**
   * Get all blocks in the registry
   * @returns Array of all block definitions
   */
  getAll(): BlockDefinition[] {
    return Array.from(this.blocks.values());
  }

  /**
   * Search for blocks matching the query
   * @param query - Search criteria
   * @returns Array of matching blocks
   */
  search(query: BlockSearchQuery): BlockDefinition[] {
    let results = new Set<string>(this.blocks.keys());

    // Filter by name (partial, case-insensitive match)
    if (query.name) {
      const nameLower = query.name.toLowerCase();
      results = new Set(
        Array.from(results).filter((name) => name.toLowerCase().includes(nameLower))
      );
    }

    // Filter by category (exact match)
    if (query.category) {
      const categoryBlocks = this.categoryIndex.get(query.category);
      if (categoryBlocks) {
        results = new Set(Array.from(results).filter((name) => categoryBlocks.has(name)));
      } else {
        results.clear(); // No blocks in this category
      }
    }

    // Filter by tags (match ANY of the provided tags)
    if (query.tags && query.tags.length > 0) {
      const tagMatches = new Set<string>();
      query.tags.forEach((tag) => {
        const tagBlocks = this.tagIndex.get(tag);
        if (tagBlocks) {
          tagBlocks.forEach((name) => tagMatches.add(name));
        }
      });
      results = new Set(Array.from(results).filter((name) => tagMatches.has(name)));
    }

    // Filter by version pattern (basic string match for now)
    if (query.version) {
      results = new Set(
        Array.from(results).filter((name) => {
          const block = this.blocks.get(name);
          return block?.version === query.version;
        })
      );
    }

    // Convert names back to block definitions
    return Array.from(results)
      .map((name) => this.blocks.get(name)!)
      .filter(Boolean);
  }

  /**
   * Get all blocks in a specific category
   * @param category - Category name
   * @returns Array of blocks in the category
   */
  getByCategory(category: string): BlockDefinition[] {
    const blockNames = this.categoryIndex.get(category);
    if (!blockNames) {
      return [];
    }
    return Array.from(blockNames)
      .map((name) => this.blocks.get(name)!)
      .filter(Boolean);
  }

  /**
   * Get all blocks with a specific tag
   * @param tag - Tag to search for
   * @returns Array of blocks with the tag
   */
  getByTag(tag: string): BlockDefinition[] {
    const blockNames = this.tagIndex.get(tag);
    if (!blockNames) {
      return [];
    }
    return Array.from(blockNames)
      .map((name) => this.blocks.get(name)!)
      .filter(Boolean);
  }

  /**
   * Get all unique categories
   * @returns Array of category names
   */
  getAllCategories(): string[] {
    return Array.from(this.categoryIndex.keys());
  }

  /**
   * Get all unique tags
   * @returns Array of tag names
   */
  getAllTags(): string[] {
    return Array.from(this.tagIndex.keys());
  }

  /**
   * Get registry statistics
   * @returns Statistics about the registry
   */
  getStats(): LibraryStats {
    const byCategory: Record<string, number> = {};
    this.categoryIndex.forEach((blocks, category) => {
      byCategory[category] = blocks.size;
    });

    return {
      totalBlocks: this.blocks.size,
      byCategory,
      allTags: this.getAllTags(),
      lastUpdate: this.lastUpdate
    };
  }

  /**
   * Clear all blocks from the registry
   */
  clear(): void {
    this.blocks.clear();
    this.categoryIndex.clear();
    this.tagIndex.clear();
    this.lastUpdate = Date.now();
  }

  /**
   * Get the number of blocks in the registry
   * @returns Number of blocks
   */
  get size(): number {
    return this.blocks.size;
  }

  /**
   * Update all indexes for a block
   */
  private updateIndexes(block: BlockDefinition): void {
    // Category index
    const category = block.category || 'misc';
    if (!this.categoryIndex.has(category)) {
      this.categoryIndex.set(category, new Set());
    }
    this.categoryIndex.get(category)!.add(block.name);

    // Tag index
    if (block.tags) {
      block.tags.forEach((tag) => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(block.name);
      });
    }
  }

  /**
   * Remove a block from all indexes
   */
  private removeFromIndexes(block: BlockDefinition): void {
    // Category index
    const category = block.category || 'misc';
    const categorySet = this.categoryIndex.get(category);
    if (categorySet) {
      categorySet.delete(block.name);
      if (categorySet.size === 0) {
        this.categoryIndex.delete(category);
      }
    }

    // Tag index
    if (block.tags) {
      block.tags.forEach((tag) => {
        const tagSet = this.tagIndex.get(tag);
        if (tagSet) {
          tagSet.delete(block.name);
          if (tagSet.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      });
    }
  }
}
