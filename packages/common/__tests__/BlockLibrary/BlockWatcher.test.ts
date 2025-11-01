/**
 * Unit tests for BlockWatcher
 * Tests file system watching, debouncing, and event handling
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { BlockWatcher, createWatchedDirectory } from '../../src/BlockLibrary/BlockWatcher';
import { BlockLibraryManager } from '../../src/BlockLibrary/BlockLibraryManager';
import { BlockDefinition } from '../../src/BlockSchema/types';

/**
 * Create a temporary directory for testing
 */
async function createTempDir(prefix: string): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  return tempDir;
}

/**
 * Remove a temporary directory
 */
async function removeTempDir(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    // Ignore errors during cleanup
    console.warn(`Warning: Failed to remove temp dir ${dirPath}:`, error);
  }
}

/**
 * Create a valid block definition for testing
 */
function createValidBlockDef(name: string): BlockDefinition {
  return {
    schema_version: '1.0.0',
    name,
    version: '1.0.0',
    description: `Test block ${name}`,
    category: 'test',
    tags: ['test'],
    inputPorts: [{ name: 'x', type: 'NUMBER' }],
    outputPorts: [{ name: 'y', type: 'NUMBER' }],
    callbackString: 'return [inputPort[x] * 2]',
    visual: {
      color: '#FF0000',
      icon: 'test',
      shape: 'rect'
    }
  };
}

/**
 * Write a block definition to a file
 */
async function writeBlockFile(dirPath: string, blockName: string, block: BlockDefinition): Promise<string> {
  const filePath = path.join(dirPath, `${blockName}.json`);
  await fs.writeFile(filePath, JSON.stringify(block, null, 2), 'utf-8');
  return filePath;
}

/**
 * Wait for a specific event to be emitted
 */
function waitForEvent(manager: BlockLibraryManager, eventType: string, timeout: number = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${eventType}`));
    }, timeout);

    manager.once(eventType, (event: any) => {
      clearTimeout(timer);
      resolve(event);
    });
  });
}

/**
 * Wait for a specified amount of time
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('BlockWatcher', () => {
  let tempDir: string;
  let manager: BlockLibraryManager;
  let watcher: BlockWatcher;

  beforeEach(async () => {
    // Create temp directory for tests
    tempDir = await createTempDir('blockwatcher-test-');

    // Create manager and watcher
    manager = new BlockLibraryManager({ debug: false });
    await manager.initialize();

    watcher = new BlockWatcher(manager, {
      debounceMs: 50, // Short debounce for tests
      debug: false
    });
  });

  afterEach(async () => {
    // Stop watcher
    if (watcher.isActive()) {
      await watcher.stop();
    }

    // Clean up temp directory
    await removeTempDir(tempDir);
  });

  describe('initialization', () => {
    it('should start successfully with valid directory', async () => {
      const dirs = [createWatchedDirectory(tempDir, false, 'Test directory')];
      await watcher.start(dirs);

      expect(watcher.isActive()).toBe(true);
      expect(watcher.getWatchedDirectories()).toEqual(dirs);
    });

    it('should throw error when starting with no directories', async () => {
      await expect(watcher.start([])).rejects.toThrow('No directories specified to watch');
    });

    it('should stop and restart successfully', async () => {
      const dirs = [createWatchedDirectory(tempDir, false, 'Test directory')];

      await watcher.start(dirs);
      expect(watcher.isActive()).toBe(true);

      await watcher.stop();
      expect(watcher.isActive()).toBe(false);

      await watcher.start(dirs);
      expect(watcher.isActive()).toBe(true);
    });

    it('should not error when stopping inactive watcher', async () => {
      expect(watcher.isActive()).toBe(false);
      await expect(watcher.stop()).resolves.not.toThrow();
    });
  });

  describe('file detection', () => {
    beforeEach(async () => {
      const dirs = [createWatchedDirectory(tempDir, false, 'Test directory')];
      await watcher.start(dirs);
    });

    it('should detect new block file and add to library', async () => {
      const block = createValidBlockDef('test_add');
      const eventPromise = waitForEvent(manager, 'block-added');

      // Write block file
      await writeBlockFile(tempDir, 'test_add', block);

      // Wait for event
      const event = await eventPromise;
      expect(event.type).toBe('block-added');
      expect(event.blockName).toBe('test_add');
      expect(event.block).toMatchObject({
        name: 'test_add',
        category: 'test'
      });

      // Verify block is in library
      const addedBlock = manager.getBlockByName('test_add');
      expect(addedBlock).toBeDefined();
      expect(addedBlock?.name).toBe('test_add');
    });

    it('should detect changed block file and update library', async () => {
      // First, add a block
      const block = createValidBlockDef('test_update');
      await writeBlockFile(tempDir, 'test_update', block);
      await waitForEvent(manager, 'block-added');

      // Now update it
      const updatedBlock = { ...block, description: 'Updated description' };
      const eventPromise = waitForEvent(manager, 'block-updated');

      await writeBlockFile(tempDir, 'test_update', updatedBlock);

      // Wait for update event
      const event = await eventPromise;
      expect(event.type).toBe('block-updated');
      expect(event.blockName).toBe('test_update');

      // Verify block is updated
      const updated = manager.getBlockByName('test_update');
      expect(updated?.description).toBe('Updated description');
    });

    it('should detect deleted block file and remove from library', async () => {
      // First, add a block
      const block = createValidBlockDef('test_delete');
      const filePath = await writeBlockFile(tempDir, 'test_delete', block);
      await waitForEvent(manager, 'block-added');

      // Verify block exists
      expect(manager.getBlockByName('test_delete')).toBeDefined();

      // Now delete it
      const eventPromise = waitForEvent(manager, 'block-removed');
      await fs.unlink(filePath);

      // Wait for removal event
      const event = await eventPromise;
      expect(event.type).toBe('block-removed');
      expect(event.blockName).toBe('test_delete');

      // Verify block is removed
      expect(manager.getBlockByName('test_delete')).toBeUndefined();
    });

    it('should ignore non-JSON files', async () => {
      // Create a text file
      const txtFilePath = path.join(tempDir, 'test.txt');
      await fs.writeFile(txtFilePath, 'not a block', 'utf-8');

      // Wait a bit to ensure watcher would have processed it
      await sleep(200);

      // Library should still be empty
      expect(manager.getAllBlocks()).toHaveLength(0);
    });

    it('should ignore dotfiles', async () => {
      // Create a hidden file
      const dotFilePath = path.join(tempDir, '.hidden.json');
      const block = createValidBlockDef('hidden');
      await fs.writeFile(dotFilePath, JSON.stringify(block), 'utf-8');

      // Wait a bit to ensure watcher would have processed it
      await sleep(200);

      // Library should still be empty
      expect(manager.getAllBlocks()).toHaveLength(0);
    });
  });

  describe('debouncing', () => {
    beforeEach(async () => {
      const dirs = [createWatchedDirectory(tempDir, false, 'Test directory')];
      await watcher.start(dirs);
    });

    it('should debounce rapid file changes', async () => {
      const block = createValidBlockDef('test_debounce');
      const filePath = await writeBlockFile(tempDir, 'test_debounce', block);
      await waitForEvent(manager, 'block-added');

      // Track update events
      let updateCount = 0;
      const updateListener = () => updateCount++;
      manager.on('block-updated', updateListener);

      // Rapidly update the file multiple times
      for (let i = 0; i < 5; i++) {
        const updated = { ...block, description: `Update ${i}` };
        await fs.writeFile(filePath, JSON.stringify(updated), 'utf-8');
        await sleep(10); // Very short delay between updates
      }

      // Wait for debounce + processing
      await sleep(300);

      // Should have significantly fewer updates than changes (debouncing at work)
      // We can't guarantee exactly 1 due to file system timing, but should be < 5
      expect(updateCount).toBeLessThan(5);
      expect(updateCount).toBeGreaterThan(0);

      manager.off('block-updated', updateListener);
    });
  });

  describe('error handling', () => {
    beforeEach(async () => {
      const dirs = [createWatchedDirectory(tempDir, false, 'Test directory')];
      await watcher.start(dirs);
    });

    it('should handle invalid JSON gracefully', async () => {
      const errorPromise = waitForEvent(manager, 'library-error');

      // Write invalid JSON
      const invalidPath = path.join(tempDir, 'invalid.json');
      await fs.writeFile(invalidPath, '{ invalid json }', 'utf-8');

      // Should emit error event
      const event = await errorPromise;
      expect(event.type).toBe('library-error');
      expect(event.message).toContain('Invalid JSON');
      expect(event.blockFile).toBe(invalidPath);

      // Library should still be empty (invalid block not added)
      expect(manager.getAllBlocks()).toHaveLength(0);
    });

    it('should handle validation failures gracefully', async () => {
      const errorPromise = waitForEvent(manager, 'library-error');

      // Write block with validation errors
      const invalidBlock = {
        name: 'invalid',
        // Missing required fields
        inputPorts: [],
        outputPorts: []
      };
      const invalidPath = await writeBlockFile(tempDir, 'invalid', invalidBlock as any);

      // Should emit error event
      const event = await errorPromise;
      expect(event.type).toBe('library-error');
      expect(event.message).toContain('Validation failed');

      // Library should still be empty
      expect(manager.getAllBlocks()).toHaveLength(0);
    });

    it('should continue watching after encountering errors', async () => {
      // Write invalid block
      const invalidBlock = { invalid: true };
      await writeBlockFile(tempDir, 'invalid', invalidBlock as any);
      await sleep(200); // Let it process the error

      // Now write a valid block
      const validBlock = createValidBlockDef('valid_after_error');
      const eventPromise = waitForEvent(manager, 'block-added');
      await writeBlockFile(tempDir, 'valid_after_error', validBlock);

      // Should successfully add the valid block
      const event = await eventPromise;
      expect(event.blockName).toBe('valid_after_error');
      expect(manager.getBlockByName('valid_after_error')).toBeDefined();
    });
  });

  describe('multiple directories', () => {
    it('should watch multiple directories simultaneously', async () => {
      // Create two temp directories
      const tempDir1 = await createTempDir('blockwatcher-multi1-');
      const tempDir2 = await createTempDir('blockwatcher-multi2-');

      try {
        const dirs = [
          createWatchedDirectory(tempDir1, false, 'Directory 1'),
          createWatchedDirectory(tempDir2, false, 'Directory 2')
        ];
        await watcher.start(dirs);

        // Add block to first directory
        const block1 = createValidBlockDef('block1');
        const event1Promise = waitForEvent(manager, 'block-added');
        await writeBlockFile(tempDir1, 'block1', block1);
        await event1Promise;

        // Add block to second directory
        const block2 = createValidBlockDef('block2');
        const event2Promise = waitForEvent(manager, 'block-added');
        await writeBlockFile(tempDir2, 'block2', block2);
        await event2Promise;

        // Both blocks should be in library
        expect(manager.getBlockByName('block1')).toBeDefined();
        expect(manager.getBlockByName('block2')).toBeDefined();
        expect(manager.getAllBlocks()).toHaveLength(2);
      } finally {
        await removeTempDir(tempDir1);
        await removeTempDir(tempDir2);
      }
    });
  });

  describe('helper functions', () => {
    it('createWatchedDirectory should create valid directory config', () => {
      const dir = createWatchedDirectory('/test/path', true, 'Test dir');

      expect(dir).toMatchObject({
        path: expect.stringContaining('test'),
        readOnly: true,
        description: 'Test dir'
      });
      expect(path.isAbsolute(dir.path)).toBe(true);
    });
  });
});
