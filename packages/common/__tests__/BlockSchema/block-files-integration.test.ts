/**
 * Integration tests for actual block JSON files
 * Validates that example blocks conform to schema
 */

import * as fs from 'fs';
import * as path from 'path';
import { validateBlock } from '../../src/BlockSchema/validator';
import { BlockDefinition, CURRENT_SCHEMA_VERSION } from '../../src/BlockSchema/types';

describe('Block JSON Files Integration', () => {
  const blockDefinitionsPath = path.join(__dirname, '../../block_definitions');

  describe('Example block files', () => {
    const testBlockFile = (relativePath: string, expectedName: string) => {
      const filePath = path.join(blockDefinitionsPath, relativePath);

      it(`validates ${relativePath}`, () => {
        expect(fs.existsSync(filePath)).toBe(true);

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const block = JSON.parse(fileContent);

        const result = validateBlock(block);

        if (!result.valid) {
          console.error(`Validation errors for ${relativePath}:`);
          result.errors.forEach(err => {
            console.error(`  - ${err.field}: ${err.message}`);
          });
        }

        expect(result.valid).toBe(true);
        expect(block.name).toBe(expectedName);
        expect(block.schema_version).toBe(CURRENT_SCHEMA_VERSION);
      });

      it(`${relativePath} has valid callback syntax`, () => {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const block = JSON.parse(fileContent) as BlockDefinition;

        // Try to create a function from the callback
        expect(() => {
          // eslint-disable-next-line no-new-func
          new Function(
            'inputPort',
            'prevInput',
            'prevOutput',
            'initialCondition',
            't',
            'dt',
            block.callbackString
          );
        }).not.toThrow();
      });

      it(`${relativePath} has appropriate visual properties`, () => {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const block = JSON.parse(fileContent) as BlockDefinition;

        if (block.visual) {
          if (block.visual.color) {
            // Validate hex color format
            expect(block.visual.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
          }
          if (block.visual.shape) {
            expect(['rect', 'circ', 'tri']).toContain(block.visual.shape);
          }
        }
      });
    };

    // Math category blocks
    testBlockFile('math/constant.json', 'constant');
    testBlockFile('math/gain.json', 'gain');
    testBlockFile('math/integrator.json', 'integrator');
    testBlockFile('math/sum.json', 'sum');
    testBlockFile('math/multiply.json', 'multiply');

    // IO category blocks
    testBlockFile('io/scope.json', 'scope');
  });

  describe('Block directory structure', () => {
    it('has math category directory', () => {
      const mathPath = path.join(blockDefinitionsPath, 'math');
      expect(fs.existsSync(mathPath)).toBe(true);
      expect(fs.statSync(mathPath).isDirectory()).toBe(true);
    });

    it('has io category directory', () => {
      const ioPath = path.join(blockDefinitionsPath, 'io');
      expect(fs.existsSync(ioPath)).toBe(true);
      expect(fs.statSync(ioPath).isDirectory()).toBe(true);
    });

    it('has schema.json in root', () => {
      const schemaPath = path.join(blockDefinitionsPath, 'schema.json');
      expect(fs.existsSync(schemaPath)).toBe(true);

      const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
      expect(schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
      expect(schema.title).toBe('CompX Block Definition');
    });
  });

  describe('Block consistency checks', () => {
    it('all blocks use current schema version', () => {
      const mathBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'math'))
        .filter(f => f.endsWith('.json'));
      const ioBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'io'))
        .filter(f => f.endsWith('.json'));

      const allBlocks = [
        ...mathBlocks.map(f => path.join(blockDefinitionsPath, 'math', f)),
        ...ioBlocks.map(f => path.join(blockDefinitionsPath, 'io', f))
      ];

      allBlocks.forEach(blockPath => {
        const block = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        expect(block.schema_version).toBe(CURRENT_SCHEMA_VERSION);
      });
    });

    it('all math blocks have math category', () => {
      const mathBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'math'))
        .filter(f => f.endsWith('.json'));

      mathBlocks.forEach(file => {
        const blockPath = path.join(blockDefinitionsPath, 'math', file);
        const block = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        expect(block.category).toBe('math');
      });
    });

    it('all io blocks have io category', () => {
      const ioBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'io'))
        .filter(f => f.endsWith('.json'));

      ioBlocks.forEach(file => {
        const blockPath = path.join(blockDefinitionsPath, 'io', file);
        const block = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        expect(block.category).toBe('io');
      });
    });

    it('all blocks have descriptions', () => {
      const mathBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'math'))
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(blockDefinitionsPath, 'math', f));

      const ioBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'io'))
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(blockDefinitionsPath, 'io', f));

      [...mathBlocks, ...ioBlocks].forEach(blockPath => {
        const block = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        expect(block.description).toBeTruthy();
        expect(block.description.length).toBeGreaterThan(0);
      });
    });

    it('all blocks have tags', () => {
      const mathBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'math'))
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(blockDefinitionsPath, 'math', f));

      const ioBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'io'))
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(blockDefinitionsPath, 'io', f));

      [...mathBlocks, ...ioBlocks].forEach(blockPath => {
        const block = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        expect(Array.isArray(block.tags)).toBe(true);
        expect(block.tags.length).toBeGreaterThan(0);
      });
    });

    it('all blocks have visual properties', () => {
      const mathBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'math'))
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(blockDefinitionsPath, 'math', f));

      const ioBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'io'))
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(blockDefinitionsPath, 'io', f));

      [...mathBlocks, ...ioBlocks].forEach(blockPath => {
        const block = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        expect(block.visual).toBeDefined();
        expect(block.visual.color).toBeDefined();
        expect(block.visual.icon).toBeDefined();
        expect(block.visual.shape).toBeDefined();
      });
    });

    it('file names match block names', () => {
      const mathBlocks = fs
        .readdirSync(path.join(blockDefinitionsPath, 'math'))
        .filter(f => f.endsWith('.json'));

      mathBlocks.forEach(file => {
        const blockPath = path.join(blockDefinitionsPath, 'math', file);
        const block = JSON.parse(fs.readFileSync(blockPath, 'utf8'));
        const expectedFileName = `${block.name}.json`;
        expect(file).toBe(expectedFileName);
      });
    });
  });

  describe('Specific block functionality', () => {
    it('constant block has no inputs and one output', () => {
      const constantPath = path.join(blockDefinitionsPath, 'math/constant.json');
      const block = JSON.parse(fs.readFileSync(constantPath, 'utf8'));

      expect(block.inputPorts.length).toBe(0);
      expect(block.outputPorts.length).toBe(1);
      expect(block.outputPorts[0].name).toBe('c');
    });

    it('gain block has one input and one output', () => {
      const gainPath = path.join(blockDefinitionsPath, 'math/gain.json');
      const block = JSON.parse(fs.readFileSync(gainPath, 'utf8'));

      expect(block.inputPorts.length).toBe(1);
      expect(block.outputPorts.length).toBe(1);
      expect(block.inputPorts[0].name).toBe('x');
      expect(block.outputPorts[0].name).toBe('y');
    });

    it('integrator block has initial value for state', () => {
      const integratorPath = path.join(blockDefinitionsPath, 'math/integrator.json');
      const block = JSON.parse(fs.readFileSync(integratorPath, 'utf8'));

      expect(block.inputPorts.length).toBe(1);
      expect(block.inputPorts[0].initialValue).toBe(0);
      expect(block.callbackString).toContain('prevInput');
      expect(block.callbackString).toContain('prevOutput');
    });

    it('sum block has two inputs', () => {
      const sumPath = path.join(blockDefinitionsPath, 'math/sum.json');
      const block = JSON.parse(fs.readFileSync(sumPath, 'utf8'));

      expect(block.inputPorts.length).toBe(2);
      expect(block.outputPorts.length).toBe(1);
    });

    it('scope block has no outputs (sink)', () => {
      const scopePath = path.join(blockDefinitionsPath, 'io/scope.json');
      const block = JSON.parse(fs.readFileSync(scopePath, 'utf8'));

      expect(block.inputPorts.length).toBe(1);
      expect(block.outputPorts.length).toBe(0);
      expect(block.callbackString).toContain('console.log');
    });
  });

  describe('Batch validation', () => {
    it('validates all blocks in math directory', () => {
      const mathDir = path.join(blockDefinitionsPath, 'math');
      const files = fs.readdirSync(mathDir).filter(f => f.endsWith('.json'));

      expect(files.length).toBeGreaterThan(0);

      const results = files.map(file => {
        const filePath = path.join(mathDir, file);
        const block = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return { file, result: validateBlock(block) };
      });

      const invalid = results.filter(r => !r.result.valid);

      if (invalid.length > 0) {
        console.error('Invalid blocks found:');
        invalid.forEach(({ file, result }) => {
          console.error(`\n${file}:`);
          result.errors.forEach(err => console.error(`  - ${err.message}`));
        });
      }

      expect(invalid.length).toBe(0);
    });

    it('validates all blocks in io directory', () => {
      const ioDir = path.join(blockDefinitionsPath, 'io');
      const files = fs.readdirSync(ioDir).filter(f => f.endsWith('.json'));

      expect(files.length).toBeGreaterThan(0);

      const results = files.map(file => {
        const filePath = path.join(ioDir, file);
        const block = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        return { file, result: validateBlock(block) };
      });

      const invalid = results.filter(r => !r.result.valid);
      expect(invalid.length).toBe(0);
    });
  });
});
