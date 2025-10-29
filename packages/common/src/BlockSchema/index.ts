/**
 * Block Schema module
 * Provides JSON Schema definition, TypeScript types, validation, and migration for block definitions
 */

// Export types
export * from './types';

// Export validator
export * from './validator';

// Export migrator
export * from './migrator';

// Export schema (for external use)
export { default as blockSchema } from './schema.json';
