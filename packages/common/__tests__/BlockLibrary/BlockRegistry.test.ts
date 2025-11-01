/**
 * Unit tests for BlockRegistry
 */

import { BlockRegistry } from '../../src/BlockLibrary/BlockRegistry';
import { BlockDefinition } from '../../src/BlockSchema/types';

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

describe('BlockRegistry', () => {
  let registry: BlockRegistry;

  beforeEach(() => {
    registry = new BlockRegistry();
  });

  describe('Basic Operations', () => {
    it('should start empty', () => {
      expect(registry.size).toBe(0);
      expect(registry.getAll()).toEqual([]);
    });

    it('should add a block', () => {
      const block = createTestBlock({ name: 'gain' });
      registry.add(block);

      expect(registry.size).toBe(1);
      expect(registry.has('gain')).toBe(true);
      expect(registry.get('gain')).toEqual(block);
    });

    it('should throw when adding duplicate block', () => {
      const block = createTestBlock({ name: 'gain' });
      registry.add(block);

      expect(() => registry.add(block)).toThrow("Block 'gain' already exists in registry");
    });

    it('should update an existing block', () => {
      const block1 = createTestBlock({ name: 'gain', version: '1.0.0' });
      const block2 = createTestBlock({ name: 'gain', version: '2.0.0' });

      registry.add(block1);
      registry.update('gain', block2);

      const updated = registry.get('gain');
      expect(updated?.version).toBe('2.0.0');
    });

    it('should throw when updating non-existent block', () => {
      const block = createTestBlock({ name: 'gain' });

      expect(() => registry.update('gain', block)).toThrow("Block 'gain' not found in registry");
    });

    it('should throw when changing block name during update', () => {
      const block1 = createTestBlock({ name: 'gain' });
      const block2 = createTestBlock({ name: 'different_name' });

      registry.add(block1);

      expect(() => registry.update('gain', block2)).toThrow(
        "Cannot change block name from 'gain' to 'different_name' during update"
      );
    });

    it('should remove a block', () => {
      const block = createTestBlock({ name: 'gain' });
      registry.add(block);

      const removed = registry.remove('gain');

      expect(removed).toBe(true);
      expect(registry.has('gain')).toBe(false);
      expect(registry.size).toBe(0);
    });

    it('should return false when removing non-existent block', () => {
      const removed = registry.remove('nonexistent');
      expect(removed).toBe(false);
    });

    it('should clear all blocks', () => {
      registry.add(createTestBlock({ name: 'block1' }));
      registry.add(createTestBlock({ name: 'block2' }));
      registry.add(createTestBlock({ name: 'block3' }));

      expect(registry.size).toBe(3);

      registry.clear();

      expect(registry.size).toBe(0);
      expect(registry.getAll()).toEqual([]);
    });
  });

  describe('Search Operations', () => {
    beforeEach(() => {
      // Add some test blocks
      registry.add(
        createTestBlock({
          name: 'gain',
          category: 'math',
          tags: ['math', 'linear']
        })
      );
      registry.add(
        createTestBlock({
          name: 'integrator',
          category: 'math',
          tags: ['math', 'diffeq']
        })
      );
      registry.add(
        createTestBlock({
          name: 'scope',
          category: 'io',
          tags: ['visualization', 'output']
        })
      );
      registry.add(
        createTestBlock({
          name: 'constant',
          category: 'math',
          tags: ['math', 'source']
        })
      );
    });

    it('should search by name (partial match)', () => {
      const results = registry.search({ name: 'gai' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('gain');
    });

    it('should search by name (case-insensitive)', () => {
      const results = registry.search({ name: 'GAIN' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('gain');
    });

    it('should search by category', () => {
      const results = registry.search({ category: 'math' });
      expect(results).toHaveLength(3);
      expect(results.map((b) => b.name).sort()).toEqual(['constant', 'gain', 'integrator']);
    });

    it('should search by single tag', () => {
      const results = registry.search({ tags: ['diffeq'] });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('integrator');
    });

    it('should search by multiple tags (OR logic)', () => {
      const results = registry.search({ tags: ['diffeq', 'visualization'] });
      expect(results).toHaveLength(2);
      expect(results.map((b) => b.name).sort()).toEqual(['integrator', 'scope']);
    });

    it('should combine name and category search', () => {
      const results = registry.search({ name: 'ga', category: 'math' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('gain');
    });

    it('should return empty array for no matches', () => {
      const results = registry.search({ name: 'nonexistent' });
      expect(results).toEqual([]);
    });

    it('should search by version', () => {
      registry.add(createTestBlock({ name: 'test_v2', version: '2.0.0' }));

      const results = registry.search({ version: '2.0.0' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('test_v2');
    });
  });

  describe('Category Operations', () => {
    beforeEach(() => {
      registry.add(createTestBlock({ name: 'gain', category: 'math' }));
      registry.add(createTestBlock({ name: 'sum', category: 'math' }));
      registry.add(createTestBlock({ name: 'scope', category: 'io' }));
    });

    it('should get blocks by category', () => {
      const mathBlocks = registry.getByCategory('math');
      expect(mathBlocks).toHaveLength(2);
      expect(mathBlocks.map((b) => b.name).sort()).toEqual(['gain', 'sum']);
    });

    it('should return empty array for non-existent category', () => {
      const blocks = registry.getByCategory('nonexistent');
      expect(blocks).toEqual([]);
    });

    it('should get all categories', () => {
      const categories = registry.getAllCategories();
      expect(categories.sort()).toEqual(['io', 'math']);
    });

    it('should update category index when block is removed', () => {
      registry.remove('gain');
      registry.remove('sum');

      const categories = registry.getAllCategories();
      expect(categories).toEqual(['io']);
    });
  });

  describe('Tag Operations', () => {
    beforeEach(() => {
      registry.add(createTestBlock({ name: 'gain', tags: ['math', 'linear'] }));
      registry.add(createTestBlock({ name: 'scope', tags: ['io', 'visual'] }));
    });

    it('should get blocks by tag', () => {
      const mathBlocks = registry.getByTag('math');
      expect(mathBlocks).toHaveLength(1);
      expect(mathBlocks[0].name).toBe('gain');
    });

    it('should return empty array for non-existent tag', () => {
      const blocks = registry.getByTag('nonexistent');
      expect(blocks).toEqual([]);
    });

    it('should get all tags', () => {
      const tags = registry.getAllTags();
      expect(tags.sort()).toEqual(['io', 'linear', 'math', 'visual']);
    });

    it('should update tag index when block is removed', () => {
      registry.remove('gain');

      const tags = registry.getAllTags();
      expect(tags.sort()).toEqual(['io', 'visual']);
    });

    it('should handle blocks with no tags', () => {
      registry.add(createTestBlock({ name: 'no_tags', tags: [] }));

      const blocks = registry.getByTag('math');
      expect(blocks).toHaveLength(1);
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      registry.add(createTestBlock({ name: 'gain', category: 'math', tags: ['math'] }));
      registry.add(createTestBlock({ name: 'sum', category: 'math', tags: ['math'] }));
      registry.add(createTestBlock({ name: 'scope', category: 'io', tags: ['io'] }));
    });

    it('should return correct statistics', () => {
      const stats = registry.getStats();

      expect(stats.totalBlocks).toBe(3);
      expect(stats.byCategory).toEqual({
        math: 2,
        io: 1
      });
      expect(stats.allTags.sort()).toEqual(['io', 'math']);
      expect(stats.lastUpdate).toBeGreaterThan(0);
    });

    it('should update lastUpdate when blocks change', (done) => {
      const stats1 = registry.getStats();

      setTimeout(() => {
        registry.add(createTestBlock({ name: 'new_block' }));
        const stats2 = registry.getStats();

        expect(stats2.lastUpdate).toBeGreaterThan(stats1.lastUpdate);
        done();
      }, 10);
    });
  });

  describe('Index Management', () => {
    it('should update indexes when block is updated', () => {
      const block1 = createTestBlock({
        name: 'test',
        category: 'old_category',
        tags: ['old_tag']
      });
      const block2 = createTestBlock({
        name: 'test',
        category: 'new_category',
        tags: ['new_tag']
      });

      registry.add(block1);
      registry.update('test', block2);

      expect(registry.getByCategory('old_category')).toHaveLength(0);
      expect(registry.getByCategory('new_category')).toHaveLength(1);
      expect(registry.getByTag('old_tag')).toHaveLength(0);
      expect(registry.getByTag('new_tag')).toHaveLength(1);
    });

    it('should handle undefined category as "misc"', () => {
      const block = createTestBlock({ name: 'test', category: undefined });
      registry.add(block);

      const miscBlocks = registry.getByCategory('misc');
      expect(miscBlocks).toHaveLength(1);
    });
  });
});
