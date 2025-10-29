# Block Library Troubleshooting Report

**Date**: 2025-10-28
**Issue**: Block search only shows old DefaultBlocks (Constant, Sum, Multiply) instead of JSON-based blocks

## Root Cause Analysis

### 🔴 Critical Issues Found

#### 1. **Missing Electron IPC Handlers** (CRITICAL)
**Location**: `packages/electron_app/src/index.ts`

**Problem**: The Electron main process has NO IPC handlers registered for the BlockService channels.

**Evidence**:
- `ElectronBlockService` tries to invoke: `block-library:get-all`, `block-library:get`, etc.
- Search through electron_app found ZERO `ipcMain.handle()` calls
- The `defaultblockcreation.ts` startup code is commented out and never runs

**Impact**: When the web app calls `service.getAvailableBlocks()`, the IPC call fails silently, and the app falls back to hardcoded blocks.

#### 2. **Web App Uses Hardcoded DefaultBlocks** (HIGH)
**Location**: `packages/web_app/src/store/types.ts:31`

**Problem**: Redux store initializes with hardcoded blocks from `@compx/common/DefaultBlocks`:

```typescript
libraryBlocks: [Constant, Sum, Multiply]  // Line 31
```

**Impact**: Even if IPC handlers existed, the initial state shows only 3 blocks.

#### 3. **Startup Code Never Executes** (MEDIUM)
**Location**: `packages/electron_app/src/startup/defaultblockcreation.ts`

**Problem**: The startup initialization is completely commented out in `index.ts`:
```typescript
// import StartupStep from './startup';
// import DefaultBlockCreation from './startup/defaultblockcreation';
```

**Impact**: Block storage directory may not be created, JSON files may not be loaded.

## Architecture Gap

### Current State
```
Web App (React)
    ↓
ElectronBlockService.getAvailableBlocks()
    ↓
ipc.invoke('block-library:get-all')  ← FAILS (no handler)
    ↓
Falls back to hardcoded: [Constant, Sum, Multiply]
```

### Expected State (Not Implemented)
```
Web App (React)
    ↓
ElectronBlockService.getAvailableBlocks()
    ↓
ipc.invoke('block-library:get-all')
    ↓
Main Process IPC Handler ← MISSING
    ↓
BlockManager.getAvailableBlocks() ← MISSING
    ↓
Read JSON files from block_storage/ ← MISSING
    ↓
Return all blocks to renderer
```

## Missing Components

### 1. Electron Main Process BlockManager
**Required File**: `packages/electron_app/src/services/BlockManager.ts`

**Purpose**: Server-side block management with file system access

**Required Methods**:
```typescript
class BlockManager {
  private blockStoragePath: string;
  private blocks: Map<string, BlockDefinition>;

  async loadBlocksFromDisk(): Promise<void>;
  async getAvailableBlocks(): Promise<BlockDefinition[]>;
  async getBlock(name: string): Promise<BlockDefinition | null>;
  async searchBlocks(query: string): Promise<BlockDefinition[]>;
  async installBlockPack(url: string): Promise<void>;
  async uninstallBlockPack(name: string): Promise<void>;
}
```

### 2. IPC Handler Registration
**Required File**: `packages/electron_app/src/ipc/blockServiceHandlers.ts`

**Purpose**: Register IPC channels to connect renderer to BlockManager

**Required Handlers**:
```typescript
ipcMain.handle('block-library:get-all', async () => {
  return blockManager.getAvailableBlocks();
});

ipcMain.handle('block-library:get', async (event, blockName: string) => {
  return blockManager.getBlock(blockName);
});

ipcMain.handle('block-library:search', async (event, query: string) => {
  return blockManager.searchBlocks(query);
});

// ... other handlers
```

### 3. Startup Integration
**Required**: Uncomment and fix `packages/electron_app/src/index.ts`

**Changes Needed**:
```typescript
import { setupBlockServiceHandlers } from './ipc/blockServiceHandlers';

app.on('ready', async () => {
  // Initialize block manager and IPC handlers
  await setupBlockServiceHandlers();

  // Create main window...
});
```

### 4. Redux Store Integration
**Required**: Update `packages/web_app/src/store/types.ts`

**Changes Needed**:
```typescript
// Remove hardcoded imports
// import { Constant, Sum, Multiply } from '@compx/common/DefaultBlocks';

export const defaultState: StateType = {
  currentGraph: {
    graph: MakeVisualGraph(0),
    selected: [],
    libraryBlocks: []  // Start empty, load from service
  },
  // ...
};
```

## Why DefaultBlocks Can't Be Deleted Yet

**Current Dependencies**:
1. ✅ `packages/web_app/src/store/types.ts:1` - Imports Constant, Sum, Multiply
2. ✅ `packages/electron_app/src/startup/defaultblockcreation.ts:4` - Commented import
3. ❓ Other test files may import DefaultBlocks

**Deletion Blockers**:
- Redux store initialization depends on DefaultBlocks
- No alternative block loading mechanism is functional
- IPC infrastructure doesn't exist yet

**Safe to Delete After**:
1. Implement Electron BlockManager with JSON file reading
2. Register IPC handlers in main process
3. Update Redux store to load from service
4. Verify all tests pass without DefaultBlocks imports

## Recommended Fix Strategy

### Phase 1: Implement Electron Block Service (CRITICAL)
1. Create `BlockManager` class for main process
2. Implement JSON file reading from `block_storage/`
3. Load JSON blocks generated previously

### Phase 2: Register IPC Handlers (CRITICAL)
1. Create IPC handler file
2. Connect handlers to BlockManager methods
3. Register handlers on app startup

### Phase 3: Update Web App (HIGH)
1. Remove DefaultBlocks imports from Redux store
2. Initialize with empty array
3. Load blocks from service on app start
4. Update Redux actions to populate library

### Phase 4: Verification (MEDIUM)
1. Test block library populates correctly
2. Test block search shows all JSON blocks
3. Verify no DefaultBlocks dependencies remain
4. Delete `packages/common/src/DefaultBlocks/` directory

## Testing Checklist

- [ ] Electron app starts without errors
- [ ] Block library loads all JSON blocks
- [ ] Block search shows >3 blocks (not just Constant, Sum, Multiply)
- [ ] Block details display correctly
- [ ] Redux store populates from service
- [ ] No imports from `@compx/common/DefaultBlocks`
- [ ] All tests pass after DefaultBlocks deletion

## Technical Debt

**Current Technical Debt**:
- Electron main process has no block management
- IPC infrastructure incomplete
- Web app depends on hardcoded blocks
- Startup code is disabled/commented out

**Impact**:
- JSON block definitions exist but are never used
- Block library system is non-functional
- Cannot add/remove blocks without code changes

## Next Steps

1. **IMMEDIATE**: Implement Electron BlockManager
2. **IMMEDIATE**: Register IPC handlers
3. **HIGH**: Update Redux store initialization
4. **MEDIUM**: Verify and test complete flow
5. **LOW**: Delete DefaultBlocks directory

## References

- ElectronBlockService IPC channels: `packages/web_app/src/services/BlockService/ElectronBlockService.ts:19-27`
- Redux store initialization: `packages/web_app/src/store/types.ts:27-40`
- Commented startup code: `packages/electron_app/src/index.ts:51-65`
- Block storage path: `packages/electron_app/src/startup/defaultblockcreation.ts:17`
