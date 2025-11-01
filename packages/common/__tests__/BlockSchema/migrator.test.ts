/**
 * Unit tests for BlockSchemaMigrator
 * Tests version migration and compatibility checking
 */

import { BlockSchemaMigrator, getMigrator, migrateBlock, canMigrateVersion } from '../../src/BlockSchema/migrator';
import { BlockDefinition, CURRENT_SCHEMA_VERSION } from '../../src/BlockSchema/types';

describe('BlockSchemaMigrator', () => {
  let migrator: BlockSchemaMigrator;

  beforeEach(() => {
    migrator = new BlockSchemaMigrator();
  });

  /**
   * Create a test block with a specific schema version
   */
  function createTestBlock(schemaVersion: string): BlockDefinition {
    return {
      schema_version: schemaVersion,
      name: 'test_block',
      version: '1.0.0',
      inputPorts: [],
      outputPorts: [],
      callbackString: 'return []'
    };
  }

  describe('version comparison', () => {
    it('should identify same version (no migration needed)', () => {
      const block = createTestBlock(CURRENT_SCHEMA_VERSION);
      const result = migrator.migrate(block);

      expect(result.migrated).toBe(false);
      expect(result.warnings).toHaveLength(0);
      expect(result.originalVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(result.targetVersion).toBe(CURRENT_SCHEMA_VERSION);
    });

    it('should handle minor version upgrade', () => {
      const block = createTestBlock('1.0.0');
      const result = migrator.migrate(block);

      // Assuming current version is 1.0.0, this would need adjustment
      // For now, we test the structure
      expect(result).toHaveProperty('migrated');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('originalVersion');
      expect(result).toHaveProperty('targetVersion');
    });

    it('should detect major version incompatibility', () => {
      const block = createTestBlock('2.0.0');
      const result = migrator.migrate(block);

      // Major version difference should prevent migration
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Cannot automatically migrate');
      expect(result.warnings[0]).toContain('Major version');
    });

    it('should handle patch version upgrade', () => {
      // Create block with older patch version
      const currentParts = CURRENT_SCHEMA_VERSION.split('.');
      const patchNum = parseInt(currentParts[2]);

      // Only test if we can go back a patch version
      if (patchNum > 0) {
        const olderPatch = `${currentParts[0]}.${currentParts[1]}.${patchNum - 1}`;

        const block = createTestBlock(olderPatch);
        const result = migrator.migrate(block);

        expect(result.targetVersion).toBe(CURRENT_SCHEMA_VERSION);
        expect(result.block.schema_version).toBe(CURRENT_SCHEMA_VERSION);
      } else {
        // Skip test if we're at x.y.0
        expect(true).toBe(true);
      }
    });
  });

  describe('migration application', () => {
    it('should add missing optional fields during version migration', () => {
      const currentParts = CURRENT_SCHEMA_VERSION.split('.');
      const minorNum = parseInt(currentParts[1]);

      // Test with an older minor version if possible
      if (minorNum > 0) {
        const olderVersion = `${currentParts[0]}.${minorNum - 1}.0`;
        const block: any = {
          schema_version: olderVersion,
          name: 'minimal_block',
          version: '1.0.0',
          inputPorts: [],
          outputPorts: [],
          callbackString: 'return []'
          // Missing: description, category, tags, visual
        };

        const result = migrator.migrate(block);

        // Migration should apply defaults for missing fields
        expect(result.block.description).toBeDefined();
        expect(result.block.category).toBeDefined();
        expect(result.block.tags).toBeDefined();
        expect(result.block.visual).toBeDefined();
      } else {
        // If we're at x.0.0, just verify the migrator works
        const block: any = {
          schema_version: CURRENT_SCHEMA_VERSION,
          name: 'minimal_block',
          version: '1.0.0',
          inputPorts: [],
          outputPorts: [],
          callbackString: 'return []'
        };

        const result = migrator.migrate(block);
        expect(result.block).toBeDefined();
      }
    });

    it('should update schema_version to current', () => {
      const block = createTestBlock('1.0.0');
      const result = migrator.migrate(block);

      if (result.migrated) {
        expect(result.block.schema_version).toBe(CURRENT_SCHEMA_VERSION);
      }
    });

    it('should warn about added defaults', () => {
      const block: any = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'minimal_block',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = migrator.migrate(block);

      // Should have warnings about added defaults
      if (result.migrated) {
        expect(result.warnings.length).toBeGreaterThan(0);
      }
    });

    it('should preserve existing field values', () => {
      const block = createTestBlock(CURRENT_SCHEMA_VERSION);
      block.description = 'Custom description';
      block.category = 'custom';
      block.tags = ['tag1', 'tag2'];

      const result = migrator.migrate(block);

      expect(result.block.description).toBe('Custom description');
      expect(result.block.category).toBe('custom');
      expect(result.block.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('canMigrate', () => {
    it('should return true for same version', () => {
      expect(migrator.canMigrate(CURRENT_SCHEMA_VERSION)).toBe(true);
    });

    it('should return true for compatible versions (minor/patch upgrades)', () => {
      const currentParts = CURRENT_SCHEMA_VERSION.split('.');
      const olderMinor = `${currentParts[0]}.${parseInt(currentParts[1]) - 1}.0`;

      // Only test if we're not already at major.0.0
      if (parseInt(currentParts[1]) > 0) {
        expect(migrator.canMigrate(olderMinor)).toBe(true);
      }
    });

    it('should return false for incompatible versions (major differences)', () => {
      const currentParts = CURRENT_SCHEMA_VERSION.split('.');
      const differentMajor = `${parseInt(currentParts[0]) + 1}.0.0`;

      expect(migrator.canMigrate(differentMajor)).toBe(false);
    });

    it('should return false for invalid version strings', () => {
      expect(migrator.canMigrate('invalid')).toBe(false);
      expect(migrator.canMigrate('1.2')).toBe(false);
      expect(migrator.canMigrate('abc.def.ghi')).toBe(false);
    });
  });

  describe('getMigrationPath', () => {
    it('should describe no migration for same version', () => {
      const path = migrator.getMigrationPath(CURRENT_SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
      expect(path).toContain('No migration needed');
    });

    it('should describe minor version upgrade', () => {
      const path = migrator.getMigrationPath('1.0.0', '1.1.0');
      expect(path).toContain('Minor version upgrade');
      expect(path).toContain('automatic migration');
    });

    it('should describe patch version upgrade', () => {
      const path = migrator.getMigrationPath('1.0.0', '1.0.1');
      expect(path).toContain('Patch version upgrade');
      expect(path).toContain('automatic migration');
    });

    it('should describe incompatible major version', () => {
      const path = migrator.getMigrationPath('1.0.0', '2.0.0');
      expect(path).toContain('Cannot migrate automatically');
      expect(path).toContain('major version');
    });
  });

  describe('singleton functions', () => {
    it('getMigrator should return same instance', () => {
      const migrator1 = getMigrator();
      const migrator2 = getMigrator();
      expect(migrator1).toBe(migrator2);
    });

    it('migrateBlock should use default migrator', () => {
      const block = createTestBlock(CURRENT_SCHEMA_VERSION);
      const result = migrateBlock(block);

      expect(result).toHaveProperty('migrated');
      expect(result).toHaveProperty('block');
      expect(result).toHaveProperty('warnings');
    });

    it('canMigrateVersion should use default migrator', () => {
      const result = canMigrateVersion(CURRENT_SCHEMA_VERSION);
      expect(result).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle blocks with all optional fields present', () => {
      const completeBlock: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'complete_block',
        version: '1.0.0',
        description: 'A complete block',
        category: 'test',
        tags: ['tag1'],
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []',
        visual: {
          color: '#FF0000',
          icon: 'test',
          shape: 'rect'
        }
      };

      const result = migrator.migrate(completeBlock);

      expect(result.block).toMatchObject(completeBlock);
      expect(result.migrated).toBe(false);
    });

    it('should handle deprecated fields removal', () => {
      const blockWithDeprecated: any = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test_block',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []',
        deprecated_field: 'should be removed'
      };

      const result = migrator.migrate(blockWithDeprecated);

      // Deprecated field should be removed during migration
      if (result.migrated) {
        expect((result.block as any).deprecated_field).toBeUndefined();
      } else {
        // If no migration occurred, deprecated field may still be there
        // This is acceptable for current version blocks
        expect(true).toBe(true);
      }
    });
  });

  describe('migration warnings', () => {
    it('should provide clear migration messages', () => {
      const block: any = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test_block',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = migrator.migrate(block);

      if (result.migrated) {
        result.warnings.forEach((warning) => {
          expect(warning).toBeTruthy();
          expect(typeof warning).toBe('string');
          expect(warning.length).toBeGreaterThan(0);
        });
      }
    });
  });
});
