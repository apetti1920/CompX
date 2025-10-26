# CompX Development Guide

## Getting Started

### Prerequisites

- **Node.js**: 16.x or later
- **npm**: 8.x or later
- **Git**: For version control

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/CompX.git
cd CompX

# Install dependencies and bootstrap packages
npm install
npm run bootstrap

# Verify setup
npm test
```

### Project Structure
```
CompX/
├── packages/
│   ├── common/           # Core graph engine
│   ├── web_app/          # React application
│   ├── electron_app/     # Electron main process
│   └── electron_loader/  # Splash screen
├── node_modules/         # Shared dependencies
├── package.json          # Root package configuration
├── lerna.json            # Monorepo configuration
└── tsconfig.json         # Shared TypeScript config
```

## Development Workflows

### Web Application Development

```bash
# Start development server (http://localhost:3000)
npm run web:start

# Build production bundle
npm run web:build
```

**Development Features**:
- Hot module replacement (HMR)
- Source maps for debugging
- TypeScript type checking
- ESLint on save

### Electron Application Development

```bash
# Build and launch Electron app
npm run electron:start

# Build Electron production bundle
npm run electron:build
```

**Build Process**:
1. Build `@compx/electron_loader`
2. Build `@compx/web_app` with `BUILD_TYPE=electron`
3. Copy bundles to `@compx/electron_app/dist/renderer/`
4. Build Electron main process

### Package-Specific Development

```bash
# Run commands in specific package
npx lerna run start --scope=@compx/web_app
npx lerna run build --scope=@compx/common
npx lerna run test --scope=@compx/common --stream

# Execute command in package directory
npx lerna exec --scope=@compx/common -- npm run build
```

## Adding Features

### Adding a New Block Type

**1. Create Block Definition** (`packages/common/src/DefaultBlocks/NewBlock.ts`):

```typescript
import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage'

export const NewBlock: BlockStorageType<
  ['input1', 'input2'],  // Input port types
  ['output']             // Output port types
> = {
  name: 'NewBlock',
  description: 'Performs custom computation',
  tags: ['math', 'custom'],
  inputPorts: [
    { name: 'input1', type: 'number' },
    { name: 'input2', type: 'number' }
  ],
  outputPorts: [
    { name: 'output', type: 'number' }
  ],
  callbackString: `
    const result = inputPort[input1] + inputPort[input2];
    return [result];
  `
}
```

**2. Export Block** (`packages/common/src/DefaultBlocks/index.ts`):

```typescript
export { NewBlock } from './NewBlock'
```

**3. Register in Electron App** (`packages/electron_app/src/startup/defaultblockcreation.ts`):

```typescript
import { NewBlock } from '@compx/common'

// In initialization function
blocks.push(NewBlock)
```

**4. Add UI Component** (Optional, `packages/web_app/src/app/Container/Canvas/Graph/VisualTypes/`):

```tsx
// Custom visualization for block
export const NewBlockComponent: React.FC<BlockComponentProps> = ({ block }) => {
  return (
    <Group>
      {/* Custom Konva shapes */}
    </Group>
  )
}
```

**5. Test Block**:

```typescript
// packages/common/__tests__/NewBlock.test.ts
import { Graph } from '../src/Graph/Graph'
import { NewBlock } from '../src/DefaultBlocks/NewBlock'

describe('NewBlock', () => {
  it('should add inputs correctly', () => {
    const graph = new Graph({ blocks: [], edges: [] })
    const blockId = graph.AddBlock(NewBlock)

    const block = graph.blocks.find(b => b.id === blockId)
    block?.Execute(0, 0.01, [5, 10])

    expect(block?.outputPorts[0].GetObjectValue()).toBe(15)
  })
})
```

### Adding a New Port Type

**1. Update Port Type Interface** (`packages/common/src/Graph/Port.ts`):

```typescript
// Add custom type (e.g., Complex number)
import { Complex } from '../Types/Complex'

type PortTypes = {
  'number': number
  'vector': Vector2D
  'matrix': Matrix2D
  'boolean': boolean
  'string': string
  'complex': Complex  // New type
}
```

**2. Add Type Initializer**:

```typescript
const PortTypeInitializers = {
  'number': 0,
  'vector': new Vector2D(0, 0),
  'matrix': new Matrix2D(0, 0),
  'boolean': false,
  'string': '',
  'complex': new Complex(0, 0)  // New initializer
}
```

**3. Update UI** (`packages/web_app/src/app/Container/...`):

Add UI controls for selecting and displaying new type

**4. Update Serialization**:

Ensure new type serializes/deserializes correctly

### Modifying Graph Algorithms

**1. Identify Algorithm Location** (`packages/common/src/Graph/Graph.ts`)

**2. Implement Changes**:

```typescript
// Example: Add graph validation method
public hasMultipleSources(): boolean {
  return this.GetSourceBlocks().length > 1
}
```

**3. Add Tests**:

```typescript
// packages/common/__tests__/Graph.test.ts
it('should detect multiple sources', () => {
  const graph = new Graph(testGraphData)
  expect(graph.hasMultipleSources()).toBe(true)
})
```

**4. Update Compile Order** (if execution affected):

Ensure new algorithm integrates with `GetBlockCompileOrder()`

**5. Document Algorithm**:

Add complexity analysis and purpose to code comments

## Testing

### Running Tests

```bash
# All packages
npm test

# Specific package
npm test -- packages/common

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage
```

### Writing Tests

**Unit Test Example** (`packages/common/__tests__/Graph.test.ts`):

```typescript
import { Graph } from '../src/Graph/Graph'
import { Constant } from '../src/DefaultBlocks/Constant'

describe('Graph', () => {
  let graph: Graph

  beforeEach(() => {
    graph = new Graph({ blocks: [], edges: [] })
  })

  it('should add blocks successfully', () => {
    const blockId = graph.AddBlock(Constant)
    expect(graph.blocks).toHaveLength(1)
    expect(graph.blocks[0].id).toBe(blockId)
  })

  it('should throw error when removing non-existent block', () => {
    expect(() => graph.RemoveBlock('invalid-id')).toThrow()
  })
})
```

**Integration Test Example**:

```typescript
it('should execute simple graph correctly', () => {
  const constantId = graph.AddBlock(Constant)
  const gainId = graph.AddBlock(Gain)

  graph.AddEdge(constantId, 'value', gainId, 'in')

  graph.Execute(1.0, 0.1)

  const gainBlock = graph.blocks.find(b => b.id === gainId)
  expect(gainBlock?.outputPorts[0].GetObjectValue()).toBe(10) // 5 * 2
})
```

### Test Resources

Test graphs stored in `packages/common/__tests__/Resources/`:

```json
{
  "blocks": [...],
  "edges": [...]
}
```

Load with:
```typescript
import testGraph from './Resources/TestGraphSimple1.json'
const graph = new Graph(testGraph)
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### Formatting

```bash
# Format staged files (automatic in pre-commit hook)
npm run format

# Format all files
npx prettier --write "packages/**/*.{ts,tsx,js,jsx}"
```

### Type Checking

```bash
# Check types in all packages
npx tsc --noEmit

# Check specific package
cd packages/common && npx tsc --noEmit
```

### Pre-Commit Hooks

**Husky** runs checks before commits:
1. Prettier formatting on staged files
2. ESLint on TypeScript files
3. Type checking (optional)

Configured in `.husky/pre-commit`

## Debugging

### Web Application Debugging

**Browser DevTools**:
1. Open Chrome DevTools (F12)
2. Go to Sources tab
3. Set breakpoints in TypeScript source (via source maps)

**Redux DevTools**:
1. Install Redux DevTools Extension
2. Open extension panel
3. Inspect state changes and actions

**React DevTools**:
1. Install React DevTools Extension
2. Inspect component tree
3. View props/state

### Electron Application Debugging

**Main Process**:
```bash
# Launch with Node.js debugger
node --inspect-brk packages/electron_app/dist/index.js
```

**Renderer Process**:
- Use Chrome DevTools (same as web app)
- Access via `View > Toggle Developer Tools` in Electron

### Graph Execution Debugging

**Log Block Execution**:
```typescript
// In Execute() method
blockCompOrder.forEach((bId) => {
  const block = this.blocks.find((b) => b.id === bId)!
  console.log(`Executing ${block.name}`, {
    inputs: block.inputPorts.map(p => p.GetObjectValue()),
    outputs: block.outputPorts.map(p => p.GetObjectValue())
  })
  // ... rest of execution
})
```

**Visualize Compile Order**:
```typescript
const compileOrder = graph.GetBlockCompileOrder()
console.log('Execution order:', compileOrder.map(id =>
  graph.blocks.find(b => b.id === id)?.name
))
```

**Check Graph Validity**:
```typescript
if (!graph.isValidGraph()) {
  const scc = graph.SCC()
  const sources = graph.GetSourceBlocks()
  console.log('Invalid graph detected')
  console.log('Components:', scc)
  console.log('Sources:', sources)
}
```

## Build & Deployment

### Production Build

```bash
# Build all packages
npm run clean
npm run bootstrap
npx lerna run build --stream

# Or specific package
BUILD_TYPE=web npm run web:build
npm run electron:build
```

### Build Output

- **web_app**: `packages/web_app/dist/` (HTML, JS, CSS bundles)
- **electron_app**: `packages/electron_app/dist/` (Electron executable + resources)

### Deployment

**Web Application**:
- Deploy `packages/web_app/dist/` to static hosting (Netlify, Vercel, S3)
- Configure routes for SPA

**Electron Application**:
- Package with `electron-builder` or similar
- Create installers for Windows/Mac/Linux

## Performance Optimization

### Graph Execution Performance

**Reduce Callback Overhead**:
- Minimize string transformations in `ConvertCallback()`
- Cache compiled callbacks

**Optimize Compile Order**:
- Reduce DFS calls by caching adjacency lists

**Batch Updates**:
- Group multiple block additions
- Recalculate compile order only when needed

### UI Performance

**Canvas Rendering**:
- Limit blocks to ~1000 for smooth performance
- Use Konva layers for efficient updates
- Implement viewport culling for large graphs

**Redux Optimizations**:
- Use `useSelector` with equality checks
- Memoize selectors with `reselect`
- Avoid unnecessary re-renders

## Common Issues & Solutions

### Issue: Lerna Bootstrap Fails

**Cause**: Dependency version conflicts

**Solution**:
```bash
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run bootstrap
```

### Issue: TypeScript Type Errors in IDE

**Cause**: IDE not using workspace TypeScript

**Solution**: Configure IDE to use workspace TS version

### Issue: Graph Execution Not Working

**Cause**: Invalid compile order or missing callbacks

**Solution**:
```typescript
// Debug compile order
const order = graph.GetBlockCompileOrder()
console.log('Compile order:', order)

// Verify blocks have callbacks
graph.blocks.forEach(block => {
  if (!block.callbackString) {
    console.warn(`Block ${block.name} missing callback`)
  }
})
```

### Issue: Port Type Mismatch Error

**Cause**: Attempting to connect incompatible port types

**Solution**: Verify port types match before connection:
```typescript
const outputPort = graph.blocks[0].outputPorts[0]
const inputPort = graph.blocks[1].inputPorts[0]

if (outputPort.type !== inputPort.type) {
  console.error('Type mismatch:', outputPort.type, '!==', inputPort.type)
}
```

## Best Practices

### Code Organization
- Keep block logic in `packages/common/src/DefaultBlocks/`
- UI components in `packages/web_app/src/app/Container/`
- Tests colocated with source in `__tests__/`

### Naming Conventions
- **Classes**: PascalCase (Graph, Block, Edge)
- **Functions**: camelCase (AddBlock, GetSourceBlocks)
- **Constants**: UPPER_SNAKE_CASE
- **Files**: PascalCase for components, camelCase for utilities

### Error Handling
- Use `CompXError` for domain errors
- Validate inputs before operations
- Provide clear error messages with context

### Documentation
- JSDoc for public APIs
- Inline comments for complex algorithms
- Update README when adding features

### Git Workflow
- Feature branches from `master`
- Descriptive commit messages
- Run tests before pushing
- Create PR for review

---

**Last Updated**: 2025-10-25
**Guide Version**: 1.0
