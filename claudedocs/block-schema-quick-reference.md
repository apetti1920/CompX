# Block Definition JSON Schema - Quick Reference

## Minimal Block Example

```json
{
  "schema_version": "1.0.0",
  "name": "my_block",
  "version": "1.0.0",
  "inputPorts": [],
  "outputPorts": [],
  "callbackString": "return []"
}
```

## Complete Block Example

```json
{
  "schema_version": "1.0.0",
  "name": "my_block",
  "version": "1.0.0",
  "description": "A block that does something useful",
  "category": "math",
  "tags": ["math", "example"],
  "inputPorts": [
    {
      "name": "x",
      "type": "NUMBER",
      "initialValue": 0
    }
  ],
  "outputPorts": [
    {
      "name": "y",
      "type": "NUMBER"
    }
  ],
  "callbackString": "return [inputPort[x] * 2]",
  "visual": {
    "color": "#4CAF50",
    "icon": "zap",
    "shape": "rect"
  }
}
```

## Field Reference

| Field            | Type   | Required | Description                                        |
| ---------------- | ------ | -------- | -------------------------------------------------- |
| `schema_version` | string | ✅       | Schema version (semver: "1.0.0")                   |
| `name`           | string | ✅       | Unique block identifier (lowercase, underscores)   |
| `version`        | string | ✅       | Block version (semver: "1.0.0")                    |
| `description`    | string | ⚠️       | Human-readable description (max 500 chars)         |
| `category`       | string | ⚠️       | Category for organization (lowercase, underscores) |
| `tags`           | array  | ⚠️       | Search tags (max 10, lowercase with hyphens)       |
| `inputPorts`     | array  | ✅       | Input port definitions (max 20)                    |
| `outputPorts`    | array  | ✅       | Output port definitions (max 20)                   |
| `callbackString` | string | ✅       | JavaScript computation (1-10,000 chars)            |
| `visual`         | object | ❌       | Visual styling properties                          |

✅ Required | ⚠️ Recommended | ❌ Optional

## Port Definitions

### Input Port

```json
{
  "name": "x",
  "type": "NUMBER",
  "initialValue": 0
}
```

### Output Port

```json
{
  "name": "y",
  "type": "NUMBER"
}
```

### Port Types

- `NUMBER` - Scalar numeric value
- `STRING` - Text string
- `VECTOR` - 2D vector (future)
- `MATRIX` - 2D matrix (future)
- `BOOLEAN` - Boolean value (future)

## Visual Properties

```json
{
  "visual": {
    "color": "#RRGGBB", // Hex color (e.g., "#4CAF50")
    "icon": "icon-name", // Icon identifier
    "shape": "rect" // "rect", "circ", or "tri"
  }
}
```

## Callback String Syntax

### Available Variables

- `inputPort[name]` - Current input port value
- `prevInput[name]` - Previous input value (requires initialValue)
- `prevOutput[name]` - Previous output value (for state)
- `initialCondition[name]` - Initial value for port
- `t` - Current simulation time
- `dt` - Time step

### Examples

**Constant**:

```javascript
return [5];
```

**Gain**:

```javascript
return [inputPort[x] * 0.75];
```

**Sum**:

```javascript
return [inputPort[a] + inputPort[b]];
```

**Integrator** (requires initialValue):

```javascript
return [prevOutput[y] + (dt * (prevInput[x] + inputPort[x])) / 2];
```

**Scope** (sink with side effects):

```javascript
console.log('Value:', inputPort[x]);
return [];
```

## Validation Rules

### Name Patterns

- **Block name**: `^[a-z][a-z0-9_]*$` (lowercase, alphanumeric, underscores)
- **Port name**: `^[a-zA-Z][a-zA-Z0-9_]*$` (alphanumeric, underscores)
- **Category**: `^[a-z][a-z0-9_]*$` (lowercase, alphanumeric, underscores)
- **Tag**: `^[a-z][a-z0-9_-]*$` (lowercase, alphanumeric, underscores, hyphens)

### Version Format

- Must be semantic versioning: `major.minor.patch` (e.g., "1.0.0", "2.1.3")

### Visual Color

- Must be hex color: `#RRGGBB` (e.g., "#4CAF50", "#FF5722")

## Common Validation Errors

### Invalid Name

```json
{"name": "MyBlock"}  // ❌ Uppercase not allowed
{"name": "my-block"} // ❌ Hyphens not allowed
{"name": "my_block"} // ✅ Correct
```

### Invalid Version

```json
{"version": "v1.0"}     // ❌ No 'v' prefix
{"version": "1.0"}      // ❌ Must have patch version
{"version": "1.0.0"}    // ✅ Correct
```

### Invalid Port Reference

```json
{
  "inputPorts": [{ "name": "x", "type": "NUMBER" }],
  "callbackString": "return [inputPort[y]]" // ❌ 'y' doesn't exist
}
```

### Missing Initial Value

```json
{
  "inputPorts": [{ "name": "x", "type": "NUMBER" }],
  "callbackString": "return [prevInput[x]]" // ❌ Need initialValue for prevInput
}
```

**Correct**:

```json
{
  "inputPorts": [{ "name": "x", "type": "NUMBER", "initialValue": 0 }],
  "callbackString": "return [prevInput[x]]" // ✅ Has initialValue
}
```

## TypeScript Usage

### Import

```typescript
import { BlockDefinition, validateBlock, CURRENT_SCHEMA_VERSION } from '@compx/common/BlockSchema';
```

### Validate

```typescript
const block: BlockDefinition = {
  /* ... */
};
const result = validateBlock(block);

if (!result.valid) {
  result.errors.forEach((err) => {
    console.error(`${err.field}: ${err.message}`);
  });
}
```

### Create Block

```typescript
const myBlock: BlockDefinition = {
  schema_version: CURRENT_SCHEMA_VERSION,
  name: 'my_custom_block',
  version: '1.0.0',
  description: 'My custom block',
  category: 'custom',
  tags: ['custom', 'example'],
  inputPorts: [{ name: 'input', type: 'NUMBER' }],
  outputPorts: [{ name: 'output', type: 'NUMBER' }],
  callbackString: 'return [inputPort[input] * 2]',
  visual: {
    color: '#9C27B0',
    icon: 'star',
    shape: 'rect'
  }
};
```

## File Organization

### Recommended Structure

```
block_definitions/
├── math/
│   ├── constant.json
│   ├── gain.json
│   └── integrator.json
├── logic/
│   └── ...
├── io/
│   └── scope.json
└── schema.json
```

### File Naming

- Use lowercase with underscores
- Match block name: `gain.json` for block named "gain"
- One block per file

## Programmatic Validation

### Load and Validate

```typescript
import * as fs from 'fs';
import { validateBlock } from '@compx/common/BlockSchema';

const blockJson = fs.readFileSync('block_definitions/math/gain.json', 'utf8');
const block = JSON.parse(blockJson);
const result = validateBlock(block);

if (result.valid) {
  console.log('✅ Block is valid');
} else {
  console.error('❌ Validation failed:', result.errors);
}
```

### Batch Validation

```typescript
import { glob } from 'glob';

const blockFiles = glob.sync('block_definitions/**/*.json');
const results = blockFiles.map((file) => {
  const block = JSON.parse(fs.readFileSync(file, 'utf8'));
  return { file, result: validateBlock(block) };
});

const invalid = results.filter((r) => !r.result.valid);
if (invalid.length > 0) {
  console.error(`❌ ${invalid.length} invalid blocks`);
  invalid.forEach(({ file, result }) => {
    console.error(`\n${file}:`);
    result.errors.forEach((err) => console.error(`  - ${err.message}`));
  });
  process.exit(1);
}
```

## Best Practices

1. **Always include descriptions** - Helps users understand block purpose
2. **Use meaningful tags** - Improves discoverability
3. **Validate before commit** - Catch errors early
4. **Keep callbacks simple** - Complex logic should be in library
5. **Use initialValue for state** - Required for prevInput/prevOutput
6. **Follow naming conventions** - Lowercase, underscores, semantic versioning
7. **Test callback strings** - Ensure JavaScript syntax is valid
8. **Document port meanings** - Use clear, descriptive port names

## See Also

- [Full Design Document](./block-definition-system-design.md)
- [Phase 0 Implementation Summary](./phase-0-implementation-summary.md)
- [JSON Schema Specification](../packages/common/src/BlockSchema/schema.json)
