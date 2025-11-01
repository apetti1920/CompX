/**
 * Unit tests for async validation features
 * Tests path verification and async validation methods
 */

import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { BlockValidator, BlockValidatorOptions } from '../../src/BlockSchema/validator';
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
    console.warn(`Warning: Failed to remove temp dir ${dirPath}:`, error);
  }
}

describe('BlockValidator - Async Validation', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await createTempDir('validator-async-test-');
  });

  afterEach(async () => {
    await removeTempDir(tempDir);
  });

  /**
   * Create a valid test block
   */
  function createValidBlock(): BlockDefinition {
    return {
      schema_version: '1.0.0',
      name: 'test_block',
      version: '1.0.0',
      description: 'Test block',
      category: 'test',
      tags: ['test'],
      inputPorts: [{ name: 'x', type: 'NUMBER' }],
      outputPorts: [{ name: 'y', type: 'NUMBER' }],
      callbackString: 'return [inputPort[x] * 2]',
      visual: {
        color: '#FF0000',
        icon: 'test-icon',
        shape: 'rect'
      }
    };
  }

  describe('path verification disabled (default)', () => {
    it('should not verify paths when verifyPaths is false', async () => {
      const validator = new BlockValidator({ verifyPaths: false });
      const block = createValidBlock();
      block.visual = { icon: 'nonexistent/path/to/icon.png' };

      const result = await validator.validateAsync(block);

      // Should not have path-related warnings
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });

    it('should still perform other validations', async () => {
      const validator = new BlockValidator({ verifyPaths: false });
      const invalidBlock: any = {
        schema_version: '1.0.0',
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'INVALID_TYPE' }],
        outputPorts: [],
        callbackString: 'invalid syntax {'
      };

      const result = await validator.validateAsync(invalidBlock);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('path verification enabled', () => {
    it('should warn when icon file does not exist', async () => {
      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      block.visual = { icon: 'missing-icon.png' };

      const result = await validator.validateAsync(block);

      // Should have warning about missing icon
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings.length).toBeGreaterThan(0);
      expect(pathWarnings[0].message).toContain('not found');
    });

    it('should not warn when icon file exists', async () => {
      const iconPath = path.join(tempDir, 'test-icon.png');
      await fs.writeFile(iconPath, 'fake icon data');

      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      block.visual = { icon: 'test-icon.png' };

      const result = await validator.validateAsync(block);

      // Should not have warning about icon
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });

    it('should skip validation for icon identifiers (non-paths)', async () => {
      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      block.visual = { icon: 'multiply' }; // Icon identifier, not a path

      const result = await validator.validateAsync(block);

      // Should not try to verify non-path icon identifiers
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });

    it('should handle absolute icon paths', async () => {
      const iconPath = path.join(tempDir, 'absolute-icon.png');
      await fs.writeFile(iconPath, 'fake icon data');

      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: '/some/other/dir' // Different base dir
      });

      const block = createValidBlock();
      block.visual = { icon: iconPath }; // Absolute path

      const result = await validator.validateAsync(block);

      // Should find the absolute path
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });

    it('should resolve relative paths from baseDir', async () => {
      const subdir = path.join(tempDir, 'icons');
      await fs.mkdir(subdir);
      const iconPath = path.join(subdir, 'nested-icon.png');
      await fs.writeFile(iconPath, 'fake icon data');

      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      block.visual = { icon: 'icons/nested-icon.png' };

      const result = await validator.validateAsync(block);

      // Should find the icon in the subdirectory
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });

    it('should handle blocks without visual properties', async () => {
      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      delete block.visual;

      const result = await validator.validateAsync(block);

      // Should not crash, and should still validate other aspects
      expect(result).toBeDefined();
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });
  });

  describe('integration with other validation', () => {
    it('should combine path warnings with schema warnings', async () => {
      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      delete block.description; // Will trigger a warning
      block.visual = { icon: 'missing.png' }; // Will trigger path warning

      const result = await validator.validateAsync(block);

      // Should have both types of warnings
      expect(result.warnings.length).toBeGreaterThanOrEqual(2);

      const descWarnings = result.warnings.filter((w) => w.field === 'description');
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');

      expect(descWarnings.length).toBeGreaterThan(0);
      expect(pathWarnings.length).toBeGreaterThan(0);
    });

    it('should not verify paths if schema validation fails', async () => {
      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const invalidBlock: any = {
        // Missing required fields
        schema_version: '1.0.0',
        name: 'invalid'
      };

      const result = await validator.validateAsync(invalidBlock);

      // Should fail schema validation
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);

      // Should not have path warnings (didn't get to path validation)
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });
  });

  describe('synchronous vs asynchronous validation', () => {
    it('synchronous validate should not check paths', () => {
      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      block.visual = { icon: 'missing.png' };

      const result = validator.validate(block);

      // Sync validation should NOT include path warnings
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings).toHaveLength(0);
    });

    it('async validate should check paths when enabled', async () => {
      const validator = new BlockValidator({
        verifyPaths: true,
        baseDir: tempDir
      });

      const block = createValidBlock();
      block.visual = { icon: 'missing.png' };

      const result = await validator.validateAsync(block);

      // Async validation SHOULD include path warnings
      const pathWarnings = result.warnings.filter((w) => w.field === 'visual.icon');
      expect(pathWarnings.length).toBeGreaterThan(0);
    });

    it('both methods should produce same results for non-path validation', async () => {
      const validator = new BlockValidator({ verifyPaths: false });
      const block = createValidBlock();

      const syncResult = validator.validate(block);
      const asyncResult = await validator.validateAsync(block);

      expect(syncResult.valid).toBe(asyncResult.valid);
      expect(syncResult.errors).toEqual(asyncResult.errors);
      expect(syncResult.warnings).toEqual(asyncResult.warnings);
    });
  });
});
