/**
 * Block Definition Validator
 * Validates block definitions against the JSON Schema with semantic checks
 */

import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { promises as fs } from 'fs';
import path from 'path';
import {
  BlockDefinition,
  ValidationResult,
  ValidationError,
  CURRENT_SCHEMA_VERSION,
  PortDefinition,
  OutputPortDefinition
} from './types';
import blockSchema from './schema.json';
import { getMigrator } from './migrator';

/**
 * Validator options
 */
export interface BlockValidatorOptions {
  /** Enable file path verification for icons (default: false, requires async validation) */
  verifyPaths?: boolean;
  /** Base directory for resolving relative icon paths */
  baseDir?: string;
  /** Enable automatic migration for compatible versions (default: true) */
  autoMigrate?: boolean;
}

/**
 * Validator class for block definitions
 * Provides JSON Schema validation plus semantic validation
 */
export class BlockValidator {
  private ajv: Ajv;
  private validateFn: ReturnType<Ajv['compile']>;
  private options: Required<BlockValidatorOptions>;

  constructor(options: BlockValidatorOptions = {}) {
    this.options = {
      verifyPaths: options.verifyPaths ?? false,
      baseDir: options.baseDir ?? process.cwd(),
      autoMigrate: options.autoMigrate ?? true
    };

    // Initialize Ajv with strict mode and all errors
    this.ajv = new Ajv({
      allErrors: true,
      strict: true,
      strictSchema: true,
      strictNumbers: true,
      strictTypes: true,
      strictTuples: true,
      strictRequired: true
    });

    // Add format validators (e.g., for hex colors)
    addFormats(this.ajv);

    // Compile the schema
    this.validateFn = this.ajv.compile(blockSchema);
  }

  /**
   * Validate a block definition (synchronous)
   * @param block - Block definition to validate
   * @returns Validation result with errors and warnings
   * @note For path verification, use validateAsync instead
   */
  validate(block: unknown): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Step 1: JSON Schema validation
    const schemaValid = this.validateFn(block);

    if (!schemaValid && this.validateFn.errors) {
      errors.push(...this.convertAjvErrors(this.validateFn.errors));
    }

    // If schema validation failed, return early (no point in semantic checks)
    if (!schemaValid) {
      return {
        valid: false,
        errors,
        warnings
      };
    }

    // Step 2: Version compatibility and migration
    const blockDef = block as BlockDefinition;
    if (this.options.autoMigrate && blockDef.schema_version !== CURRENT_SCHEMA_VERSION) {
      const migrator = getMigrator();
      const migrationResult = migrator.migrate(blockDef);

      if (migrationResult.migrated) {
        warnings.push({
          field: 'schema_version',
          message: `Block automatically migrated from ${migrationResult.originalVersion} to ${migrationResult.targetVersion}`,
          severity: 'warning'
        });
        migrationResult.warnings.forEach((w) => {
          warnings.push({
            field: 'migration',
            message: w,
            severity: 'warning'
          });
        });
      } else if (migrationResult.warnings.length > 0) {
        migrationResult.warnings.forEach((w) => {
          warnings.push({
            field: 'schema_version',
            message: w,
            severity: 'warning'
          });
        });
      }
    }

    // Step 3: Semantic validation (assumes schema is valid)
    const semanticErrors = this.validateSemantics(blockDef);
    errors.push(...semanticErrors.errors);
    warnings.push(...semanticErrors.warnings);

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate a block definition (asynchronous, with file path verification)
   * @param block - Block definition to validate
   * @returns Promise resolving to validation result
   */
  async validateAsync(block: unknown): Promise<ValidationResult> {
    // First, do synchronous validation
    const result = this.validate(block);

    // If path verification is enabled and block is valid so far
    if (this.options.verifyPaths && result.valid && typeof block === 'object' && block !== null) {
      const blockDef = block as BlockDefinition;
      const pathErrors = await this.validatePaths(blockDef);
      result.warnings.push(...pathErrors);
    }

    return result;
  }

  /**
   * Convert Ajv errors to our ValidationError format
   */
  private convertAjvErrors(ajvErrors: ErrorObject[]): ValidationError[] {
    return ajvErrors.map((err) => {
      const field = err.instancePath.replace(/^\//, '').replace(/\//g, '.') || 'root';
      let message = err.message || 'Validation error';

      // Enhance error messages for common cases
      if (err.keyword === 'pattern' && err.params.pattern) {
        message = `${message} (expected pattern: ${err.params.pattern})`;
      } else if (err.keyword === 'enum' && err.params.allowedValues) {
        message = `${message}. Allowed values: ${err.params.allowedValues.join(', ')}`;
      } else if (err.keyword === 'required' && err.params.missingProperty) {
        message = `Missing required property: ${err.params.missingProperty}`;
      }

      return {
        field,
        message,
        severity: 'error',
        keyword: err.keyword,
        params: err.params
      };
    });
  }

  /**
   * Perform semantic validation beyond JSON Schema
   */
  private validateSemantics(block: BlockDefinition): Pick<ValidationResult, 'errors' | 'warnings'> {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check schema version compatibility
    if (block.schema_version !== CURRENT_SCHEMA_VERSION) {
      warnings.push({
        field: 'schema_version',
        message: `Schema version ${block.schema_version} differs from current version ${CURRENT_SCHEMA_VERSION}. Consider updating.`,
        severity: 'warning'
      });
    }

    // Check port name uniqueness within block
    const allPortNames = [...block.inputPorts.map((p) => p.name), ...block.outputPorts.map((p) => p.name)];
    const duplicates = this.findDuplicates(allPortNames);
    if (duplicates.length > 0) {
      errors.push({
        field: 'ports',
        message: `Duplicate port names found: ${duplicates.join(', ')}. Port names must be unique within a block.`,
        severity: 'error'
      });
    }

    // Validate callback string syntax
    const callbackErrors = this.validateCallbackString(block.callbackString, block.inputPorts, block.outputPorts);
    errors.push(...callbackErrors);

    // Validate initial values match port types
    block.inputPorts.forEach((port, index) => {
      if (port.initialValue !== undefined) {
        const typeError = this.validatePortInitialValue(port);
        if (typeError) {
          errors.push({
            field: `inputPorts[${index}].initialValue`,
            message: typeError,
            severity: 'error'
          });
        }
      }
    });

    // Warn if block has no description
    if (!block.description || block.description.trim() === '') {
      warnings.push({
        field: 'description',
        message: 'Block has no description. Consider adding one for better usability.',
        severity: 'warning'
      });
    }

    // Warn if block has no tags
    if (!block.tags || block.tags.length === 0) {
      warnings.push({
        field: 'tags',
        message: 'Block has no tags. Consider adding tags for better discoverability.',
        severity: 'warning'
      });
    }

    return { errors, warnings };
  }

  /**
   * Validate callback string syntax
   * Checks for basic JavaScript syntax and port references
   */
  private validateCallbackString(
    callbackString: string,
    inputPorts: PortDefinition[],
    outputPorts: OutputPortDefinition[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check if callback is a valid function body
    try {
      // Try to create a function (this doesn't execute it)
      // eslint-disable-next-line no-new-func
      new Function('inputPort', 'prevInput', 'prevOutput', 'initialCondition', 't', 'dt', callbackString);
    } catch (e) {
      errors.push({
        field: 'callbackString',
        message: `Invalid JavaScript syntax: ${(e as Error).message}`,
        severity: 'error'
      });
      return errors; // Don't continue if syntax is invalid
    }

    // Check for port name references in callback
    const inputPortNames = inputPorts.map((p) => p.name);
    const outputPortNames = outputPorts.map((p) => p.name);

    // Check inputPort references
    const inputPortRefs = this.extractPortReferences(callbackString, 'inputPort');
    inputPortRefs.forEach((ref) => {
      if (!inputPortNames.includes(ref)) {
        errors.push({
          field: 'callbackString',
          message: `Reference to unknown input port 'inputPort[${ref}]'. Available inputs: ${
            inputPortNames.join(', ') || 'none'
          }`,
          severity: 'error'
        });
      }
    });

    // Check prevOutput references
    const prevOutputRefs = this.extractPortReferences(callbackString, 'prevOutput');
    prevOutputRefs.forEach((ref) => {
      if (!outputPortNames.includes(ref)) {
        errors.push({
          field: 'callbackString',
          message: `Reference to unknown output port 'prevOutput[${ref}]'. Available outputs: ${
            outputPortNames.join(', ') || 'none'
          }`,
          severity: 'error'
        });
      }
    });

    // Check prevInput references
    const prevInputRefs = this.extractPortReferences(callbackString, 'prevInput');
    prevInputRefs.forEach((ref) => {
      const port = inputPorts.find((p) => p.name === ref);
      if (!port) {
        errors.push({
          field: 'callbackString',
          message: `Reference to unknown input port 'prevInput[${ref}]'. Available inputs: ${
            inputPortNames.join(', ') || 'none'
          }`,
          severity: 'error'
        });
      } else if (port.initialValue === undefined) {
        errors.push({
          field: 'callbackString',
          message: `Port 'prevInput[${ref}]' is referenced but has no initialValue. Ports must have initialValue to use prevInput.`,
          severity: 'error'
        });
      }
    });

    return errors;
  }

  /**
   * Extract port references from callback string
   * Matches patterns like inputPort[x], prevOutput[y], etc.
   */
  private extractPortReferences(callbackString: string, accessor: string): string[] {
    // Match patterns like: inputPort[name] or inputPort.name
    const bracketPattern = new RegExp(`${accessor}\\[([a-zA-Z_][a-zA-Z0-9_]*)\\]`, 'g');
    const dotPattern = new RegExp(`${accessor}\\.([a-zA-Z_][a-zA-Z0-9_]*)`, 'g');

    const refs = new Set<string>();

    let match;
    while ((match = bracketPattern.exec(callbackString)) !== null) {
      refs.add(match[1]);
    }
    while ((match = dotPattern.exec(callbackString)) !== null) {
      refs.add(match[1]);
    }

    return Array.from(refs);
  }

  /**
   * Validate that initial value matches port type
   */
  private validatePortInitialValue(port: PortDefinition): string | null {
    const { type, initialValue } = port;

    if (initialValue === undefined) return null;

    switch (type) {
      case 'NUMBER':
        if (typeof initialValue !== 'number') {
          return `Initial value for NUMBER port must be a number, got ${typeof initialValue}`;
        }
        break;
      case 'STRING':
        if (typeof initialValue !== 'string') {
          return `Initial value for STRING port must be a string, got ${typeof initialValue}`;
        }
        break;
      case 'BOOLEAN':
        if (typeof initialValue !== 'boolean') {
          return `Initial value for BOOLEAN port must be a boolean, got ${typeof initialValue}`;
        }
        break;
      case 'VECTOR':
      case 'MATRIX':
        // For now, accept numbers (will need proper Vector/Matrix types later)
        if (typeof initialValue !== 'number') {
          return `Initial value for ${type} port must be a number (for now), got ${typeof initialValue}`;
        }
        break;
      default:
        return `Unknown port type: ${type}`;
    }

    return null;
  }

  /**
   * Find duplicate values in an array
   */
  private findDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    arr.forEach((item) => {
      if (seen.has(item)) {
        duplicates.add(item);
      } else {
        seen.add(item);
      }
    });

    return Array.from(duplicates);
  }

  /**
   * Validate file paths for icons and images (async)
   * @param block - Block definition
   * @returns Array of validation warnings for missing files
   */
  private async validatePaths(block: BlockDefinition): Promise<ValidationError[]> {
    const warnings: ValidationError[] = [];

    // Check icon path if specified
    if (block.visual?.icon) {
      const iconPath = block.visual.icon;

      // Skip validation for icon identifiers (non-path strings)
      if (!iconPath.includes('/') && !iconPath.includes('\\') && !iconPath.includes('.')) {
        // This is likely an icon identifier, not a file path
        return warnings;
      }

      // Resolve path relative to base directory
      const resolvedPath = path.isAbsolute(iconPath) ? iconPath : path.resolve(this.options.baseDir, iconPath);

      try {
        await fs.access(resolvedPath);
      } catch {
        warnings.push({
          field: 'visual.icon',
          message: `Icon file not found: ${iconPath} (resolved to: ${resolvedPath})`,
          severity: 'warning'
        });
      }
    }

    return warnings;
  }
}

/**
 * Default validator instance (singleton)
 */
let defaultValidator: BlockValidator | null = null;

/**
 * Get the default validator instance
 */
export function getValidator(): BlockValidator {
  if (!defaultValidator) {
    defaultValidator = new BlockValidator();
  }
  return defaultValidator;
}

/**
 * Convenience function to validate a block definition
 */
export function validateBlock(block: unknown): ValidationResult {
  return getValidator().validate(block);
}
