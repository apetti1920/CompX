# CompX Quick Start Guide

## 5-Minute Setup

### Step 1: Clone and Install (2 minutes)

```bash
git clone https://github.com/your-org/CompX.git
cd CompX
npm install
npm run bootstrap
```

### Step 2: Verify Installation (1 minute)

```bash
npm test
```

✅ All tests should pass

### Step 3: Launch Development Server (2 minutes)

```bash
npm run web:start
```

🚀 Open browser to `http://localhost:3000`

## First Graph in 10 Minutes

### Build a Simple Gain Graph

**1. Add Constant Block**
- Drag "Constant" from library
- Set value to `5`

**2. Add Gain Block**
- Drag "Gain" from library
- Set gain to `2`

**3. Add Scope Block**
- Drag "Scope" from library

**4. Connect Blocks**
- Connect Constant output → Gain input
- Connect Gain output → Scope input

**5. Execute**
- Click "Run" button
- Scope shows `10` (5 × 2)

## Understanding the Code

### Core Graph Operations

```typescript
import { Graph } from '@compx/common'
import { Constant, Gain, Scope } from '@compx/common'

// Create empty graph
const graph = new Graph({ blocks: [], edges: [] })

// Add blocks
const constantId = graph.AddBlock(Constant)
const gainId = graph.AddBlock(Gain)
const scopeId = graph.AddBlock(Scope)

// Connect blocks
graph.AddEdge(constantId, 'value', gainId, 'in')
graph.AddEdge(gainId, 'out', scopeId, 'in')

// Execute simulation
graph.Execute(10.0, 0.01)  // 10 seconds, 0.01s time step
```

## Creating Your First Custom Block

### Simple Multiplier Block

```typescript
// packages/common/src/DefaultBlocks/Multiplier.ts
import { BlockStorageType } from '../Network/GraphItemStorage/BlockStorage'

export const Multiplier: BlockStorageType<
  ['in1', 'in2'],  // Two number inputs
  ['out']          // One number output
> = {
  name: 'Multiplier',
  description: 'Multiplies two inputs',
  tags: ['math'],
  inputPorts: [
    { name: 'in1', type: 'number' },
    { name: 'in2', type: 'number' }
  ],
  outputPorts: [
    { name: 'out', type: 'number' }
  ],
  callbackString: `
    return [inputPort[in1] * inputPort[in2]];
  `
}
```

### Export and Use

```typescript
// packages/common/src/DefaultBlocks/index.ts
export { Multiplier } from './Multiplier'

// In your code
import { Multiplier } from '@compx/common'

const multiplierId = graph.AddBlock(Multiplier)
```

## Common Development Tasks

### Add a Block
```typescript
const blockId = graph.AddBlock({
  name: 'MyBlock',
  description: 'Custom block',
  tags: ['custom'],
  inputPorts: [{ name: 'in', type: 'number' }],
  outputPorts: [{ name: 'out', type: 'number' }],
  callbackString: 'return [inputPort[in] * 2]'
})
```

### Connect Blocks
```typescript
const edgeId = graph.AddEdge(
  sourceBlockId, 'outputPortName',
  targetBlockId, 'inputPortName'
)
```

### Remove Block
```typescript
graph.RemoveBlock(blockId)
```

### Get Graph Information
```typescript
const sources = graph.GetSourceBlocks()
const sinks = graph.GetSinkBlocks()
const compileOrder = graph.GetBlockCompileOrder()
const isValid = graph.isValidGraph()
```

### Execute Graph
```typescript
// Fixed duration
graph.Execute(10.0, 0.01)

// Continuous (manual stop)
graph.Execute('infinite', 0.01)
```

## Project Structure Overview

```
CompX/
├── packages/
│   ├── common/              # ⚙️  Core graph engine
│   │   ├── src/Graph/       #     Graph, Block, Edge, Port
│   │   └── src/DefaultBlocks/ #   Built-in blocks
│   │
│   ├── web_app/             # 🌐 React web application
│   │   ├── src/app/         #     UI components
│   │   └── src/store/       #     Redux state
│   │
│   ├── electron_app/        # 🖥️  Desktop wrapper
│   └── electron_loader/     # 🔄 Splash screen
│
├── .claude/CLAUDE.md        # 📘 Project instructions
└── claudedocs/              # 📚 Full documentation
```

## Development Workflow

### 1. Make Changes
```bash
# Edit files in packages/
vim packages/common/src/Graph/Graph.ts
```

### 2. Test Changes
```bash
npm test -- packages/common
```

### 3. Run Development Server
```bash
npm run web:start
# Changes auto-reload
```

### 4. Build for Production
```bash
npm run web:build
# or
npm run electron:build
```

## Available Commands

### Development
```bash
npm run web:start           # Start web dev server
npm run electron:start      # Build and launch Electron
```

### Building
```bash
npm run web:build          # Build web app
npm run electron:build     # Build Electron app
```

### Testing
```bash
npm test                   # Run all tests
npm test -- --watch        # Watch mode
npm test -- packages/common # Specific package
```

### Code Quality
```bash
npm run lint               # ESLint check
npm run format             # Prettier format
```

### Package Management
```bash
npm run clean              # Clean all packages
npm run bootstrap          # Install dependencies
```

## Debugging Tips

### Graph Not Executing?

**Check compile order**:
```typescript
const order = graph.GetBlockCompileOrder()
console.log(order)
```

**Verify graph validity**:
```typescript
if (!graph.isValidGraph()) {
  console.log('Invalid graph!')
  console.log('Sources:', graph.GetSourceBlocks())
  console.log('SCCs:', graph.SCC())
}
```

### Port Connection Failing?

**Check port types**:
```typescript
const outPort = block1.outputPorts[0]
const inPort = block2.inputPorts[0]
console.log('Types:', outPort.type, inPort.type)
```

### Build Errors?

**Clean and rebuild**:
```bash
npm run clean
npm install
npm run bootstrap
```

## Next Steps

### Learn More
1. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture
2. **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API documentation
3. **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Advanced development

### Try Examples
- Build a feedback loop with Integrator
- Create multi-input Sum block
- Implement custom visualization
- Add new port type (e.g., Complex numbers)

### Contribute
- Read [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md#best-practices)
- Follow code quality standards
- Write tests for new features
- Update documentation

## Getting Help

### Documentation
- **Quick questions**: [CLAUDE.md](../.claude/CLAUDE.md)
- **API usage**: [API_REFERENCE.md](./API_REFERENCE.md)
- **Architecture**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Development**: [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)

### Community
- GitHub Issues: [Report bugs or request features](https://github.com/your-org/CompX/issues)
- Discussions: [Ask questions](https://github.com/your-org/CompX/discussions)

## Common Pitfalls

### ❌ Port Type Mismatch
```typescript
// Wrong: Connecting number to vector
graph.AddEdge(numberBlock, 'out', vectorBlock, 'in')
```
✅ **Solution**: Ensure port types match

### ❌ Missing Callback
```typescript
// Wrong: Block without callback
const block: BlockStorageType = {
  name: 'MyBlock',
  // ... ports ...
  callbackString: ''  // Empty!
}
```
✅ **Solution**: Always provide callback logic

### ❌ Invalid Graph Structure
```typescript
// Wrong: Loop without pseudo-source
graph.AddEdge(block1, 'out', block2, 'in')
graph.AddEdge(block2, 'out', block1, 'in')
```
✅ **Solution**: Use blocks with `prevInput[]` or `prevOutput[]` in loops

### ❌ Multiple Edges to Input
```typescript
// Wrong: Two edges to same input
graph.AddEdge(block1, 'out', block3, 'in')
graph.AddEdge(block2, 'out', block3, 'in')  // Error!
```
✅ **Solution**: Use Sum block for multiple inputs

## Performance Tips

### Graph Execution
- ⚡ Keep graphs under 1000 blocks for optimal UI performance
- ⚡ Cache compile order if graph structure doesn't change
- ⚡ Use simple callbacks (avoid complex calculations)

### UI Rendering
- ⚡ Limit visible blocks when zoomed out
- ⚡ Use viewport culling for large graphs
- ⚡ Debounce frequent updates

## Keyboard Shortcuts (Web App)

- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Delete` - Remove selected blocks/edges
- `Ctrl/Cmd + A` - Select all
- Mouse wheel - Zoom
- Click + drag - Pan canvas

---

**Last Updated**: 2025-10-25
**Quick Start Version**: 1.0

🎉 **You're ready to start building with CompX!**
