# CompX API Reference

## Core Graph API

### Graph Class

**Location**: `packages/common/src/Graph/Graph.ts`

**Purpose**: Container and orchestrator for computational graphs

#### Constructor

```typescript
constructor(graph: GraphStorageType)
```

**Parameters**:
- `graph`: Serialized graph structure containing blocks and edges

**Example**:
```typescript
const graph = new Graph({
  blocks: [...],
  edges: [...]
})
```

#### Block Management Methods

##### AddBlock()
```typescript
AddBlock(block: BlockStorageType<PortStringListType, PortStringListType>): string
```

**Purpose**: Add a new block to the graph

**Parameters**:
- `block`: Block storage definition (name, ports, callback)

**Returns**: UUID of newly created block

**Throws**: None (block creation always succeeds)

**Example**:
```typescript
const blockId = graph.AddBlock({
  name: 'Gain',
  description: 'Multiplies input by constant',
  tags: ['math', 'linear'],
  inputPorts: [{ name: 'in', type: 'number' }],
  outputPorts: [{ name: 'out', type: 'number' }],
  callbackString: 'return [inputPort[in] * 2]'
})
```

##### RemoveBlock()
```typescript
RemoveBlock(blockId: string): void | never
```

**Purpose**: Remove block and connected edges from graph

**Parameters**:
- `blockId`: UUID of block to remove

**Throws**: `CompXError` if block not found

**Side Effects**: Removes all edges connected to this block

**Example**:
```typescript
graph.RemoveBlock('uuid-of-block')
```

#### Edge Management Methods

##### AddEdge()
```typescript
AddEdge(
  outputBlockId: string,
  outputPortId: string,
  inputBlockId: string,
  inputPortId: string
): string | never
```

**Purpose**: Create typed connection between blocks

**Parameters**:
- `outputBlockId`: Source block UUID
- `outputPortId`: Source port name
- `inputBlockId`: Destination block UUID
- `inputPortId`: Destination port name

**Returns**: UUID of edge (existing if duplicate, new otherwise)

**Validation**:
- ✓ Both blocks exist
- ✓ Both ports exist
- ✓ Port types match
- ✓ Only one edge per input port
- ✗ Throws `CompXError` on validation failure

**Example**:
```typescript
const edgeId = graph.AddEdge(
  constantBlockId, 'value',  // output
  gainBlockId, 'in'          // input
)
```

##### RemoveEdge()
```typescript
RemoveEdge(edgeId: string): void | never
```

**Purpose**: Remove edge connection

**Throws**: `CompXError` if edge not found

**Example**:
```typescript
graph.RemoveEdge('uuid-of-edge')
```

#### Graph Query Methods

##### GetSourceBlocks()
```typescript
GetSourceBlocks(): string[]
```

**Purpose**: Find all blocks with no inputs or pseudo-source blocks

**Returns**: Array of block UUIDs

**Definition**: Source = no input ports OR uses `prevInput[]`/`prevOutput[]`

**Example**:
```typescript
const sources = graph.GetSourceBlocks()
// ['constant-uuid', 'integrator-uuid']
```

##### GetSinkBlocks()
```typescript
GetSinkBlocks(): string[]
```

**Purpose**: Find all blocks with no outputs

**Returns**: Array of block UUIDs

**Example**:
```typescript
const sinks = graph.GetSinkBlocks()
// ['scope-uuid', 'output-uuid']
```

##### GetAdjacentBlocks()
```typescript
GetAdjacentBlocks(blockId: string): string[]
```

**Purpose**: Find all blocks immediately downstream of given block

**Returns**: Array of block UUIDs connected to outputs

**Example**:
```typescript
const adjacentBlocks = graph.GetAdjacentBlocks(gainBlockId)
// ['sum-uuid', 'scope-uuid']
```

#### Graph Algorithm Methods

##### DFS()
```typescript
DFS(startBlock: string): string[]
```

**Purpose**: Depth-first traversal from starting block

**Algorithm**: Recursive DFS with visited tracking

**Returns**: Array of block UUIDs in DFS discovery order

**Complexity**: O(V + E)

**Example**:
```typescript
const reachableBlocks = graph.DFS(constantBlockId)
// ['constant-uuid', 'gain-uuid', 'sum-uuid', 'scope-uuid']
```

##### SCC()
```typescript
SCC(): string[][]
```

**Purpose**: Find strongly connected components using Kosaraju's algorithm

**Algorithm**:
1. DFS to find finish times
2. Transpose graph
3. DFS on transpose in reverse finish order

**Returns**: Array of component groups (each group is array of block UUIDs)

**Complexity**: O(V + E)

**Example**:
```typescript
const components = graph.SCC()
// [
//   ['integrator-uuid', 'feedback-gain-uuid'],  // Feedback loop
//   ['constant-uuid'],
//   ['scope-uuid']
// ]
```

##### ClassifyEdges()
```typescript
ClassifyEdges(): { [edgeId: string]: EdgeTypes }
```

**Purpose**: Classify each edge as TREE, BACK, FORWARD, or CROSS

**Algorithm**: DFS-based with discovery/finish time comparison

**Returns**: Map of edge UUID to edge type

**Edge Types**:
- `TREE`: DFS tree edge (parent → child)
- `BACK`: Feedback edge (descendant → ancestor)
- `FORWARD`: Shortcut edge (ancestor → descendant, non-tree)
- `CROSS`: Between different DFS subtrees

**Example**:
```typescript
const edgeTypes = graph.ClassifyEdges()
// {
//   'edge-1-uuid': 'TREE',
//   'edge-2-uuid': 'BACK',   // Feedback loop
//   'edge-3-uuid': 'TREE'
// }
```

##### Transpose()
```typescript
Transpose(): Graph
```

**Purpose**: Reverse all edges in graph (for SCC algorithm)

**Returns**: New Graph instance with reversed edges

**Side Effects**: Clears callbacks (invalid after port swap)

**Example**:
```typescript
const reversedGraph = graph.Transpose()
```

#### Graph Validation Methods

##### isValidGraph()
```typescript
isValidGraph(): boolean
```

**Purpose**: Validate graph can execute

**Validation Rule**: Each SCC must contain ≥1 source or sink

**Returns**: `true` if valid, `false` otherwise

**Example**:
```typescript
if (!graph.isValidGraph()) {
  throw new Error('Graph has unreachable components')
}
```

##### GetBlockCompileOrder()
```typescript
GetBlockCompileOrder(): string[]
```

**Purpose**: Compute topological execution order

**Algorithm**: Input-counting approach with DFS expansion

**Returns**: Array of block UUIDs in execution order

**Guarantees**:
- All inputs satisfied before execution
- Sinks appear at end
- Respects data dependencies

**Complexity**: O(V + E)

**Example**:
```typescript
const compileOrder = graph.GetBlockCompileOrder()
// ['constant-uuid', 'gain-uuid', 'sum-uuid', 'scope-uuid']
```

#### Execution Methods

##### Execute()
```typescript
Execute(T: number | 'infinite', dt: number): void
```

**Purpose**: Run time-stepped simulation

**Parameters**:
- `T`: Total simulation time OR `'infinite'` for continuous
- `dt`: Time step size

**Algorithm**:
```
for t = 0 to T step dt:
  for block in compileOrder:
    gather inputs from connected edges
    execute block callback
    update output values
```

**Example**:
```typescript
// Simulate for 10 seconds with 0.01s time step
graph.Execute(10.0, 0.01)

// Continuous simulation (manual stop required)
graph.Execute('infinite', 0.01)
```

#### Serialization Methods

##### ToStorage()
```typescript
ToStorage(): GraphStorageType
```

**Purpose**: Convert graph to serializable format

**Returns**: Plain object with block/edge storage

**Example**:
```typescript
const storage = graph.ToStorage()
localStorage.setItem('graph', JSON.stringify(storage))
```

---

## Block Class

**Location**: `packages/common/src/Graph/Block.ts`

### Constructor (Private)

Blocks created via static factory methods, not direct construction

### Static Factory Methods

##### InitializeFromStorage()
```typescript
static InitializeFromStorage<Inputs, Outputs>(
  blockStorage: BlockStorageType<Inputs, Outputs>
): Block<Inputs, Outputs>
```

**Purpose**: Create new block with generated UUID

**Parameters**: Block definition without ID

**Returns**: Block instance with new UUID

##### InitializeFromStorageWithId()
```typescript
static InitializeFromStorageWithId<Inputs, Outputs>(
  blockStorage: BlockStorageWithIDType<Inputs, Outputs>
): Block<Inputs, Outputs>
```

**Purpose**: Recreate block with specific UUID (deserialization)

**Parameters**: Block definition with ID

**Returns**: Block instance preserving UUID

### Instance Methods

##### SetCallback()
```typescript
SetCallback(callbackStr: string): void
```

**Purpose**: Set/update block's computational callback

**Callback Syntax**:
- `inputPort[name]` → Current input value
- `prevInput[name]` → Previous input (makes pseudo-source)
- `prevOutput[name]` → Previous output value
- `initialCondition[name]` → Initial value for port

**Example**:
```typescript
block.SetCallback(`
  const sum = inputPort[in1] + inputPort[in2];
  return [sum];
`)
```

##### Execute()
```typescript
Execute(t: number, dt: number, newInputs: MapStringsToTypes<Inputs>): void
```

**Purpose**: Execute block for one time step

**Parameters**:
- `t`: Current simulation time
- `dt`: Time step duration
- `newInputs`: Array of input values in port order

**Side Effects**: Updates output port values

**Example**:
```typescript
block.Execute(0.5, 0.01, [10, 20])  // Two inputs
```

##### ChangeInputPortType()
```typescript
ChangeInputPortType<I, U>(
  portIndex: I,
  type: U,
  initialValue?: PortTypes[U]
): Block<ReplaceInTuple<Inputs, I, U>, Outputs>
```

**Purpose**: Change port type (returns new block due to generics)

**Type Safety**: Return type reflects new port configuration

**Example**:
```typescript
const newBlock = block.ChangeInputPortType(0, 'vector', new Vector2D(0, 0))
```

##### ChangeOutputPortType()
```typescript
ChangeOutputPortType<I, U>(
  portIndex: I,
  type: U,
  initialValue?: PortTypes[U]
): Block<Inputs, ReplaceInTuple<Outputs, I, U>>
```

**Purpose**: Change output port type

**Example**:
```typescript
const newBlock = block.ChangeOutputPortType(0, 'matrix')
```

##### ToStorage()
```typescript
ToStorage(): BlockStorageWithIDType<Inputs, Outputs>
```

**Purpose**: Serialize block to storage format

---

## Port Class

**Location**: `packages/common/src/Graph/Port.ts`

### Port Type Definitions

```typescript
type PortTypes = {
  'number': number
  'vector': Vector2D
  'matrix': Matrix2D
  'boolean': boolean
  'string': string
}
```

### Methods

##### GetObjectValue()
```typescript
GetObjectValue(): PortTypes[T]
```

**Purpose**: Get current port value (typed)

##### SetValue()
```typescript
SetValue(value: PortTypes[T]): void
```

**Purpose**: Update port value (typed)

##### GetPortResetType()
```typescript
GetPortResetType<U>(type: U, initialValue?: PortTypes[U]): Port<U>
```

**Purpose**: Create new port with different type

---

## Edge Class

**Location**: `packages/common/src/Graph/Edge.ts`

### Edge Types

```typescript
type EdgeTypes = 'TREE' | 'BACK' | 'FORWARD' | 'CROSS'
```

### Structure

```typescript
class Edge<T extends keyof PortTypes> {
  id: string
  type: T
  output: { blockID: string, portID: string }
  input: { blockID: string, portID: string }
}
```

---

## Default Blocks API

**Location**: `packages/common/src/DefaultBlocks/`

### Constant Block

**Inputs**: None
**Outputs**: `['value']` (number)
**Callback**: Returns constant value
**Parameters**: Configurable output value

### Gain Block

**Inputs**: `['in']` (number)
**Outputs**: `['out']` (number)
**Callback**: `return [inputPort[in] * gain]`
**Parameters**: `gain` (multiplier)

### Sum Block

**Inputs**: `['in1', 'in2', ...]` (variable, all number)
**Outputs**: `['sum']` (number)
**Callback**: Sums all inputs (with optional negation)
**Parameters**: Sign per input (+/-)

### Integrator Block

**Inputs**: `['in']` (number)
**Outputs**: `['out']` (number)
**Callback**: `return [prevOutput[out] + inputPort[in] * dt]`
**Parameters**: Initial condition
**Special**: Pseudo-source (uses `prevOutput`)

### Scope Block

**Inputs**: `['in']` (number)
**Outputs**: None (sink)
**Callback**: Displays/logs input value
**Purpose**: Visualization and debugging

---

## Error Types

### CompXError

**Location**: `packages/common/src/Helpers/ErrorHandling.ts`

```typescript
class CompXError extends Error {
  constructor(
    level: 'error' | 'warning',
    title: string,
    message: string
  )
}
```

**Usage**:
```typescript
throw new CompXError(
  'warning',
  'Port Type Mismatch',
  `Cannot connect ${outputType} to ${inputType}`
)
```

---

## Redux Actions API

**Location**: `packages/web_app/src/store/actions/`

### Graph Actions

```typescript
// Add block to graph
dispatch({ type: 'ADD_BLOCK', payload: blockStorage })

// Remove block from graph
dispatch({ type: 'REMOVE_BLOCK', payload: blockId })

// Add edge connection
dispatch({
  type: 'ADD_EDGE',
  payload: { outputBlockId, outputPortId, inputBlockId, inputPortId }
})

// Remove edge connection
dispatch({ type: 'REMOVE_EDGE', payload: edgeId })

// Update compile order
dispatch({ type: 'UPDATE_COMPILE_ORDER' })
```

### Canvas Actions

```typescript
// Set zoom level
dispatch({ type: 'SET_SCALE', payload: scale })

// Set pan position
dispatch({ type: 'SET_POSITION', payload: { x, y } })

// Select blocks
dispatch({ type: 'SELECT_BLOCKS', payload: blockIds })

// Select edges
dispatch({ type: 'SELECT_EDGES', payload: edgeIds })
```

---

## Type Utilities

**Location**: `packages/common/src/Helpers/Types.ts`

### ReplaceInTuple
```typescript
type ReplaceInTuple<Tuple, Index, NewType>
```

**Purpose**: Replace element at index in tuple type

**Example**:
```typescript
ReplaceInTuple<['number', 'vector'], 1, 'matrix'>
// → ['number', 'matrix']
```

---

**API Version**: 1.0
**Last Updated**: 2025-10-25
