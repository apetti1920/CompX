/**
 * Edge case tests for Block Definition Schema
 * Tests boundary conditions, limits, and corner cases
 */

import { validateBlock } from '../../src/BlockSchema/validator';
import { BlockDefinition, CURRENT_SCHEMA_VERSION } from '../../src/BlockSchema/types';

describe('BlockSchema Edge Cases', () => {
  describe('String length boundaries', () => {
    it('accepts block name with maximum length (64 chars)', () => {
      const longName = 'a'.repeat(64);
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: longName,
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('rejects block name exceeding maximum length (65 chars)', () => {
      const tooLongName = 'a'.repeat(65);
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: tooLongName,
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('accepts description at maximum length (500 chars)', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        description: 'x'.repeat(500),
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('rejects description exceeding maximum length (501 chars)', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        description: 'x'.repeat(501),
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('accepts callback string at maximum length (10000 chars)', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return [' + '1,'.repeat(4995) + '1]' // ~10000 chars
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('rejects empty callback string', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: ''
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });
  });

  describe('Array boundaries', () => {
    it('accepts maximum number of input ports (20)', () => {
      const inputPorts = Array.from({ length: 20 }, (_, i) => ({
        name: `input${i}`,
        type: 'NUMBER' as const
      }));

      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts,
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('rejects more than maximum input ports (21)', () => {
      const inputPorts = Array.from({ length: 21 }, (_, i) => ({
        name: `input${i}`,
        type: 'NUMBER'
      }));

      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts,
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('accepts maximum number of output ports (20)', () => {
      const outputPorts = Array.from({ length: 20 }, (_, i) => ({
        name: `output${i}`,
        type: 'NUMBER' as const
      }));

      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts,
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts maximum number of tags (10)', () => {
      const tags = Array.from({ length: 10 }, (_, i) => `tag${i}`);

      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        tags,
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('rejects more than maximum tags (11)', () => {
      const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);

      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        tags,
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('rejects duplicate tags', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        tags: ['math', 'linear', 'math'], // Duplicate 'math'
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });
  });

  describe('Port name patterns', () => {
    it('accepts port names starting with uppercase', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'Input1', type: 'NUMBER' }],
        outputPorts: [{ name: 'Output1', type: 'NUMBER' }],
        callbackString: 'return [inputPort[Input1]]'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts port names with underscores', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'input_1', type: 'NUMBER' }],
        outputPorts: [{ name: 'output_1', type: 'NUMBER' }],
        callbackString: 'return [inputPort[input_1]]'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('rejects port names starting with number', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: '1input', type: 'NUMBER' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('rejects port names with hyphens', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'input-1', type: 'NUMBER' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });
  });

  describe('Callback string edge cases', () => {
    it('accepts multi-line callback strings', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: `
          const temp = inputPort[x] * 2;
          const result = temp + 1;
          return [result];
        `
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts callback with comments', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: `
          // Calculate the output
          const result = inputPort[x] * 2; // Double the input
          return [result];
        `
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts callback with multiple return statements', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: `
          if (inputPort[x] > 0) {
            return [inputPort[x]];
          } else {
            return [0];
          }
        `
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('detects syntax error: missing closing bracket', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return ['
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid JavaScript syntax'))).toBe(true);
    });

    it('detects syntax error: invalid JavaScript', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return [}]'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });
  });

  describe('Initial value type matching', () => {
    it('accepts number initial value for NUMBER port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER', initialValue: 42 }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts negative number for NUMBER port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER', initialValue: -42.5 }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts zero for NUMBER port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER', initialValue: 0 }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts string initial value for STRING port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'STRING', initialValue: 'hello' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts empty string for STRING port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'STRING', initialValue: '' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('accepts boolean initial value for BOOLEAN port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'BOOLEAN', initialValue: true }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });
  });

  describe('Port reference validation', () => {
    it('detects multiple references to same non-existent port', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[z] + inputPort[z]]' // z doesn't exist
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('unknown input port'))).toBe(true);
    });

    it('accepts dot notation for port access', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort.x * 2]'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('detects invalid dot notation reference', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort.z * 2]' // z doesn't exist
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('accepts mixing bracket and dot notation', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [
          { name: 'x', type: 'NUMBER', initialValue: 0 },
          { name: 'y', type: 'NUMBER' }
        ],
        outputPorts: [{ name: 'z', type: 'NUMBER' }],
        callbackString: 'return [inputPort[x] + inputPort.y + prevInput[x]]'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });
  });

  describe('Special characters and Unicode', () => {
    it('accepts port names with numbers', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'input1', type: 'NUMBER' }],
        outputPorts: [{ name: 'output2', type: 'NUMBER' }],
        callbackString: 'return [inputPort[input1]]'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(true);
    });

    it('rejects Unicode characters in port names', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'entrée', type: 'NUMBER' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('accepts all valid hex colors', () => {
      const colors = ['#000000', '#FFFFFF', '#FF5722', '#4CAF50', '#2196F3'];

      colors.forEach((color) => {
        const block: BlockDefinition = {
          schema_version: CURRENT_SCHEMA_VERSION,
          name: 'test',
          version: '1.0.0',
          inputPorts: [],
          outputPorts: [],
          callbackString: 'return []',
          visual: { color }
        };

        const result = validateBlock(block);
        expect(result.valid).toBe(true);
      });
    });

    it('rejects invalid hex color formats', () => {
      const invalidColors = ['#FFF', '#GGGGGG', 'red', 'rgb(255,0,0)', '#12345'];

      invalidColors.forEach((color) => {
        const block = {
          schema_version: CURRENT_SCHEMA_VERSION,
          name: 'test',
          version: '1.0.0',
          inputPorts: [],
          outputPorts: [],
          callbackString: 'return []',
          visual: { color }
        };

        const result = validateBlock(block);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('Additional properties', () => {
    it('rejects block with unexpected top-level property', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []',
        unexpectedProperty: 'should not be here'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('rejects port with unexpected property', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [
          {
            name: 'x',
            type: 'NUMBER',
            unexpectedProperty: 'extra'
          }
        ],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });

    it('rejects visual with unexpected property', () => {
      const block = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []',
        visual: {
          color: '#4CAF50',
          unexpectedProperty: 'extra'
        }
      };

      const result = validateBlock(block);
      expect(result.valid).toBe(false);
    });
  });
});
