/**
 * BlockWatcher - File system watcher for dynamic block loading
 * Monitors block directories for changes and triggers registry updates
 */

import chokidar, { FSWatcher } from 'chokidar';
import { promises as fs } from 'fs';
import path from 'path';
import { BlockDefinition } from '../BlockSchema/types';
import { validateBlock } from '../BlockSchema/validator';
import { BlockLibraryManager } from './BlockLibraryManager';

/**
 * Configuration for the file system watcher
 */
export interface BlockWatcherOptions {
  /** Debounce delay in milliseconds (default: 100ms) */
  debounceMs?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Use polling for file system events (useful for network drives) */
  usePolling?: boolean;
  /** Polling interval in milliseconds if usePolling is enabled */
  pollingInterval?: number;
}

/**
 * Watched directory configuration
 */
export interface WatchedDirectory {
  /** Absolute path to directory */
  path: string;
  /** Is this directory read-only? (e.g., core blocks) */
  readOnly: boolean;
  /** Description for logging */
  description: string;
}

/**
 * BlockWatcher class
 * Watches file system directories for block definition changes
 */
export class BlockWatcher {
  /** The chokidar watcher instance */
  private watcher: FSWatcher | null = null;

  /** Reference to the block library manager */
  private manager: BlockLibraryManager;

  /** Configuration options */
  private options: Required<BlockWatcherOptions>;

  /** Directories being watched */
  private watchedDirs: WatchedDirectory[] = [];

  /** Debounce timers for file events (keyed by file path) */
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map();

  /** Is the watcher active? */
  private active: boolean = false;

  constructor(manager: BlockLibraryManager, options: BlockWatcherOptions = {}) {
    this.manager = manager;
    this.options = {
      debounceMs: options.debounceMs ?? 100,
      debug: options.debug ?? false,
      usePolling: options.usePolling ?? false,
      pollingInterval: options.pollingInterval ?? 1000
    };
  }

  /**
   * Start watching directories for block definition changes
   * @param directories - Directories to watch
   * @returns Promise that resolves when watcher is ready
   */
  async start(directories: WatchedDirectory[]): Promise<void> {
    if (this.active) {
      this.log('Watcher already active, stopping before restart');
      await this.stop();
    }

    if (directories.length === 0) {
      throw new Error('No directories specified to watch');
    }

    this.watchedDirs = directories;
    const paths = directories.map((d) => d.path);

    this.log(`Starting file system watcher for ${paths.length} directories`);
    this.log(`Debounce: ${this.options.debounceMs}ms, Polling: ${this.options.usePolling}`);

    // Initialize chokidar watcher
    this.watcher = chokidar.watch(paths, {
      ignored: [
        /(^|[/\\])\../, // Ignore dotfiles
        '**/node_modules/**', // Ignore node_modules
        '**/*.test.json', // Ignore test files
        '**/*.tmp', // Ignore temp files
        '**/*~' // Ignore backup files
      ],
      persistent: true,
      ignoreInitial: false, // We want 'add' events for existing files on startup
      usePolling: this.options.usePolling,
      interval: this.options.pollingInterval,
      binaryInterval: this.options.pollingInterval,
      awaitWriteFinish: {
        stabilityThreshold: 50,
        pollInterval: 10
      }
    });

    // Set up event handlers
    this.watcher
      .on('add', (filePath) => this.handleFileAdd(filePath))
      .on('change', (filePath) => this.handleFileChange(filePath))
      .on('unlink', (filePath) => this.handleFileDelete(filePath))
      .on('error', (error) => this.handleWatcherError(error))
      .on('ready', () => {
        this.active = true;
        this.log('File system watcher ready and monitoring');
      });

    // Wait for watcher to be ready
    await new Promise<void>((resolve) => {
      this.watcher!.once('ready', () => resolve());
    });
  }

  /**
   * Stop watching directories
   * @returns Promise that resolves when watcher is stopped
   */
  async stop(): Promise<void> {
    if (!this.active || !this.watcher) {
      this.log('Watcher not active, nothing to stop');
      return;
    }

    this.log('Stopping file system watcher');

    // Clear all debounce timers
    this.debounceTimers.forEach((timer) => clearTimeout(timer));
    this.debounceTimers.clear();

    // Close watcher
    await this.watcher.close();
    this.watcher = null;
    this.active = false;

    this.log('File system watcher stopped');
  }

  /**
   * Check if watcher is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Get list of watched directories
   */
  getWatchedDirectories(): WatchedDirectory[] {
    return [...this.watchedDirs];
  }

  /**
   * Handle file add event
   * @param filePath - Absolute path to added file
   */
  private handleFileAdd(filePath: string): void {
    if (!this.isJsonFile(filePath)) {
      return; // Only watch .json files
    }

    this.log(`File added: ${filePath}`);
    this.debounceFileEvent(filePath, async () => {
      await this.processFileAdd(filePath);
    });
  }

  /**
   * Handle file change event
   * @param filePath - Absolute path to changed file
   */
  private handleFileChange(filePath: string): void {
    if (!this.isJsonFile(filePath)) {
      return;
    }

    this.log(`File changed: ${filePath}`);
    this.debounceFileEvent(filePath, async () => {
      await this.processFileChange(filePath);
    });
  }

  /**
   * Handle file delete event
   * @param filePath - Absolute path to deleted file
   */
  private handleFileDelete(filePath: string): void {
    if (!this.isJsonFile(filePath)) {
      return;
    }

    this.log(`File deleted: ${filePath}`);
    this.debounceFileEvent(filePath, async () => {
      await this.processFileDelete(filePath);
    });
  }

  /**
   * Handle watcher errors
   * @param error - Error from chokidar
   */
  private handleWatcherError(error: Error): void {
    this.logError('File system watcher error:', error);
    this.manager.emit('library-error', {
      type: 'library-error',
      message: `Watcher error: ${error.message}`,
      timestamp: Date.now(),
      details: error
    });
  }

  /**
   * Process file add event (load and register block)
   * @param filePath - Absolute path to file
   */
  private async processFileAdd(filePath: string): Promise<void> {
    try {
      const block = await this.loadBlockFromFile(filePath);
      if (!block) {
        return; // Error already logged
      }

      // Check if block already exists (can happen during initial scan)
      const existing = this.manager.getBlockByName(block.name);
      if (existing) {
        this.log(`Block '${block.name}' already exists, treating as update`);
        await this.processFileChange(filePath);
        return;
      }

      // Add to library
      this.manager.addBlock(block);
      this.log(`Block '${block.name}' added to library from ${filePath}`);
    } catch (error) {
      this.handleBlockError(filePath, 'add', error);
    }
  }

  /**
   * Process file change event (reload and update block)
   * @param filePath - Absolute path to file
   */
  private async processFileChange(filePath: string): Promise<void> {
    try {
      const block = await this.loadBlockFromFile(filePath);
      if (!block) {
        return; // Error already logged
      }

      // Get block name from file (in case name changed in file)
      const existingBlock = this.findBlockByFilePath(filePath);
      const blockName = existingBlock?.name || block.name;

      // Update in library
      this.manager.updateBlock(blockName, block);
      this.log(`Block '${blockName}' updated from ${filePath}`);
    } catch (error) {
      this.handleBlockError(filePath, 'update', error);
    }
  }

  /**
   * Process file delete event (remove block from registry)
   * @param filePath - Absolute path to deleted file
   */
  private async processFileDelete(filePath: string): Promise<void> {
    try {
      // Find the block by file path
      const block = this.findBlockByFilePath(filePath);
      if (!block) {
        this.log(`No block found for deleted file: ${filePath}`);
        return;
      }

      // Remove from library
      this.manager.removeBlock(block.name);
      this.log(`Block '${block.name}' removed from library (file deleted: ${filePath})`);
    } catch (error) {
      this.handleBlockError(filePath, 'delete', error);
    }
  }

  /**
   * Load and validate a block definition from a JSON file
   * @param filePath - Absolute path to JSON file
   * @returns Block definition or null if invalid
   */
  private async loadBlockFromFile(filePath: string): Promise<BlockDefinition | null> {
    try {
      // Read file
      const content = await fs.readFile(filePath, 'utf-8');

      // Parse JSON
      let blockData: unknown;
      try {
        blockData = JSON.parse(content);
      } catch (parseError) {
        throw new Error(`Invalid JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
      }

      // Validate structure
      const validation = validateBlock(blockData);
      if (!validation.valid) {
        const errorMessages = validation.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      // Log warnings but don't fail
      if (validation.warnings.length > 0) {
        const warningMessages = validation.warnings.map((w) => `${w.field}: ${w.message}`).join('; ');
        this.log(`Block has warnings: ${warningMessages}`);
      }

      return blockData as BlockDefinition;
    } catch (error) {
      this.logError(`Failed to load block from ${filePath}:`, error);
      this.manager.emit('library-error', {
        type: 'library-error',
        message: `Failed to load block from ${path.basename(filePath)}: ${error instanceof Error ? error.message : String(error)}`,
        blockFile: filePath,
        timestamp: Date.now(),
        details: error
      });
      return null;
    }
  }

  /**
   * Find a block in the library by its file path
   * This is a heuristic approach since blocks don't store file paths
   * We assume file name matches block name (e.g., gain.json -> 'gain')
   * @param filePath - Absolute file path
   * @returns Block definition or undefined
   */
  private findBlockByFilePath(filePath: string): BlockDefinition | undefined {
    const fileName = path.basename(filePath, '.json');
    return this.manager.getBlockByName(fileName);
  }

  /**
   * Debounce file events to handle rapid successive changes
   * @param filePath - File path (used as debounce key)
   * @param callback - Callback to execute after debounce delay
   */
  private debounceFileEvent(filePath: string, callback: () => Promise<void>): void {
    // Clear existing timer for this file
    const existingTimer = this.debounceTimers.get(filePath);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set new timer
    const timer = setTimeout(async () => {
      this.debounceTimers.delete(filePath);
      await callback();
    }, this.options.debounceMs);

    this.debounceTimers.set(filePath, timer);
  }

  /**
   * Check if file is a JSON file
   * @param filePath - File path to check
   * @returns True if file has .json extension
   */
  private isJsonFile(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === '.json';
  }

  /**
   * Handle errors during block processing
   * Logs error and emits error event, but doesn't crash the app
   * @param filePath - File that caused the error
   * @param operation - Operation that failed (add/update/delete)
   * @param error - The error
   */
  private handleBlockError(filePath: string, operation: string, error: unknown): void {
    const errorMsg = error instanceof Error ? error.message : String(error);
    this.logError(`Failed to ${operation} block from ${filePath}:`, error);

    this.manager.emit('library-error', {
      type: 'library-error',
      message: `Failed to ${operation} block from ${path.basename(filePath)}: ${errorMsg}`,
      blockFile: filePath,
      timestamp: Date.now(),
      details: error
    });
  }

  /**
   * Log debug message if debug is enabled
   * @param messages - Messages to log
   */
  private log(...messages: unknown[]): void {
    if (this.options.debug) {
      console.log('[BlockWatcher]', ...messages);
    }
  }

  /**
   * Log error message
   * @param messages - Messages to log
   */
  private logError(...messages: unknown[]): void {
    console.error('[BlockWatcher ERROR]', ...messages);
  }
}

/**
 * Helper function to create standard watched directory configurations
 */
export function createWatchedDirectory(
  dirPath: string,
  readOnly: boolean,
  description: string
): WatchedDirectory {
  return {
    path: path.resolve(dirPath),
    readOnly,
    description
  };
}

/**
 * Helper function to create standard block directory structure
 * @param coreBlocksDir - Path to core blocks (read-only)
 * @param userDataDir - Path to user data directory
 * @returns Array of watched directories
 */
export function createStandardWatchDirectories(
  coreBlocksDir: string,
  userDataDir: string
): WatchedDirectory[] {
  return [
    createWatchedDirectory(coreBlocksDir, true, 'Core blocks (read-only)'),
    createWatchedDirectory(path.join(userDataDir, 'custom_blocks'), false, 'User-created blocks'),
    createWatchedDirectory(path.join(userDataDir, 'block_packs'), false, 'Downloaded block packs')
  ];
}
