/**
 * TypeScript types generated from Block Definition JSON Schema
 * These types represent the structure of block definitions in CompX
 */

/**
 * Supported port data types
 */
export type PortType = 'NUMBER' | 'STRING' | 'VECTOR' | 'MATRIX' | 'BOOLEAN';

/**
 * Supported block visual shapes
 */
export type BlockShape = 'rect' | 'circ' | 'tri';

/**
 * Port definition with optional initial value
 * Initial values enable prevInput[] access in callbacks
 */
export interface PortDefinition {
  /** Unique name for this port within the block */
  name: string;
  /** Data type for this port */
  type: PortType;
  /** Initial value for the port (enables prevInput access) */
  initialValue?: number | string | boolean;
}

/**
 * Output port definition (no initial value)
 */
export interface OutputPortDefinition {
  /** Unique name for this port within the block */
  name: string;
  /** Data type for this port */
  type: PortType;
}

/**
 * Visual styling properties for block rendering
 */
export interface VisualDefinition {
  /** Hex color code for block background (e.g., "#4CAF50") */
  color?: string;
  /** Icon identifier or path for block visual representation */
  icon?: string;
  /** Shape of the block */
  shape?: BlockShape;
}

/**
 * Complete block definition matching JSON Schema
 * This is the core structure for all block definitions in CompX
 */
export interface BlockDefinition {
  /** Version of the block schema specification (semantic versioning) */
  schema_version: string;

  /** Unique identifier for the block (lowercase, alphanumeric, underscores only) */
  name: string;

  /** Version of this specific block implementation (semantic versioning) */
  version: string;

  /** Human-readable description of the block's functionality */
  description?: string;

  /** Category for organizing blocks (e.g., math, logic, io) */
  category?: string;

  /** Tags for searching and filtering blocks */
  tags?: string[];

  /** Input port definitions for this block */
  inputPorts: PortDefinition[];

  /** Output port definitions for this block */
  outputPorts: OutputPortDefinition[];

  /** JavaScript code string that implements the block's computation */
  callbackString: string;

  /** Visual styling properties for the block */
  visual?: VisualDefinition;
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** JSON path to the field with error (e.g., "inputPorts[0].type") */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Error severity level */
  severity: 'error' | 'warning';
  /** Schema keyword that failed (e.g., "type", "pattern", "required") */
  keyword?: string;
  /** Additional error context */
  params?: Record<string, unknown>;
}

/**
 * Result of block definition validation
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of validation errors (empty if valid) */
  errors: ValidationError[];
  /** List of validation warnings (non-blocking) */
  warnings: ValidationError[];
}

/**
 * Type guard to check if an object is a valid PortDefinition
 */
export function isPortDefinition(obj: unknown): obj is PortDefinition {
  if (typeof obj !== 'object' || obj === null) return false;
  const port = obj as Partial<PortDefinition>;

  return (
    typeof port.name === 'string' &&
    typeof port.type === 'string' &&
    ['NUMBER', 'STRING', 'VECTOR', 'MATRIX', 'BOOLEAN'].includes(port.type)
  );
}

/**
 * Type guard to check if an object is a valid BlockDefinition
 */
export function isBlockDefinition(obj: unknown): obj is BlockDefinition {
  if (typeof obj !== 'object' || obj === null) return false;
  const block = obj as Partial<BlockDefinition>;

  return (
    typeof block.schema_version === 'string' &&
    typeof block.name === 'string' &&
    typeof block.version === 'string' &&
    Array.isArray(block.inputPorts) &&
    Array.isArray(block.outputPorts) &&
    typeof block.callbackString === 'string'
  );
}

/**
 * Default values for optional fields
 */
export const BLOCK_DEFAULTS = {
  description: '',
  category: 'misc',
  tags: [],
  visual: {
    color: '#9E9E9E',
    icon: '',
    shape: 'rect' as BlockShape
  }
} as const;

/**
 * Current schema version
 */
export const CURRENT_SCHEMA_VERSION = '1.0.0';

/**
 * Port type initial value defaults
 */
export const PORT_TYPE_DEFAULTS: Record<PortType, number | string | boolean> = {
  NUMBER: 0,
  STRING: '',
  VECTOR: 0, // Will need proper Vector2D type later
  MATRIX: 0, // Will need proper Matrix2D type later
  BOOLEAN: false
};
