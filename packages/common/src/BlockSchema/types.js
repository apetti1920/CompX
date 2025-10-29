"use strict";
/**
 * TypeScript types generated from Block Definition JSON Schema
 * These types represent the structure of block definitions in CompX
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT_TYPE_DEFAULTS = exports.CURRENT_SCHEMA_VERSION = exports.BLOCK_DEFAULTS = void 0;
exports.isPortDefinition = isPortDefinition;
exports.isBlockDefinition = isBlockDefinition;
/**
 * Type guard to check if an object is a valid PortDefinition
 */
function isPortDefinition(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    const port = obj;
    return (typeof port.name === 'string' &&
        typeof port.type === 'string' &&
        ['NUMBER', 'STRING', 'VECTOR', 'MATRIX', 'BOOLEAN'].includes(port.type));
}
/**
 * Type guard to check if an object is a valid BlockDefinition
 */
function isBlockDefinition(obj) {
    if (typeof obj !== 'object' || obj === null)
        return false;
    const block = obj;
    return (typeof block.schema_version === 'string' &&
        typeof block.name === 'string' &&
        typeof block.version === 'string' &&
        Array.isArray(block.inputPorts) &&
        Array.isArray(block.outputPorts) &&
        typeof block.callbackString === 'string');
}
/**
 * Default values for optional fields
 */
exports.BLOCK_DEFAULTS = {
    description: '',
    category: 'misc',
    tags: [],
    visual: {
        color: '#9E9E9E',
        icon: '',
        shape: 'rect'
    }
};
/**
 * Current schema version
 */
exports.CURRENT_SCHEMA_VERSION = '1.0.0';
/**
 * Port type initial value defaults
 */
exports.PORT_TYPE_DEFAULTS = {
    NUMBER: 0,
    STRING: '',
    VECTOR: 0, // Will need proper Vector2D type later
    MATRIX: 0, // Will need proper Matrix2D type later
    BOOLEAN: false
};
//# sourceMappingURL=types.js.map