# Block Service Integration - Testing Guide

**Status**: ✅ Ready for Testing
**Date**: 2025-10-28

## Quick Start

### 1. Start Electron App
```bash
cd /Users/aidanpetti/Documents/Code/CompX
npm run electron:start
```

### 2. Expected Console Output

**Main Process Console** (Terminal where you ran `npm run electron:start`):
```
Setting up block service IPC handlers...
Created block storage directory: /Users/aidanpetti/Library/Application Support/CompX/block_storage
Found 4 JSON files in block storage
Loaded block: Constant
Loaded block: Gain
Loaded block: Integrator
Loaded block: Scope
BlockManager initialized with 4 blocks
Block service IPC handlers registered (4 blocks loaded)
Block service initialized successfully
```

**Renderer Process Console** (DevTools → Console in Electron window):
```
IPC: GET_ALL - Fetching all blocks
IPC: GET_ALL - Returning 4 blocks
Loading 4 blocks into Redux store
```

### 3. Verification Checklist

✅ **Electron Startup**:
- [ ] App starts without errors
- [ ] Console shows "Block service initialized successfully"
- [ ] Console shows "BlockManager initialized with 4 blocks"

✅ **IPC Communication**:
- [ ] DevTools console shows "IPC: GET_ALL - Returning 4 blocks"
- [ ] No IPC errors in console

✅ **Redux Store**:
- [ ] Open Redux DevTools
- [ ] Find action: `@@graph_reducer/LOAD_LIBRARY_BLOCKS`
- [ ] Verify `state.currentGraph.libraryBlocks` contains 4 blocks
- [ ] Block objects have proper structure (name, description, ports, etc.)

✅ **Block Library UI**:
- [ ] Open block library/search in the UI
- [ ] Verify 4 blocks appear (not just 3):
  - Constant
  - Gain
  - Integrator
  - Scope
- [ ] Search functionality works
- [ ] Block details display correctly

## Test Data Location

JSON block files are located at:
```
~/Library/Application Support/CompX/block_storage/
```

Current test blocks:
- `test_block_constant.json` - Source block outputting constant value
- `test_block_gain.json` - Multiplies input by gain factor
- `test_block_integrator.json` - Continuous integration with initial condition
- `test_block_scope.json` - Visualization sink for monitoring signals

## Troubleshooting

### No Blocks Loaded
**Symptom**: Console shows "BlockManager initialized with 0 blocks"

**Check**:
```bash
ls -la ~/Library/Application\ Support/CompX/block_storage/
```

**Fix**: JSON files should be present. If not, they may have been deleted. Recreate with:
```bash
# Copy test blocks from tmp if still available
cp /tmp/test_block_*.json ~/Library/Application\ Support/CompX/block_storage/
```

### IPC Errors
**Symptom**: Renderer console shows IPC errors or timeouts

**Check**:
1. Verify main process console shows IPC handlers registered
2. Check for errors during BlockManager initialization
3. Restart electron app to clear IPC state

### Still Shows 3 Blocks
**Symptom**: Block library shows Constant, Sum, Multiply (hardcoded DefaultBlocks)

**Root Cause**: Redux store still initialized with DefaultBlocks array

**Verify Fix Applied**:
```bash
grep -n "libraryBlocks:" packages/web_app/src/store/types.ts
```

**Expected**: Should show `libraryBlocks: []` (empty array), NOT `[Constant, Sum, Multiply]`

### Redux Action Not Dispatched
**Symptom**: No `LOAD_LIBRARY_BLOCKS` action in Redux DevTools

**Check**:
1. Verify BlockLibraryLoader component rendered
2. Check for errors in useBlockLibrary hook
3. Verify BlockServiceProvider wraps app in index.tsx

## Success Criteria

✅ **Implementation Successful** when:
1. Electron app starts without errors
2. Console shows 4 blocks loaded (not 0, not 3)
3. IPC communication works (GET_ALL returns 4 blocks)
4. Redux action `LOAD_LIBRARY_BLOCKS` dispatched
5. Block library UI displays all 4 blocks
6. Block search/filter functionality works

## Next Steps After Successful Testing

1. **Add More Blocks**: Create additional JSON files in block_storage/
2. **Delete DefaultBlocks**: Remove `packages/common/src/DefaultBlocks/` directory
3. **Update Tests**: Modify tests to use JSON-loaded blocks
4. **Documentation**: Update user documentation with block creation guide

## Adding More Blocks

To add custom blocks, create JSON files in:
```
~/Library/Application Support/CompX/block_storage/
```

**Example - Sum block**:
```json
{
  "schema_version": "1.0.0",
  "name": "Sum",
  "version": "1.0.0",
  "description": "Adds multiple input signals",
  "category": "Math",
  "tags": ["math", "addition"],
  "inputPorts": [
    {
      "name": "input1",
      "type": "number",
      "description": "First input",
      "initialValue": 0
    },
    {
      "name": "input2",
      "type": "number",
      "description": "Second input",
      "initialValue": 0
    }
  ],
  "outputPorts": [
    {
      "name": "output",
      "type": "number",
      "description": "Sum of inputs",
      "initialValue": 0
    }
  ],
  "parameters": [],
  "callbackString": "return { output: inputPort.input1 + inputPort.input2 };"
}
```

After adding blocks, restart the Electron app to load them.

## Debugging Commands

### Check Loaded Blocks
**In Electron Main Process Console** (can add to BlockManager.ts temporarily):
```typescript
console.log('Loaded blocks:', Array.from(this.blocks.keys()));
```

### Check IPC Communication
**In Electron Renderer DevTools Console**:
```javascript
// Test IPC directly
const { ipcRenderer } = require('electron');
const blocks = await ipcRenderer.invoke('block-library:get-all');
console.log('Blocks from IPC:', blocks);
```

### Check Redux State
**In Redux DevTools**:
```javascript
// View current state
window.__REDUX_DEVTOOLS_EXTENSION__.getState().currentGraph.libraryBlocks
```

## References

- **Implementation Details**: `claudedocs/IMPLEMENTATION_BLOCK_SERVICE_INTEGRATION.md`
- **Troubleshooting Report**: `claudedocs/TROUBLESHOOTING_BLOCK_LIBRARY.md`
- **Block Schema**: `packages/common/src/BlockSchema/types.ts`
