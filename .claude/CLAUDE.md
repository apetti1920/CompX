# CompX Project - Claude Code Instructions

## Project Overview

**CompX** is a visual block-based computational graph system with both web and Electron desktop applications. It implements a sophisticated graph computation engine for modeling, simulation, and visual programming.

### Core Capabilities
- **Block-Based Visual Programming**: Drag-and-drop graph construction with typed ports
- **Graph Execution Engine**: DFS-based compilation, SCC detection, topological sorting
- **Multi-Platform**: Web app (React) and Electron desktop application
- **Real-Time Simulation**: Continuous and discrete-time execution support

## Architecture

### Monorepo Structure (Lerna + npm workspaces)
```
CompX/
├── packages/
│   ├── common/           # Core graph engine (TypeScript)
│   ├── web_app/          # React web application
│   ├── electron_app/     # Electron main process
│   └── electron_loader/  # Electron splash/loader
```

### Package Dependencies
- **@compx/common**: Core graph computation library (no UI dependencies)
- **@compx/web_app**: React/Redux UI → depends on common
- **@compx/electron_app**: Electron main → bundles web_app + loader
- **@compx/electron_loader**: Electron splash screen

## Core Domain Concepts

### Graph Theory Foundation
CompX implements **directed graph computation** with these key concepts:

1. **Graph**: Container for blocks and edges
2. **Block**: Computational node with input/output ports
3. **Edge**: Typed connection between ports
4. **Port**: Typed data endpoint (number, vector, matrix, boolean, string)

### Graph Algorithms Implemented
- **DFS (Depth-First Search)**: Graph traversal
- **SCC (Strongly Connected Components)**: Feedback loop detection via Kosaraju's algorithm
- **Edge Classification**: Tree, back, forward, cross edges
- **Topological Sorting**: Compile order determination
- **Graph Transpose**: For SCC computation

### Block Execution Model
Blocks use **callback functions** with domain-specific syntax:
- `inputPort[portName]`: Access current input
- `prevInput[portName]`: Access previous input (creates pseudo-source)
- `prevOutput[portName]`: Access previous output (for state)
- `initialCondition[portName]`: Initial value access

## Technology Stack

### Core Libraries
- **TypeScript 4.4.4**: Strict typing throughout
- **Lodash**: Utility functions for deep cloning, data manipulation
- **uuid**: Unique identifier generation
- **loglevel**: Logging infrastructure

### Frontend (web_app)
- **React 18.2**: UI framework
- **Redux Toolkit**: State management
- **React-Konva**: Canvas-based graph visualization
- **Bootstrap 5.2**: UI components and styling
- **Webpack 5**: Build system with dev server

### Desktop (electron_app)
- **Electron**: Cross-platform desktop wrapper
- **Window Management**: Custom window manager for app lifecycle

### Build & Quality
- **Lerna 6.4.1**: Monorepo management
- **Jest 29**: Testing framework
- **ESLint + Prettier**: Code quality and formatting
- **Husky + lint-staged**: Pre-commit hooks
- **TypeScript Compiler**: Type checking across packages

## Development Patterns

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Classes**: PascalCase (Graph, Block, Edge, Port)
- **Functions**: camelCase (AddBlock, GetSourceBlocks)
- **Constants**: UPPER_SNAKE_CASE
- **Interfaces/Types**: PascalCase with Type suffix (BlockStorageType)

### Code Organization
- **Graph Logic**: `packages/common/src/Graph/`
- **Network/Storage**: `packages/common/src/Network/GraphItemStorage/`
- **Default Blocks**: `packages/common/src/DefaultBlocks/` (Constant, Gain, Integrator, Sum, Scope)
- **UI Components**: `packages/web_app/src/app/Container/`
- **Redux Store**: `packages/web_app/src/store/`

### Type Safety Patterns
Uses advanced TypeScript features:
- **Mapped Types**: `MapStringsToPortsType<T>` converts string tuples to port types
- **Conditional Types**: Port type validation
- **Generic Constraints**: `Inputs extends PortStringListType`
- **Tuple Manipulation**: `ReplaceInTuple<T, I, U>` for port type changes

## Build Commands

### Root Level
```bash
npm run clean              # Clean all packages
npm run bootstrap          # Install and link dependencies

# Web Development
npm run web:start          # Dev server on port 3000
npm run web:build          # Production build

# Electron Development
npm run electron:start     # Build and launch Electron app
npm run electron:build     # Production Electron build

# Testing
npm test                   # Run Jest tests
```

### Package-Specific
```bash
npx lerna run build --scope=@compx/common
npx lerna run test --scope=@compx/common --stream
```

## Docker Build Commands

### Production Web Server (Recommended)
```bash
# Build nginx-based web server image
docker build --target web_server -t compx:latest .

# Run container
docker run -d -p 8080:80 --name compx compx:latest

# Access application
open http://localhost:8080
```

### Development Server
```bash
# Build development image with hot reload
docker build --target web_dev -t compx:dev .

# Run with volume mounts for live updates
docker run -d -p 3000:3000 \
  -v $(pwd)/packages/web_app/src:/compx/packages/web_app/src \
  -v $(pwd)/packages/common/src:/compx/packages/common/src \
  compx:dev
```

### Build Stages
The Dockerfile contains multiple build stages:
- **base**: Foundation with Node 18 Alpine + Python + build tools
- **loader_builder**: Electron splash screen builder
- **web_builder_base**: Web app build preparation
- **web_dev**: Development server with hot reload
- **web_builder**: Production web app build
- **web_server**: nginx serving static files (250MB, recommended)
- **electon_builder_linux**: Electron desktop packaging (not needed for Docker)

### Important Notes
1. **Always use `--target web_server`** for production deployments
2. **Python + build tools** required for native npm modules (@parcel/watcher)
3. **Workspace structure**: All dependencies installed centrally via npm workspaces
4. **Webpack alias**: Configured to resolve @compx/common package paths

See [Docker Guide](../claudedocs/DOCKER.md) for comprehensive Docker documentation.

## Graph Engine API

### Key Classes

#### Graph
```typescript
class Graph {
  blocks: Block<any, any>[]
  edges: Edge<any>[]

  AddBlock(block: BlockStorageType): string
  RemoveBlock(blockId: string): void
  AddEdge(outputBlockId, outputPortId, inputBlockId, inputPortId): string
  RemoveEdge(edgeId: string): void

  GetSourceBlocks(): string[]  // No inputs
  GetSinkBlocks(): string[]    // No outputs
  GetAdjacentBlocks(blockId): string[]

  DFS(startBlock): string[]
  SCC(): string[][]             // Strongly connected components
  ClassifyEdges(): { [edgeId]: EdgeTypes }
  Transpose(): Graph

  isValidGraph(): boolean
  GetBlockCompileOrder(): string[]
  Execute(T: number | 'infinite', dt: number): void
}
```

#### Block
```typescript
class Block<Inputs, Outputs> {
  id: string
  name: string
  description: string
  tags: string[]
  inputPorts: Port<Inputs>[]
  outputPorts: Port<Outputs>[]
  callbackString: string

  Execute(t, dt, newInputs): void
  SetCallback(callbackStr): void
  ChangeInputPortType(portIndex, type, initialValue): Block
  ChangeOutputPortType(portIndex, type, initialValue): Block
}
```

#### Port Types
```typescript
type PortTypes = {
  'number': number
  'vector': Vector2D
  'matrix': Matrix2D
  'boolean': boolean
  'string': string
}
```

### Default Blocks

**Constant**: Outputs constant value
**Gain**: Multiplies input by gain factor
**Sum**: Adds/subtracts multiple inputs
**Integrator**: Continuous integration with initial condition
**Scope**: Data visualization sink

## State Management (Redux)

### Store Structure
```typescript
{
  graph: {
    graph: Graph            // Core graph instance
    blockCompileOrder: string[]
  },
  canvas: {
    scale: number
    position: Vector2D
    // ... canvas state
  }
}
```

### Actions
- **Graph Actions**: `ADD_BLOCK`, `REMOVE_BLOCK`, `ADD_EDGE`, `REMOVE_EDGE`
- **Canvas Actions**: `SET_SCALE`, `SET_POSITION`, zoom/pan controls

## Common Development Tasks

### Adding a New Block Type
1. Create block definition in `packages/common/src/DefaultBlocks/`
2. Define input/output port types
3. Write callback string with domain syntax
4. Add to index exports
5. Register in electron_app startup
6. Add UI component in web_app if needed

### Modifying Graph Algorithm
1. Update logic in `packages/common/src/Graph/Graph.ts`
2. Add/update tests in `packages/common/__tests__/`
3. Ensure algorithm maintains graph invariants
4. Update compile order if execution affected

### UI Component Development
1. Create component in `packages/web_app/src/app/Container/`
2. Use React-Konva for canvas elements
3. Connect to Redux with hooks (`useSelector`, `useDispatch`)
4. Follow existing component patterns (BlockComponent, EdgeComponent)

## Testing

### Test Structure
- Unit tests in `__tests__` directories within packages
- Test resources in `__tests__/Resources/`
- Jest configuration per package
- Coverage reporting enabled

### Running Tests
```bash
npm test                           # All tests
npm test -- --watch               # Watch mode
npm test -- packages/common       # Specific package
```

## Important Constraints

### Graph Validity Rules
1. Each strongly connected component must have ≥1 source or pseudo-source
2. Maximum one edge per input port
3. Port types must match for connections
4. No self-loops without pseudo-source blocks
5. Compile order must be computable (no invalid cycles)

### Performance Considerations
- **Graph Size**: Algorithms are O(V+E), suitable for moderate graphs
- **Execution**: Synchronous per time step
- **UI Rendering**: React-Konva uses canvas, scales to ~1000 elements

## Debugging Tips

### Graph Execution Issues
- Check `GetBlockCompileOrder()` for correct topological sort
- Verify `isValidGraph()` returns true
- Inspect `ClassifyEdges()` for back edges (feedback loops)
- Use `SCC()` to identify strongly connected components

### Type Errors
- Port type mismatches: Check `PortTypes` definitions
- Generic constraints: Ensure `PortStringListType` compliance
- Storage conversions: Verify ToStorage/FromStorage symmetry

### Build Issues
- Clear with `npm run clean` then `npm run bootstrap`
- Check Lerna linking: `npx lerna link`
- Verify TypeScript compilation in each package separately

## Future Development Areas

### Potential Enhancements
- **Asynchronous Execution**: Worker threads for large graphs
- **Custom Block Editor**: Visual callback editor instead of strings
- **Graph Persistence**: Save/load graph files
- **Real-Time Collaboration**: Multi-user graph editing
- **Performance Profiling**: Execution time visualization per block
- **Advanced Visualizations**: Scope block improvements, data plotting

### Known Limitations
- Callback strings use `eval`-based Function constructor (security consideration)
- No runtime type checking during execution
- Limited error recovery during graph execution
- Canvas performance degrades with very large graphs (>1000 blocks)

## Working with Claude Code

### Best Practices
1. **Search Strategy**: Use Serena MCP for symbol navigation in large TypeScript codebase
2. **Graph Operations**: Reference Graph.ts:line_number for algorithm implementations
3. **Type Modifications**: Understand mapped types before changing port definitions
4. **Testing**: Always run tests after graph algorithm changes
5. **Build Verification**: Test both web and electron builds for cross-platform changes

### Common Queries
- "Find all references to Block class" → Use Serena find_symbol
- "Explain SCC algorithm" → Reference Graph.ts:261-318
- "Add new port type" → Modify Port.ts type definitions + update all type maps
- "Debug execution order" → Inspect GetBlockCompileOrder() logic at Graph.ts:334-381

## Project Maintenance

### Dependency Updates
- Major updates: Test thoroughly across all packages
- Minor updates: Run full test suite
- Security patches: Prioritize and validate

### Code Quality Standards
- ESLint: Airbnb config with TypeScript extensions
- Prettier: Consistent formatting
- Pre-commit hooks: Enforce quality before commits
- Type coverage: Maintain strict TypeScript compliance

### Documentation Standards
- JSDoc for public APIs
- Inline comments for complex algorithms
- README updates for new features
- Architecture docs for major changes

---

**Last Updated**: 2025-10-25
**Version**: 1.0.0
**Maintainer**: Aidan Petti
