/**
 * Unit tests for BlockLibraryManager
 */

import { BlockLibraryManager, getDefaultManager, resetDefaultManager } from '../../src/BlockLibrary/BlockLibraryManager';
import { BlockDefinition } from '../../src/BlockSchema/types';
import { LibraryEvent, LibraryChangeEvent } from '../../src/BlockLibrary/types';

// Helper function to create a test block
function createTestBlock(overrides: Partial<BlockDefinition> = {}): BlockDefinition {
  return {
    schema_version: '1.0.0',
    name: 'test_block',
    version: '1.0.0',
    description: 'A test block',
    category: 'test',
    tags: ['test', 'example'],
    inputPorts: [{ name: 'x', type: 'NUMBER' }],
    outputPorts: [{ name: 'y', type: 'NUMBER' }],
    callbackString: 'return [inputPort[x]]',
    visual: {
      color: '#4CAF50',
      icon: 'test',
      shape: 'rect'
    },
    ...overrides
  };
}

describe('BlockLibraryManager', () => {
  let manager: BlockLibraryManager;

  beforeEach(() => {
    manager = new BlockLibraryManager({ debug: false });
  });

  afterEach(() => {
    manager.removeAllListeners();
  });

  describe('Initialization', () => {
    it('should start uninitialized', () => {
      expect(manager.isInitialized()).toBe(false);
    });

    it('should initialize successfully', async () => {
      await manager.initialize();
      expect(manager.isInitialized()).toBe(true);
    });

    it('should emit library-initialized event', async () => {
      const events: LibraryEvent[] = [];
      manager.addEventListener('library-initialized', (event) => events.push(event));

      await manager.initialize();

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('library-initialized');
    });

    it('should not initialize twice', async () => {
      await manager.initialize();
      await manager.initialize(); // Should be a no-op

      expect(manager.isInitialized()).toBe(true);
    });

    it('should throw when accessing methods before initialization', () => {
      expect(() => manager.getAllBlocks()).toThrow(
        'Block library not initialized'
      );
    });
  });

  describe('Block Operations', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should add a valid block', () => {
      const block = createTestBlock({ name: 'gain' });
      manager.addBlock(block);

      expect(manager.getBlockByName('gain')).toEqual(block);
    });

    it('should emit block-added event', () => {
      const events: LibraryChangeEvent[] = [];
      manager.addEventListener('block-added', (event) => events.push(event as LibraryChangeEvent));

      const block = createTestBlock({ name: 'gain' });
      manager.addBlock(block);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('block-added');
      expect(events[0].blockName).toBe('gain');
      expect(events[0].block).toEqual(block);
    });

    it('should reject invalid block', () => {
      const invalidBlock = {
        name: 'invalid',
        // Missing required fields
      } as unknown as BlockDefinition;

      expect(() => manager.addBlock(invalidBlock)).toThrow();
    });

    it('should update an existing block', () => {
      const block1 = createTestBlock({ name: 'gain', version: '1.0.0' });
      const block2 = createTestBlock({ name: 'gain', version: '2.0.0' });

      manager.addBlock(block1);
      manager.updateBlock('gain', block2);

      const updated = manager.getBlockByName('gain');
      expect(updated?.version).toBe('2.0.0');
    });

    it('should emit block-updated event', () => {
      const events: LibraryChangeEvent[] = [];
      manager.addEventListener('block-updated', (event) => events.push(event as LibraryChangeEvent));

      const block1 = createTestBlock({ name: 'gain', version: '1.0.0' });
      const block2 = createTestBlock({ name: 'gain', version: '2.0.0' });

      manager.addBlock(block1);
      manager.updateBlock('gain', block2);

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('block-updated');
      expect(events[0].blockName).toBe('gain');
    });

    it('should remove a block', () => {
      const block = createTestBlock({ name: 'gain' });
      manager.addBlock(block);

      const removed = manager.removeBlock('gain');

      expect(removed).toBe(true);
      expect(manager.getBlockByName('gain')).toBeUndefined();
    });

    it('should emit block-removed event', () => {
      const events: LibraryChangeEvent[] = [];
      manager.addEventListener('block-removed', (event) => events.push(event as LibraryChangeEvent));

      const block = createTestBlock({ name: 'gain' });
      manager.addBlock(block);
      manager.removeBlock('gain');

      expect(events).toHaveLength(1);
      expect(events[0].type).toBe('block-removed');
      expect(events[0].blockName).toBe('gain');
    });

    it('should return false when removing non-existent block', () => {
      const removed = manager.removeBlock('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('Search and Query Operations', () => {
    beforeEach(async () => {
      await manager.initialize();

      // Add test blocks
      manager.addBlock(createTestBlock({ name: 'gain', category: 'math', tags: ['math'] }));
      manager.addBlock(createTestBlock({ name: 'sum', category: 'math', tags: ['math'] }));
      manager.addBlock(createTestBlock({ name: 'scope', category: 'io', tags: ['visualization'] }));
    });

    it('should get all blocks', () => {
      const blocks = manager.getAllBlocks();
      expect(blocks).toHaveLength(3);
    });

    it('should search blocks by name', () => {
      const results = manager.searchBlocks({ name: 'gai' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('gain');
    });

    it('should search blocks by category', () => {
      const results = manager.searchBlocks({ category: 'math' });
      expect(results).toHaveLength(2);
    });

    it('should search blocks by tags', () => {
      const results = manager.searchBlocks({ tags: ['math'] });
      expect(results).toHaveLength(2);
    });

    it('should get blocks by category', () => {
      const blocks = manager.getBlocksByCategory('math');
      expect(blocks).toHaveLength(2);
    });

    it('should get blocks by tag', () => {
      const blocks = manager.getBlocksByTag('math');
      expect(blocks).toHaveLength(2);
    });

    it('should get all categories', () => {
      const categories = manager.getAllCategories();
      expect(categories.sort()).toEqual(['io', 'math']);
    });

    it('should get all tags', () => {
      const tags = manager.getAllTags();
      expect(tags.sort()).toEqual(['math', 'visualization']);
    });
  });

  describe('Statistics', () => {
    beforeEach(async () => {
      await manager.initialize();
      manager.addBlock(createTestBlock({ name: 'gain', category: 'math' }));
      manager.addBlock(createTestBlock({ name: 'sum', category: 'math' }));
      manager.addBlock(createTestBlock({ name: 'scope', category: 'io' }));
    });

    it('should return correct statistics', () => {
      const stats = manager.getStats();

      expect(stats.totalBlocks).toBe(3);
      expect(stats.byCategory).toEqual({
        math: 2,
        io: 1
      });
    });
  });

  describe('Validation', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should reject block with invalid callback syntax', () => {
      const block = createTestBlock({
        name: 'invalid_callback',
        callbackString: 'this is not valid javascript {'
      });

      expect(() => manager.addBlock(block)).toThrow('validation failed');
    });

    it('should reject block with duplicate port names', () => {
      const block = createTestBlock({
        name: 'duplicate_ports',
        inputPorts: [
          { name: 'x', type: 'NUMBER' },
          { name: 'x', type: 'NUMBER' } // Duplicate!
        ]
      });

      expect(() => manager.addBlock(block)).toThrow('validation failed');
    });

    it('should reject block with invalid port reference in callback', () => {
      const block = createTestBlock({
        name: 'invalid_port_ref',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        callbackString: 'return [inputPort[nonexistent]]' // References non-existent port
      });

      expect(() => manager.addBlock(block)).toThrow('validation failed');
    });

    it('should warn about missing description (non-strict mode)', () => {
      const block = createTestBlock({
        name: 'no_description',
        description: ''
      });

      // Should not throw in non-strict mode
      expect(() => manager.addBlock(block)).not.toThrow();
    });

    it('should reject warnings in strict mode', () => {
      const strictManager = new BlockLibraryManager({ strictValidation: true });
      strictManager.initialize();

      const block = createTestBlock({
        name: 'no_description',
        description: ''
      });

      expect(() => strictManager.addBlock(block)).toThrow('has warnings');
    });
  });

  describe('Event Listeners', () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it('should support event listener registration', () => {
      const events: LibraryChangeEvent[] = [];
      const unsubscribe = manager.addEventListener('block-added', (event) => events.push(event as LibraryChangeEvent));

      manager.addBlock(createTestBlock({ name: 'test1' }));
      expect(events).toHaveLength(1);

      unsubscribe();

      manager.addBlock(createTestBlock({ name: 'test2' }));
      expect(events).toHaveLength(1); // No new events after unsubscribe
    });

    it('should support once listeners', () => {
      const events: LibraryChangeEvent[] = [];
      manager.addEventListenerOnce('block-added', (event) => events.push(event as LibraryChangeEvent));

      manager.addBlock(createTestBlock({ name: 'test1' }));
      manager.addBlock(createTestBlock({ name: 'test2' }));

      expect(events).toHaveLength(1); // Only first event captured
    });

    it('should support multiple listeners', () => {
      const events1: LibraryChangeEvent[] = [];
      const events2: LibraryChangeEvent[] = [];

      manager.addEventListener('block-added', (event) => events1.push(event as LibraryChangeEvent));
      manager.addEventListener('block-added', (event) => events2.push(event as LibraryChangeEvent));

      manager.addBlock(createTestBlock({ name: 'test' }));

      expect(events1).toHaveLength(1);
      expect(events2).toHaveLength(1);
    });

    it('should support listener removal', () => {
      const events: LibraryChangeEvent[] = [];
      const callback = (event: LibraryEvent) => events.push(event as LibraryChangeEvent);

      manager.addEventListener('block-added', callback);
      manager.addBlock(createTestBlock({ name: 'test1' }));

      manager.removeEventListener('block-added', callback);
      manager.addBlock(createTestBlock({ name: 'test2' }));

      expect(events).toHaveLength(1);
    });
  });

  describe('Default Manager Singleton', () => {
    afterEach(() => {
      resetDefaultManager();
    });

    it('should return the same instance', () => {
      const manager1 = getDefaultManager();
      const manager2 = getDefaultManager();

      expect(manager1).toBe(manager2);
    });

    it('should create new instance after reset', () => {
      const manager1 = getDefaultManager();
      resetDefaultManager();
      const manager2 = getDefaultManager();

      expect(manager1).not.toBe(manager2);
    });

    it('should use provided options on first call', () => {
      const manager = getDefaultManager({ debug: true });
      // Can't directly test debug flag, but ensures it doesn't throw
      expect(manager).toBeDefined();
    });
  });

  describe('Clear Operation', () => {
    beforeEach(async () => {
      await manager.initialize();
      manager.addBlock(createTestBlock({ name: 'test1' }));
      manager.addBlock(createTestBlock({ name: 'test2' }));
    });

    it('should clear all blocks', () => {
      expect(manager.getAllBlocks()).toHaveLength(2);

      manager.clear();

      expect(manager.getAllBlocks()).toHaveLength(0);
    });
  });
});
