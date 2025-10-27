# JSON-Based Block Definition System - Design Document

**Version:** 1.0
**Date:** 2025-10-27
**Status:** Design Phase

## Executive Summary

This document outlines the migration from TypeScript-based block definitions to a JSON-based block definition system with dynamic loading, validation, and multi-platform API support. The system is designed to support downloadable block packs and hot-reloading without application restarts.

---

## Table of Contents

1. [Background & Motivation](#background--motivation)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Implementation Phases](#implementation-phases)
5. [Technical Specifications](#technical-specifications)
6. [API Design](#api-design)
7. [Migration Strategy](#migration-strategy)
8. [Testing Strategy](#testing-strategy)
9. [Future Considerations](#future-considerations)

---

## Background & Motivation

### Current System Limitations

**TypeScript Block Definitions** (`packages/common/src/DefaultBlocks/`)
- Blocks defined as TypeScript constants exported from `.ts` files
- Requires compilation and application restart for any block changes
- No support for runtime block loading or dynamic block packs
- Tightly coupled to TypeScript build process

### Goals

1. **Dynamic Block Loading**: Support downloadable block packs without app restart
2. **Hot-Reload**: Enable block development without compilation cycles
3. **Multi-Platform**: Abstract storage/loading for Electron and future web server
4. **Validation**: JSON Schema-based validation for type safety
5. **Extensibility**: Support user-created blocks and third-party block packs

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Block Service (Platform-Agnostic API)          │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │ IPC / HTTP
┌────────────────────────┴────────────────────────────────────┐
│              Backend (Electron / Web Server)                │
│  ┌────────────────────────────────────────────────────────┐ │
│  │            Block Library Manager                       │ │
│  │  - File System Watcher                                 │ │
│  │  - Block Registry                                      │ │
│  │  - Validation Engine                                   │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────┴────────────────────────────────────┐
│                   File System Storage                       │
│  - Core Blocks:      packages/common/block_definitions/     │
│  - User Blocks:      userData/custom_blocks/                │
│  - Downloaded Packs: userData/block_packs/                  │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Loading Strategy** | File System Watcher | Enables dynamic block pack installation without restart |
| **Validation** | JSON Schema | Industry standard, excellent tooling, type generation |
| **Storage Format** | JSON | Human-readable, versionable, language-agnostic |
| **Organization** | Category directories + tags | Balance between structure and searchability |
| **Versioning** | Semantic versioning in schema | Enables migrations and backward compatibility |
| **Platform Abstraction** | Service interface pattern | Future-proof for web server implementation |

---

## Core Components

### 1. Block JSON Schema

**Purpose**: Define strict structure for block definitions with validation

**Key Features**:
- JSON Schema Draft 7 specification
- Semantic versioning support (`schema_version`, `block_version`)
- Port type definitions with initial values
- Visual styling metadata (color, icon, shape)
- Validation rules for callback strings

**Schema Fields**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["schema_version", "name", "version", "inputPorts", "outputPorts", "callbackString"],
  "properties": {
    "schema_version": "1.0.0",
    "name": "string",
    "version": "string",
    "description": "string",
    "tags": ["string"],
    "category": "string",
    "inputPorts": [{ "name": "string", "type": "enum", "initialValue": "any" }],
    "outputPorts": [{ "name": "string", "type": "enum" }],
    "callbackString": "string",
    "visual": {
      "color": "string (hex)",
      "icon": "string (path)",
      "shape": "enum [rect, circ, tri]"
    }
  }
}
```

### 2. Block Library Manager

**Purpose**: Central registry for all available blocks with dynamic loading

**Responsibilities**:
- Initialize block registry on startup
- Watch file system for block changes
- Validate new/updated block definitions
- Maintain searchable index of blocks
- Notify frontend of library changes

**Key Methods**:
```typescript
interface BlockLibraryManager {
  // Initialization
  initialize(): Promise<void>;

  // Registry access
  getAllBlocks(): BlockDefinition[];
  getBlockByName(name: string): BlockDefinition | undefined;
  searchBlocks(query: BlockSearchQuery): BlockDefinition[];

  // Dynamic updates (internal, triggered by watcher)
  addBlock(definition: BlockDefinition): void;
  updateBlock(name: string, definition: BlockDefinition): void;
  removeBlock(name: string): void;

  // Events
  on(event: 'block-added' | 'block-updated' | 'block-removed', callback: Function): void;
}
```

### 3. File System Watcher

**Purpose**: Monitor block directories for changes and trigger registry updates

**Watched Directories**:
- `packages/common/block_definitions/` - Core blocks (read-only)
- `userData/custom_blocks/` - User-created blocks
- `userData/block_packs/{pack-name}/` - Downloaded block packs

**Events Handled**:
- `add` - New block file detected
- `change` - Existing block file modified
- `unlink` - Block file deleted

**Implementation Details**:
- Use `chokidar` library (stable, cross-platform, feature-rich)
- Debounce events (100ms) to handle rapid successive changes
- Validate on change, update registry only if valid
- Graceful error handling (invalid blocks logged, don't crash app)

### 4. Validation Engine

**Purpose**: Ensure all block definitions conform to schema and semantic rules

**Validation Layers**:

1. **JSON Schema Validation** (Structure)
   - Field presence and types
   - Enum value constraints
   - String format validation (hex colors, semver)

2. **Semantic Validation** (Logic)
   - Port name uniqueness within block
   - Callback string syntax checking
   - Port type compatibility
   - Icon/image path existence verification

3. **Version Compatibility** (Migration)
   - Schema version compatibility checks
   - Auto-migration for minor version differences
   - Warning for deprecated fields

**Error Reporting**:
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}
```

### 5. Platform Abstraction Layer

**Purpose**: Decouple frontend from specific backend implementation (Electron vs Web)

**Interface Design**:
```typescript
// Frontend-facing interface (platform-agnostic)
interface BlockService {
  // Block library access
  getAvailableBlocks(): Promise<BlockDefinition[]>;
  getBlock(name: string): Promise<BlockDefinition | null>;
  searchBlocks(query: BlockSearchQuery): Promise<BlockDefinition[]>;

  // Real-time updates
  onLibraryChanged(callback: (event: LibraryChangeEvent) => void): () => void;

  // Block pack management (future)
  installBlockPack(packUrl: string): Promise<void>;
  uninstallBlockPack(packName: string): Promise<void>;
}

// Backend implementations
class ElectronBlockService implements BlockService { /* IPC-based */ }
class WebBlockService implements BlockService { /* HTTP-based */ }
```

### 6. Frontend Block Service

**Purpose**: Provide React components with block library access

**Features**:
- Singleton service instance
- React hooks for block access (`useBlockLibrary`, `useBlock`)
- Automatic re-rendering on library updates
- Local caching for performance

**Usage Example**:
```typescript
// In React component
const { blocks, loading, error } = useBlockLibrary();
const gainBlock = useBlock('gain');

// Service automatically handles platform differences (Electron vs Web)
```

---

## Implementation Phases

### Phase 0: Foundation & Validation (Week 1)

**Goal**: Establish schema and validation infrastructure

**Tasks**:
1. Define JSON Schema for block definitions
2. Create schema validation system with Ajv
3. Write comprehensive schema tests
4. Document schema format and examples
5. Create migration guide from TS to JSON

**Deliverables**:
- `packages/common/src/BlockSchema/schema.json`
- `packages/common/src/BlockSchema/validator.ts`
- `packages/common/src/BlockSchema/__tests__/`
- `claudedocs/block-schema-specification.md`

**Success Criteria**:
- Schema validates all existing block types
- 100% test coverage for validation logic
- Clear error messages for validation failures

---

### Phase 1: File Storage & Organization (Week 1)

**Goal**: Set up block definition file structure

**Tasks**:
1. Create directory structure for block definitions
2. Convert 1-2 existing blocks to JSON format (proof of concept)
3. Implement block file loader (sync, startup-only version)
4. Create build script to validate all blocks at build time

**Deliverables**:
- `packages/common/block_definitions/math/gain.json`
- `packages/common/block_definitions/math/constant.json`
- `packages/common/src/BlockLoader/FileLoader.ts`
- `scripts/validate-blocks.js` (build-time validation)

**Success Criteria**:
- 2 blocks successfully loaded from JSON
- Build fails if any block invalid
- Directory structure supports category organization

---

### Phase 2: Block Library Manager (Week 2)

**Goal**: Create in-memory registry with startup loading

**Tasks**:
1. Implement BlockLibraryManager class
2. Build block registry (Map-based, searchable)
3. Create initialization routine (load all blocks on startup)
4. Add search/filter capabilities
5. Write comprehensive unit tests

**Deliverables**:
- `packages/common/src/BlockLibrary/BlockLibraryManager.ts`
- `packages/common/src/BlockLibrary/BlockRegistry.ts`
- `packages/common/src/BlockLibrary/__tests__/`

**Success Criteria**:
- All blocks loaded into registry on startup
- Search by name, tags, category works correctly
- <100ms search performance for 1000 blocks

---

### Phase 3: File System Watcher (Week 2)

**Goal**: Enable dynamic block loading without restart

**Tasks**:
1. Integrate `chokidar` file system watcher
2. Implement event handlers (add/change/unlink)
3. Add debouncing for rapid file changes
4. Create event notification system
5. Handle error cases gracefully
6. Write integration tests with temp directories

**Deliverables**:
- `packages/common/src/BlockLibrary/BlockWatcher.ts`
- `packages/common/src/BlockLibrary/__tests__/watcher.test.ts`

**Success Criteria**:
- New block JSON detected within 200ms
- Invalid blocks don't crash watcher
- Multiple rapid changes handled correctly
- Works across all three watch directories

---

### Phase 4: Electron Integration (Week 3)

**Goal**: Expose block library via Electron IPC

**Tasks**:
1. Update electron_loader to initialize BlockLibraryManager
2. Create IPC handlers for block library API
3. Implement event forwarding (library changes → renderer)
4. Add userData directory setup for custom blocks
5. Test with Electron app

**Deliverables**:
- `packages/electron_app/src/startup/BlockLibrarySetup.ts`
- `packages/electron_app/src/ipc/BlockLibraryHandlers.ts`
- Updated `packages/electron_app/src/index.ts`

**API Methods** (IPC):
- `block-library:get-all` → `BlockDefinition[]`
- `block-library:get` (name) → `BlockDefinition | null`
- `block-library:search` (query) → `BlockDefinition[]`

**Events** (IPC):
- `block-library:changed` → `LibraryChangeEvent`

**Success Criteria**:
- Blocks available via IPC within 1s of app start
- File changes propagate to renderer within 500ms
- No memory leaks from event listeners

---

### Phase 5: Frontend Service Layer (Week 3)

**Goal**: Create platform-agnostic frontend API

**Tasks**:
1. Define BlockService interface
2. Implement ElectronBlockService (IPC-based)
3. Create React hooks (useBlockLibrary, useBlock)
4. Add service initialization in app bootstrap
5. Write frontend tests with mocked service

**Deliverables**:
- `packages/web_app/src/services/BlockService/interface.ts`
- `packages/web_app/src/services/BlockService/ElectronImpl.ts`
- `packages/web_app/src/hooks/useBlockLibrary.ts`
- `packages/web_app/src/services/BlockService/__tests__/`

**Success Criteria**:
- Frontend never directly calls Electron IPC
- Easy to swap implementations (Electron → Web)
- React components re-render on library updates
- Service mock enables offline development

---

### Phase 6: Frontend Integration (Week 4)

**Goal**: Update UI to use new block library system

**Tasks**:
1. Update block palette to use BlockService
2. Modify block creation flow to use JSON definitions
3. Update Redux actions/reducers for new format
4. Add UI for block library status (loading, errors)
5. Test all block-related UI flows

**Deliverables**:
- Updated `packages/web_app/src/app/Container/BlockLibrary/`
- Modified Redux actions in `packages/web_app/src/store/actions/graphactions.ts`
- UI components for library status/errors

**Success Criteria**:
- Block palette shows all available blocks
- Newly added blocks appear without refresh
- Block creation works identically to before
- Error states handled gracefully in UI

---

### Phase 7: Migration & Deprecation (Week 4)

**Goal**: Convert all existing TS blocks to JSON, deprecate old system

**Tasks**:
1. Convert all remaining DefaultBlocks to JSON format
2. Verify functional equivalence with tests
3. Update documentation and examples
4. Create migration script for future blocks
5. Deprecate (but don't remove) old TS block system
6. Add deprecation warnings

**Deliverables**:
- All blocks in `packages/common/block_definitions/`
- `scripts/migrate-ts-block-to-json.js` utility
- Updated `CLAUDE.md` with new block creation process
- Deprecation notices in old code

**Success Criteria**:
- All 6+ core blocks converted to JSON
- App works identically with JSON blocks
- Clear migration path documented
- Zero regression in functionality

---

### Phase 8: Web Server Abstraction (Week 5)

**Goal**: Prepare for future web server implementation

**Tasks**:
1. Design HTTP API spec for block library
2. Implement WebBlockService stub (returns mock data)
3. Add platform detection and service selection
4. Document API endpoints for future implementation
5. Create API specification (OpenAPI/Swagger)

**Deliverables**:
- `packages/web_app/src/services/BlockService/WebImpl.ts` (stub)
- `claudedocs/block-library-api-spec.yaml` (OpenAPI)
- Platform detection in service factory

**Success Criteria**:
- WebBlockService implements full interface
- Easy to swap between Electron and Web implementations
- API spec complete and validated
- No breaking changes to frontend code required

---

### Phase 9: Testing & Polish (Week 5-6)

**Goal**: Comprehensive testing and production readiness

**Tasks**:
1. Write end-to-end tests for entire flow
2. Performance testing (large block libraries)
3. Error handling and edge case testing
4. Documentation review and updates
5. Security review (file access, validation)
6. User acceptance testing

**Test Scenarios**:
- Load 1000 blocks on startup
- Add block while app running
- Update block definition while in use
- Delete block currently on canvas
- Invalid JSON in block file
- Corrupt block definition
- Network drive / slow file system
- Concurrent file changes

**Deliverables**:
- E2E test suite
- Performance benchmarks
- Security audit report
- Updated documentation

**Success Criteria**:
- All tests passing
- No memory leaks
- Handles 1000+ blocks smoothly
- Security review approved

---

## Technical Specifications

### Block JSON Format

**Example: Gain Block**
```json
{
  "$schema": "./schema.json",
  "schema_version": "1.0.0",
  "name": "gain",
  "version": "1.0.0",
  "description": "Multiply a signal by a constant value",
  "category": "math",
  "tags": ["math", "linear", "scaling"],
  "inputPorts": [
    {
      "name": "x",
      "type": "NUMBER"
    }
  ],
  "outputPorts": [
    {
      "name": "y",
      "type": "NUMBER"
    }
  ],
  "callbackString": "return [inputPort[x] * 0.75]",
  "visual": {
    "color": "#4CAF50",
    "icon": "multiply",
    "shape": "rect"
  }
}
```

**Example: Integrator Block (with initial value)**
```json
{
  "$schema": "./schema.json",
  "schema_version": "1.0.0",
  "name": "integrator",
  "version": "1.0.0",
  "description": "Integrates a signal over time",
  "category": "math",
  "tags": ["math", "diffeq", "dynamics"],
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
  "callbackString": "return [prevOutput[y] + dt * (prevInput[x] + inputPort[x]) / 2]",
  "visual": {
    "color": "#2196F3",
    "icon": "integral",
    "shape": "rect"
  }
}
```

### Port Type System

**Supported Types**:
- `NUMBER` - Scalar numeric value
- `STRING` - Text string
- `VECTOR` - 2D vector (future)
- `MATRIX` - 2D matrix (future)
- `BOOLEAN` - Boolean value (future)

**Type Definitions** (unchanged from current system):
```typescript
export const PortTypesStringList = ['STRING', 'NUMBER'] as const;

export interface PortTypes {
  STRING: string;
  NUMBER: number;
}
```

### Callback String Syntax

**Available Variables**:
- `inputPort[name]` - Current input port value
- `prevInput[name]` - Previous input value (creates pseudo-source)
- `prevOutput[name]` - Previous output value (for state)
- `initialCondition[name]` - Initial value for port
- `t` - Current simulation time
- `dt` - Time step

**Example Callbacks**:
```javascript
// Constant
"return [5]"

// Gain
"return [inputPort[x] * 0.75]"

// Sum
"return [inputPort[a] + inputPort[b]]"

// Integrator (trapezoidal)
"return [prevOutput[y] + dt * (prevInput[x] + inputPort[x]) / 2]"

// Scope (side effect)
"console.log(inputPort[x]); return []"
```

### Directory Structure

```
packages/common/block_definitions/
├── schema.json                     # JSON Schema definition
├── math/
│   ├── constant.json
│   ├── gain.json
│   ├── sum.json
│   ├── multiply.json
│   └── integrator.json
├── logic/                          # Future category
│   └── ...
├── io/                             # Future category
│   ├── scope.json
│   └── ...
└── signal/                         # Future category
    └── ...

{userData}/custom_blocks/           # User-created blocks
├── my_custom_block.json
└── ...

{userData}/block_packs/             # Downloaded block packs
├── control-systems-pack/
│   ├── manifest.json
│   └── blocks/
│       ├── pid.json
│       ├── lead_lag.json
│       └── ...
└── signal-processing-pack/
    └── ...
```

---

## API Design

### IPC API (Electron)

**Channels**:
```typescript
// Requests
'block-library:get-all' → BlockDefinition[]
'block-library:get' (name: string) → BlockDefinition | null
'block-library:search' (query: BlockSearchQuery) → BlockDefinition[]

// Events (from main → renderer)
'block-library:changed' → LibraryChangeEvent
'block-library:error' → LibraryErrorEvent
```

**Type Definitions**:
```typescript
interface BlockDefinition {
  schema_version: string;
  name: string;
  version: string;
  description: string;
  category: string;
  tags: string[];
  inputPorts: PortDefinition[];
  outputPorts: PortDefinition[];
  callbackString: string;
  visual: VisualDefinition;
}

interface BlockSearchQuery {
  name?: string;           // Partial match
  tags?: string[];         // Any tag matches
  category?: string;       // Exact match
}

interface LibraryChangeEvent {
  type: 'block-added' | 'block-updated' | 'block-removed';
  blockName: string;
  block?: BlockDefinition;  // Present for add/update
}

interface LibraryErrorEvent {
  blockFile: string;
  error: string;
  validationErrors?: ValidationError[];
}
```

### HTTP API (Future Web Server)

**Endpoints**:
```
GET  /api/blocks              → List all blocks
GET  /api/blocks/:name        → Get specific block
GET  /api/blocks/search       → Search blocks (query params)
GET  /api/blocks/stream       → SSE stream for real-time updates
POST /api/block-packs/install → Install block pack (future)
```

**Example Responses**:
```json
// GET /api/blocks
{
  "blocks": [...],
  "count": 42,
  "lastUpdated": "2025-10-27T12:00:00Z"
}

// GET /api/blocks/gain
{
  "block": { ... }
}

// GET /api/blocks/stream (SSE)
event: block-added
data: { "blockName": "custom_pid", "block": { ... } }

event: block-updated
data: { "blockName": "gain", "block": { ... } }
```

---

## Migration Strategy

### From TypeScript to JSON

**Current Format** (TypeScript):
```typescript
const gain: BlockStorageType<['NUMBER'], ['NUMBER']> = {
  name: 'gain',
  description: 'Multiply a signal by a constant value',
  tags: ['math'],
  outputPorts: [{ name: 'y', type: 'NUMBER' }],
  inputPorts: [{ name: 'x', type: 'NUMBER' }],
  callbackString: 'return [inputPort[x] * 0.75]'
};
export default gain;
```

**New Format** (JSON):
```json
{
  "$schema": "./schema.json",
  "schema_version": "1.0.0",
  "name": "gain",
  "version": "1.0.0",
  "description": "Multiply a signal by a constant value",
  "category": "math",
  "tags": ["math"],
  "inputPorts": [{ "name": "x", "type": "NUMBER" }],
  "outputPorts": [{ "name": "y", "type": "NUMBER" }],
  "callbackString": "return [inputPort[x] * 0.75]",
  "visual": {
    "color": "#4CAF50",
    "icon": "multiply",
    "shape": "rect"
  }
}
```

**Migration Steps**:
1. Convert one block at a time
2. Run tests to verify equivalence
3. Update any block-specific UI references
4. Add visual styling metadata
5. Delete old TS file
6. Update exports/imports

**Automated Migration Script**:
```bash
# Convert TS block to JSON
npm run migrate-block -- packages/common/src/DefaultBlocks/Gain.ts
```

### Backward Compatibility

**During Transition** (Phases 1-7):
- Both systems coexist
- Old TS blocks still work
- New JSON blocks loaded alongside
- Gradual migration, no breaking changes

**Post-Migration** (Phase 8+):
- TS block system deprecated but functional
- Warnings in console for TS block usage
- All new blocks must be JSON
- Documentation updated

---

## Testing Strategy

### Unit Tests

**Components to Test**:
- JSON Schema validation
- Block file parsing
- Registry operations (add/update/remove/search)
- File system watcher event handling
- IPC handlers
- Frontend service implementations

**Example Test Cases**:
```typescript
describe('BlockValidator', () => {
  it('validates correct block definition', () => {
    const block = loadBlockJSON('valid-gain.json');
    const result = validator.validate(block);
    expect(result.valid).toBe(true);
  });

  it('rejects block with invalid port type', () => {
    const block = { ...validBlock, inputPorts: [{ type: 'INVALID' }] };
    const result = validator.validate(block);
    expect(result.valid).toBe(false);
    expect(result.errors[0].field).toBe('inputPorts[0].type');
  });
});

describe('BlockRegistry', () => {
  it('finds blocks by partial name match', () => {
    registry.add(gainBlock);
    registry.add(integratorBlock);
    const results = registry.search({ name: 'gai' });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('gain');
  });
});
```

### Integration Tests

**Scenarios**:
- Load all blocks from directory on startup
- Add new block file and verify registry update
- Modify block file and verify update propagation
- Delete block file and verify removal
- Invalid block doesn't crash system

**Example**:
```typescript
describe('Block Watcher Integration', () => {
  let tempDir: string;
  let manager: BlockLibraryManager;

  beforeEach(async () => {
    tempDir = await createTempDir();
    manager = new BlockLibraryManager(tempDir);
    await manager.initialize();
  });

  it('detects new block file and updates registry', async () => {
    const promise = waitForEvent(manager, 'block-added');
    await writeFile(path.join(tempDir, 'new-block.json'), validBlockJSON);
    const event = await promise;

    expect(event.blockName).toBe('new-block');
    expect(manager.getBlock('new-block')).toBeDefined();
  });
});
```

### End-to-End Tests

**Full User Flows**:
1. Start app → blocks loaded → palette shows all blocks
2. Drag block to canvas → instantiation works
3. Add new block JSON file → appears in palette within 1s
4. Modify block → existing instances unaffected (or updated based on strategy)
5. Delete block → removed from palette

**Tools**:
- Playwright for Electron app testing
- Jest for unit/integration tests
- Custom test utilities for temp file system

---

## Performance Considerations

### Startup Performance

**Target**: App ready in <2 seconds

**Optimizations**:
- Lazy load block details (load index first, details on demand)
- Parallel JSON parsing
- Index cache in userData (invalidate on directory change)
- Limit startup validation (full validation in background)

### Runtime Performance

**Targets**:
- Block search: <50ms for 1000 blocks
- File change detection: <200ms
- Registry update: <10ms
- Frontend notification: <100ms

**Optimizations**:
- In-memory Map-based registry (O(1) lookup)
- Debounced file system events
- Incremental index updates (not full rebuild)
- Efficient event propagation (only send deltas to frontend)

### Memory Management

**Considerations**:
- Each block definition: ~1-5KB
- 1000 blocks = ~1-5MB memory (acceptable)
- Registry overhead: minimal (Map + indexes)
- Watcher overhead: <1MB

**Monitoring**:
- Track registry size
- Monitor event listener count
- Check for memory leaks in watcher

---

## Security Considerations

### File System Access

**Risks**:
- Malicious block definitions (arbitrary code in callbacks)
- Path traversal attacks
- Symlink attacks

**Mitigations**:
- Validate all file paths before reading
- Restrict write access to userData only
- Sanitize callback strings (AST parsing, not eval)
- Sandboxed callback execution
- User confirmation for block pack installation

### Validation Bypass

**Risks**:
- Invalid blocks loaded into registry
- Schema validation disabled

**Mitigations**:
- Always validate before adding to registry
- No way to disable validation in production
- Log all validation failures
- Reject invalid blocks immediately

### Callback Code Injection

**Current Risk**: Callback strings use `eval` (Function constructor)

**Future Mitigation** (Phase 10+):
- AST parsing and validation
- Whitelist of allowed operations
- VM sandbox for callback execution
- Consider WebAssembly for user blocks

---

## Future Considerations

### Phase 10+: Advanced Features

**Block Pack Ecosystem**:
- Block pack marketplace
- Automated installation/updates
- Dependency management
- Digital signatures for verification

**Block Development Tools**:
- Visual callback editor
- Block testing framework
- Interactive block simulator
- Documentation generator

**Performance Enhancements**:
- Compiled callbacks (WebAssembly)
- Block caching strategies
- Lazy block loading
- Virtual scrolling in block palette

**Collaboration Features**:
- Shared block libraries
- Version control integration
- Team block repositories
- Review/approval workflows

---

## Appendices

### A. File Locations

```
packages/common/
├── src/
│   ├── BlockSchema/
│   │   ├── schema.json
│   │   ├── validator.ts
│   │   └── types.ts
│   ├── BlockLibrary/
│   │   ├── BlockLibraryManager.ts
│   │   ├── BlockRegistry.ts
│   │   ├── BlockWatcher.ts
│   │   └── __tests__/
│   └── BlockLoader/
│       └── FileLoader.ts
└── block_definitions/
    ├── schema.json
    └── math/
        └── *.json

packages/electron_app/src/
├── startup/
│   └── BlockLibrarySetup.ts
└── ipc/
    └── BlockLibraryHandlers.ts

packages/web_app/src/
├── services/
│   └── BlockService/
│       ├── interface.ts
│       ├── ElectronImpl.ts
│       ├── WebImpl.ts (stub)
│       └── factory.ts
└── hooks/
    └── useBlockLibrary.ts
```

### B. Dependencies

**New Dependencies**:
```json
{
  "chokidar": "^3.5.3",          // File system watcher
  "ajv": "^8.12.0",              // JSON Schema validation
  "ajv-formats": "^2.1.1"        // Additional format validators
}
```

### C. Environment Variables

```bash
# Development
BLOCK_DEV_MODE=true              # Enable hot reload
BLOCK_WATCH_POLLING=false        # Use native fs.watch (faster)

# Production
BLOCK_VALIDATION_LEVEL=strict    # Full validation
BLOCK_CACHE_ENABLED=true         # Enable index cache
```

### D. Glossary

- **Block Definition**: JSON file describing a computational block
- **Block Instance**: Runtime instantiation of a block on canvas
- **Block Pack**: Collection of related block definitions
- **Registry**: In-memory index of all available block definitions
- **Watcher**: File system monitor for dynamic block loading
- **Platform Abstraction**: Service layer hiding Electron/Web differences

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-27 | System | Initial design document |

---

## Questions & Decisions Log

**Q: Should we support block versioning?**
A: Yes, include `version` field with semantic versioning

**Q: File watcher vs startup loading?**
A: File watcher for better UX with block packs

**Q: How to organize blocks?**
A: Category directories + searchable tags

**Q: Custom metadata support?**
A: No, strict schema for initial version

**Q: Visual styling in JSON?**
A: Yes, basic properties (color, icon, shape)

---

**End of Document**
