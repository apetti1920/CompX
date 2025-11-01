# CompX Architecture Documentation

## System Overview

CompX is a **visual computational graph system** that enables users to build, execute, and visualize block-based computational models. The system uses directed graph theory to model computational dependencies and execute calculations in the correct topological order.

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│              User Interface Layer               │
│  ┌──────────────────┐  ┌──────────────────┐    │
│  │   Web App        │  │  Electron App    │    │
│  │  (React/Redux)   │  │  (Desktop)       │    │
│  └────────┬─────────┘  └─────────┬────────┘    │
└───────────┼────────────────────────┼────────────┘
            │                        │
            └────────┬───────────────┘
                     │
┌────────────────────┼────────────────────────────┐
│              Graph Engine Layer                 │
│         (@compx/common package)                 │
│  ┌──────────────────────────────────────────┐  │
│  │          Graph Data Structure            │  │
│  │  • Blocks (computational nodes)          │  │
│  │  • Edges (typed connections)             │  │
│  │  • Ports (I/O endpoints)                 │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │        Graph Algorithms                  │  │
│  │  • DFS Traversal                         │  │
│  │  • SCC Detection (Kosaraju)              │  │
│  │  • Topological Sort                      │  │
│  │  • Edge Classification                   │  │
│  └──────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────┐  │
│  │        Execution Engine                  │  │
│  │  • Block Compilation                     │  │
│  │  • Callback Execution                    │  │
│  │  • Time-Stepped Simulation               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## Package Architecture

### 1. @compx/common (Core Engine)

**Purpose**: Platform-independent graph computation engine

**Key Modules**:

- **Graph/**: Core graph data structures and algorithms
- **DefaultBlocks/**: Built-in computational blocks
- **Network/**: Serialization and storage
- **Types/**: Mathematical types (Vector2D, Matrix2D)
- **Helpers/**: Utilities and error handling

**Dependencies**: Minimal (lodash, uuid, loglevel)

**Exports**:

```typescript
export { Graph } from './Graph/Graph';
export { Block } from './Graph/Block';
export { Edge } from './Graph/Edge';
export { Port } from './Graph/Port';
// ... default blocks, types, helpers
```

### 2. @compx/web_app (React Frontend)

**Purpose**: Web-based visual interface for graph construction and execution

**Key Modules**:

- **app/Container/Canvas/**: Visual graph rendering (React-Konva)
- **app/Container/Overlay/**: UI controls and toolbars
- **store/**: Redux state management
- **theme/**: Dark/light theme definitions

**Dependencies**:

- React 18.2, Redux Toolkit
- React-Konva (canvas visualization)
- Bootstrap 5.2 (UI components)
- @compx/common (graph engine)

**Build System**: Webpack 5 with dev server

### 3. @compx/electron_app (Desktop Application)

**Purpose**: Electron main process for desktop distribution

**Key Components**:

- Window management
- Main process lifecycle
- Bundles web_app as renderer process

**Build**: Compiles and packages web_app + electron_loader into dist/

### 4. @compx/electron_loader (Splash Screen)

**Purpose**: Loading screen during Electron app initialization

**Implementation**: Simple HTML/JS with particle animation

## Data Flow Architecture

### Graph Construction Flow

```
User Action (UI)
    ↓
Redux Action Dispatch
    ↓
Graph Reducer
    ↓
Graph.AddBlock() / AddEdge()
    ↓
Validation & Type Checking
    ↓
Graph State Update
    ↓
React Re-render (Konva Canvas)
```

### Graph Execution Flow

```
Execute(T, dt)
    ↓
GetBlockCompileOrder()  ← Topological Sort
    ↓
For each time step (t):
    ↓
    For each block (in compile order):
        ↓
        Gather inputs from connected output ports
        ↓
        Execute block callback
        ↓
        Update output port values
    ↓
    t += dt
```

## Core Algorithms

### 1. Topological Sort (Compile Order)

**File**: `packages/common/src/Graph/Graph.ts:334-381`

**Algorithm**: Input-counting approach

1. Identify all source blocks (no inputs)
2. Track number of unfulfilled inputs per block
3. Process sources in DFS order
4. Decrement input counts as blocks connect
5. Add blocks to compile order when all inputs satisfied
6. Move sink blocks to end

**Purpose**: Determines execution order ensuring data dependencies satisfied

**Complexity**: O(V + E) where V = blocks, E = edges

### 2. Strongly Connected Components (SCC)

**File**: `packages/common/src/Graph/Graph.ts:261-318`

**Algorithm**: Kosaraju's Algorithm

1. DFS on graph, track finish times
2. Transpose graph (reverse all edges)
3. DFS on transposed graph in decreasing finish time order
4. Each DFS tree = one SCC

**Purpose**: Detect feedback loops and validate graph structure

**Validation**: Each SCC must contain ≥1 source or pseudo-source

**Complexity**: O(V + E)

### 3. Edge Classification

**File**: `packages/common/src/Graph/Graph.ts:170-235`

**Algorithm**: DFS-based classification

- **Tree Edge**: Parent-child in DFS tree
- **Back Edge**: Descendent to ancestor (feedback loop)
- **Forward Edge**: Ancestor to descendent (non-tree)
- **Cross Edge**: Between different DFS subtrees

**Purpose**: Identify feedback loops and structural patterns

**Complexity**: O(V + E)

### 4. Graph Transpose

**File**: `packages/common/src/Graph/Graph.ts:238-258`

**Algorithm**:

1. Deep clone graph storage
2. Swap input/output ports for all blocks
3. Swap input/output for all edges
4. Clear callbacks (callbacks invalid after swap)

**Purpose**: Used in SCC computation

**Complexity**: O(V + E)

## Type System Architecture

### Port Type System

**File**: `packages/common/src/Graph/Port.ts`

```typescript
type PortTypes = {
  number: number;
  vector: Vector2D;
  matrix: Matrix2D;
  boolean: boolean;
  string: string;
};
```

**Type Safety**: Compile-time validation of port connections via TypeScript generics

### Generic Block Types

Blocks use **tuple-based generic types** for compile-time port validation:

```typescript
class Block<
  Inputs extends PortStringListType,   // e.g., ['number', 'vector']
  Outputs extends PortStringListType   // e.g., ['number']
>
```

**Mapped Types** convert string tuples to actual types:

```typescript
MapStringsToTypes<['number', 'vector']>
  → [number, Vector2D]
```

**Benefit**: Type errors caught at compile time, not runtime

## State Management (Redux)

### Store Structure

```typescript
{
  graph: {
    graph: Graph                    // Core graph instance
    blockCompileOrder: string[]     // Cached compile order
  },
  canvas: {
    scale: number                   // Zoom level
    position: Vector2D              // Pan position
    selectedBlocks: string[]
    selectedEdges: string[]
    // ... other canvas state
  }
}
```

### Action Patterns

**Graph Actions** (`packages/web_app/src/store/actions/graphactions.ts`):

- Dispatch action → Reducer → Graph method call → State update

**Canvas Actions** (`packages/web_app/src/store/actions/canvasactions.ts`):

- Pure state updates (no Graph interaction)

## Block Execution Model

### Callback System

Blocks execute via **callback functions** defined in domain-specific syntax:

**Syntax Transformations**:

```javascript
// User writes:
return [inputPort[in1] * 2];

// Compiled to:
return [newInputs[0] * 2];
```

**Special Variables**:

- `inputPort[name]` → Current input value
- `prevInput[name]` → Previous input (creates pseudo-source)
- `prevOutput[name]` → Previous output (for state)
- `initialCondition[name]` → Initial value

**Implementation**: Uses `new Function()` constructor (security consideration)

### Execution Engine

**File**: `packages/common/src/Graph/Graph.ts:384-424`

**Time-Stepped Simulation**:

```typescript
Execute(T: number | 'infinite', dt: number) {
  let t = 0.0
  const compileOrder = GetBlockCompileOrder()

  while (t < T) {
    for (block in compileOrder) {
      inputs = gatherInputsFromEdges()
      block.Execute(t, dt, inputs)
    }
    t += dt
  }
}
```

**Synchronous Execution**: All blocks execute in order each time step

## Visualization Architecture (React-Konva)

### Canvas Hierarchy

```
<Stage>
  <Layer name="grid">
    <Grid />
  </Layer>
  <Layer name="edges">
    {edges.map(edge => <EdgeComponent />)}
  </Layer>
  <Layer name="blocks">
    {blocks.map(block => <BlockComponent />)}
  </Layer>
</Stage>
```

### Rendering Strategy

- **Canvas-based**: Uses HTML5 Canvas via Konva library
- **React Integration**: React-Konva bridges React and Konva
- **Performance**: Efficient for moderate graphs (~100-1000 elements)
- **Interaction**: Mouse events handled by Konva, dispatched to Redux

## Error Handling Architecture

### CompXError System

**File**: `packages/common/src/Helpers/ErrorHandling.ts`

**Error Levels**:

- `'error'`: Critical failures, throw exceptions
- `'warning'`: Non-critical issues, log and continue

**Pattern**:

```typescript
throw new CompXError('warning', 'Add Edge Warning', 'Port type mismatch');
```

**Propagation**: Errors bubble up to UI layer for user notification

## Build Architecture

### Monorepo Build Process

**Tool**: Lerna 6.4.1 with npm workspaces

**Build Order**:

1. `@compx/common` (no dependencies)
2. `@compx/web_app` (depends on common)
3. `@compx/electron_loader` (independent)
4. `@compx/electron_app` (depends on web_app + loader)

### Webpack Configuration

**File**: `packages/web_app/webpack/webpack.config.js`

**Build Targets**:

- **web**: Standalone web application
- **electron**: Bundled for Electron renderer process

**Key Features**:

- TypeScript compilation via ts-loader
- Babel for React JSX
- CSS extraction
- HTML plugin with SVG inlining

## Security Considerations

### Callback Execution

- Uses `new Function()` constructor for dynamic callbacks
- **Risk**: Code injection if user input not sanitized
- **Mitigation**: Syntax transformation validates against defined patterns
- **Future**: Consider safer alternatives (sandboxed execution, AST parsing)

### Data Validation

- Port type checking at connection time
- Graph structure validation before execution
- Input validation in all public Graph methods

## Performance Characteristics

### Algorithmic Complexity

- **AddBlock/RemoveBlock**: O(1) with O(E) edge cleanup
- **AddEdge/RemoveEdge**: O(1)
- **DFS**: O(V + E)
- **SCC**: O(V + E)
- **Compile Order**: O(V + E)
- **Execute**: O(V × steps)

### Scalability Limits

- **Graph Size**: Algorithms scale to 1000s of blocks
- **UI Performance**: Canvas rendering degrades >1000 elements
- **Execution Speed**: Synchronous, limited by JavaScript event loop

## Extension Points

### Adding New Port Types

1. Update `PortTypes` interface
2. Add initializer to `PortTypeInitializers`
3. Update UI for type selection
4. Consider serialization impact

### Adding New Default Blocks

1. Create block definition in `DefaultBlocks/`
2. Define callback string
3. Register in startup
4. Add UI icon/representation

### Custom Algorithms

1. Extend Graph class methods
2. Maintain O(V+E) complexity where possible
3. Add tests for new algorithms
4. Update compile order if execution affected

## Testing Architecture

### Test Organization

- Unit tests colocated in `__tests__/` directories
- Test resources in `__tests__/Resources/`
- Jest configuration per package

### Coverage Goals

- Core algorithms: 100% coverage
- Graph operations: Full edge case coverage
- UI components: Interaction and rendering tests

---

**Architecture Version**: 1.0
**Last Updated**: 2025-10-25
