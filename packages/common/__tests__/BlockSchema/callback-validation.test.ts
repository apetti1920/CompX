/**
 * Comprehensive callback string validation tests
 * Tests port reference extraction and validation logic
 */

import { BlockValidator } from '../../src/BlockSchema/validator';
import { BlockDefinition, CURRENT_SCHEMA_VERSION } from '../../src/BlockSchema/types';

describe('Callback String Validation', () => {
  let validator: BlockValidator;

  beforeEach(() => {
    validator = new BlockValidator();
  });

  describe('Port reference extraction', () => {
    it('extracts single inputPort reference with bracket notation', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[x]]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('extracts multiple inputPort references', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [
          { name: 'a', type: 'NUMBER' },
          { name: 'b', type: 'NUMBER' }
        ],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[a] + inputPort[b]]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('extracts prevOutput references', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevOutput[y] + inputPort[x]]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates prevInput requires initialValue', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER', initialValue: 0 }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevInput[x] + inputPort[x]]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('detects prevInput without initialValue', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }], // No initialValue!
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevInput[x]]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('no initialValue'))).toBe(true);
    });
  });

  describe('Complex callback patterns', () => {
    it('validates integrator callback (trapezoidal rule)', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'integrator',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER', initialValue: 0 }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevOutput[y] + dt * (prevInput[x] + inputPort[x]) / 2]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates PID controller-like callback', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'pid',
        version: '1.0.0',
        inputPorts: [
          { name: 'error', type: 'NUMBER', initialValue: 0 },
          { name: 'kp', type: 'NUMBER' },
          { name: 'ki', type: 'NUMBER' },
          { name: 'kd', type: 'NUMBER' }
        ],
        outputPorts: [
          { name: 'output', type: 'NUMBER' },
          { name: 'integral', type: 'NUMBER' }
        ],
        callbackString: `
          const P = inputPort[kp] * inputPort[error];
          const I = prevOutput[integral] + inputPort[ki] * inputPort[error] * dt;
          const D = inputPort[kd] * (inputPort[error] - prevInput[error]) / dt;
          return [P + I + D, I];
        `
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates state machine callback', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'state_machine',
        version: '1.0.0',
        inputPorts: [{ name: 'trigger', type: 'NUMBER' }],
        outputPorts: [{ name: 'state', type: 'NUMBER' }],
        callbackString: `
          let state = prevOutput[state] || 0;
          if (inputPort[trigger] > 0.5) {
            state = (state + 1) % 3;
          }
          return [state];
        `
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates callback with Math functions', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'trig',
        version: '1.0.0',
        inputPorts: [{ name: 'angle', type: 'NUMBER' }],
        outputPorts: [
          { name: 'sin', type: 'NUMBER' },
          { name: 'cos', type: 'NUMBER' }
        ],
        callbackString: `
          const a = inputPort[angle];
          return [Math.sin(a), Math.cos(a)];
        `
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates callback with conditional logic', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'saturator',
        version: '1.0.0',
        inputPorts: [
          { name: 'x', type: 'NUMBER' },
          { name: 'min', type: 'NUMBER' },
          { name: 'max', type: 'NUMBER' }
        ],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: `
          let y = inputPort[x];
          if (y < inputPort[min]) y = inputPort[min];
          if (y > inputPort[max]) y = inputPort[max];
          return [y];
        `
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });
  });

  describe('Invalid callback patterns', () => {
    it('detects reference to non-existent input', () => {
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
      expect(result.errors.some((e) => e.message.includes('unknown input port') && e.message.includes('z'))).toBe(true);
    });

    it('detects reference to non-existent output in prevOutput', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [prevOutput[z]]' // z doesn't exist
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('unknown output port') && e.message.includes('z'))).toBe(
        true
      );
    });

    it('detects multiple undefined references', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[a] + inputPort[b] + inputPort[c]]' // None exist
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.filter((e) => e.message.includes('unknown input port')).length).toBe(3);
    });

    it('detects syntax error: unclosed string', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return ["unclosed string]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('Invalid JavaScript syntax'))).toBe(true);
    });

    it('detects syntax error: invalid operator', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [],
        callbackString: 'return [inputPort[x] ++ 5]' // Invalid
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
    });

    it('detects syntax error: missing semicolon after statement', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [],
        callbackString: 'const y = 5 return [y]' // Missing semicolon
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
    });
  });

  describe('Edge cases in port references', () => {
    it('handles port names that are substrings of others', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [
          { name: 'x', type: 'NUMBER' },
          { name: 'x1', type: 'NUMBER' },
          { name: 'x12', type: 'NUMBER' }
        ],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[x] + inputPort[x1] + inputPort[x12]]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('handles port names with mixed case', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [
          { name: 'InputValue', type: 'NUMBER' },
          { name: 'setPoint', type: 'NUMBER' }
        ],
        outputPorts: [{ name: 'OutputValue', type: 'NUMBER' }],
        callbackString: 'return [inputPort[InputValue] - inputPort[setPoint] + prevOutput[OutputValue]]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('detects case-sensitive mismatches', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'value', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[Value]]' // Wrong case
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('unknown input port'))).toBe(true);
    });
  });

  describe('Callback with no port references', () => {
    it('validates callback with only constants', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'constant',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [{ name: 'c', type: 'NUMBER' }],
        callbackString: 'return [42]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates callback using t (time) variable', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'ramp',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [t]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates callback using dt (time step) variable', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [{ name: 'rate', type: 'NUMBER' }],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [inputPort[rate] * dt]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('validates callback with Math.random()', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'noise',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [Math.random()]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });
  });

  describe('Callback return value validation', () => {
    it('accepts callback returning array', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'test',
        version: '1.0.0',
        inputPorts: [],
        outputPorts: [{ name: 'y', type: 'NUMBER' }],
        callbackString: 'return [42]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('accepts callback with no return (sink block)', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'sink',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [],
        callbackString: 'console.log(inputPort[x]); return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('accepts callback returning empty array for sink', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'scope',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [],
        callbackString: 'return []'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });

    it('accepts callback returning multiple values', () => {
      const block: BlockDefinition = {
        schema_version: CURRENT_SCHEMA_VERSION,
        name: 'multi_output',
        version: '1.0.0',
        inputPorts: [{ name: 'x', type: 'NUMBER' }],
        outputPorts: [
          { name: 'y1', type: 'NUMBER' },
          { name: 'y2', type: 'NUMBER' },
          { name: 'y3', type: 'NUMBER' }
        ],
        callbackString: 'const x = inputPort[x]; return [x, x * 2, x * 3]'
      };

      const result = validator.validate(block);
      expect(result.valid).toBe(true);
    });
  });
});
