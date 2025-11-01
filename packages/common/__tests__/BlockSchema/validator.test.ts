/**
 * Tests for Block Definition Validator
 */

import { BlockValidator, validateBlock } from '../../src/BlockSchema/validator';
import { BlockDefinition, CURRENT_SCHEMA_VERSION, ValidationError } from '../../src/BlockSchema/types';

describe('BlockValidator', () => {
  let validator: BlockValidator;

  beforeEach(() => {
    validator = new BlockValidator();
  });

  describe('Valid block definitions', () => {
    it('validates a simple constant block', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'constant',
        version: '1.0.0',
        description: 'A constant signal',
        category: 'math',
        tags: ['math'],
        inputPorts: [],
        outputPorts: [{ name: 'c', type: 'NUMBER' }],
        callbackString: 'return [5]',
        visual: {
          color: '#4CAF50',
          icon: 'square',
          shape: 'rect'
        }
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates a gain block with input and output', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'gain',
        version: '1.0.0',
        description: 'Multiply a signal by a constant value',
        category: 'math',
        tags: ['math', 'linear'],
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[x] * 0.75]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates an integrator block with initial value', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'integrator',
        version: '1.0.0',
        description: 'Integrates a signal',
        category: 'math',
        tags: ['math', 'diffeq'],
        inputPorts: [{ name: 'x', type: 'NUMBER', initialValue: 0 }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevOutput[y] + dt * (prevInput[x] + inputPort[x]) / 2]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('validates minimal block definition (only required fields)', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'minimal',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Schema validation errors', () => {
    it('rejects block without required fields', () => {
      const block = {
        name: 'invalid'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('rejects block with invalid name pattern', () => {
      const block: Partial<BlockDefinition> = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'Invalid-Name-123', // Should be lowercase with underscores only
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.field === 'name')).toBe(true);
    });

    it('rejects block with invalid version format', () => {
      const block: Partial<BlockDefinition> = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: 'v1.0', // Should be semver format
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.field === 'version')).toBe(true);
    });

    it('rejects block with invalid port type', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'INVALID_TYPE' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.field.includes('inputPorts'))).toBe(true);
    });

    it('rejects block with invalid hex color', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []',
        visual: {
          color: 'red', // Should be hex format
          shape: 'rect'
        }
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.field.includes('visual.color'))).toBe(true);
    });

    it('rejects block with invalid shape', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []',
        visual: {
          shape: 'pentagon' // Only rect, circ, tri allowed
        }
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.field.includes('visual.shape'))).toBe(true);
    });
  });

  describe('Semantic validation', () => {
    it('detects duplicate port names', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [
          { name: 'x', type: 'NUMBER' },
          { name: 'x', type: 'NUMBER' } // Duplicate!
        ],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.message.includes('Duplicate port names'))).toBe(true);
    });

    it('detects reference to non-existent input port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[z]]' // z doesn't exist
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.message.includes('unknown input port'))).toBe(true);
    });

    it('detects prevInput usage without initial value', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }], // No initialValue
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevInput[x]]' // prevInput requires initialValue
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.message.includes('no initialValue'))).toBe(true);
    });

    it('detects reference to non-existent output port in prevOutput', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevOutput[z]]' // z doesn't exist
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.message.includes('unknown output port'))).toBe(true);
    });

    it('detects invalid JavaScript syntax in callback', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return [' // Invalid syntax
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.message.includes('Invalid JavaScript syntax'))).toBe(true);
    });

    it('detects type mismatch in initial value', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER', initialValue: 'not a number' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e: ValidationError) => e.message.includes('Initial value for NUMBER port'))).toBe(
        true
      );
    });
  });

  describe('Warnings', () => {
    it('warns about missing description', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w: ValidationError) => w.field === 'description')).toBe(true);
    });

    it('warns about missing tags', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        description: 'A test block',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w: ValidationError) => w.field === 'tags')).toBe(true);
    });

    it('warns about schema version mismatch', () => {
      const block: BlockDefinition = {
        schema_version: '0.9.0', // Different from current
        name: 'test',
        version: '1.0.0',
        description: 'A test block',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
      expect(result.warnings.some((w: ValidationError) => w.field === 'schema_version')).toBe(true);
    });
  });

  describe('Convenience function', () => {
    it('validateBlock function works', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });
  });
});
