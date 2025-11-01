# BlockService React Integration - Usage Guide

This guide demonstrates how to use the BlockService React hooks and context provider in your components.

## Quick Start

### 1. Setup Provider

Wrap your application with `BlockServiceProvider`:

```tsx
import React from 'react';
import { BlockServiceProvider } from './services/BlockService';

function App() {
  return (
    <BlockServiceProvider>
      <YourComponents />
    </BlockServiceProvider>
  );
}
```

The provider automatically detects the platform (Electron vs Web) and creates the appropriate service instance.

### 2. Use Hooks in Components

#### Accessing All Blocks with `useBlockLibrary`

```tsx
import React from 'react';
import { useBlockLibrary } from './services/BlockService';

function BlockPalette() {
  const { blocks, loading, error, refresh } = useBlockLibrary();

  if (loading) return <div>Loading blocks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h2>Available Blocks ({blocks.length})</h2>
      <button onClick={refresh}>Refresh</button>
      <ul>
        {blocks.map((block) => (
          <li key={block.name}>
            {block.name} - {block.description}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### Accessing a Specific Block with `useBlock`

```tsx
import React from 'react';
import { useBlock } from './services/BlockService';

function BlockEditor({ blockName }: { blockName: string }) {
  const { block, loading, error, refresh } = useBlock(blockName);

  if (loading) return <div>Loading block...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!block) return <div>Block '{blockName}' not found</div>;

  return (
    <div>
      <h2>{block.name}</h2>
      <p>{block.description}</p>
      <p>Category: {block.category}</p>
      <p>Tags: {block.tags.join(', ')}</p>
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}
```

## Advanced Usage

### Hook Options

Both hooks accept an options object to customize behavior:

```tsx
// Disable automatic loading on mount
const { blocks } = useBlockLibrary({ autoRefresh: false });

// Disable caching
const { block } = useBlock('gain', { useCache: false });

// Combine options
const { blocks, refresh } = useBlockLibrary({
  autoRefresh: false,
  useCache: true
});
```

**Options:**

- `autoRefresh` (default: `true`): Automatically load data on mount
- `useCache` (default: `true`): Use local caching for performance

### Real-Time Updates

The hooks automatically subscribe to library change events and update when blocks are added, updated, or removed:

```tsx
function BlockMonitor() {
  const { blocks } = useBlockLibrary();

  return (
    <div>
      <h3>Live Block Count: {blocks.length}</h3>
      {/* Component automatically re-renders when blocks change */}
    </div>
  );
}
```

### Manual Refresh

Both hooks provide a `refresh` function for manual data reloading:

```tsx
function BlockManager() {
  const { blocks, refresh } = useBlockLibrary();

  const handleInstallPack = async (packUrl: string) => {
    // Install block pack...
    await installBlockPack(packUrl);

    // Manually refresh to get new blocks
    await refresh();
  };

  return (
    <div>
      <button onClick={() => refresh()}>Refresh Blocks</button>
      {/* ... */}
    </div>
  );
}
```

### Error Handling

Handle errors gracefully with the error state:

```tsx
function RobustBlockList() {
  const { blocks, loading, error, refresh } = useBlockLibrary();

  if (error) {
    return (
      <div className="error">
        <p>Failed to load blocks: {error}</p>
        <button onClick={refresh}>Retry</button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <ul>
      {blocks.map((block) => (
        <li key={block.name}>{block.name}</li>
      ))}
    </ul>
  );
}
```

### Cache Management

Control caching behavior with utility functions:

```tsx
import { clearBlockCache, clearAllBlockCaches } from './services/BlockService';

function CacheSettings() {
  const handleClearCache = (blockName: string) => {
    clearBlockCache(blockName);
    alert(`Cache cleared for ${blockName}`);
  };

  const handleClearAllCaches = () => {
    clearAllBlockCaches();
    alert('All block caches cleared!');
  };

  return (
    <div>
      <button onClick={() => handleClearCache('gain')}>Clear Gain Block Cache</button>
      <button onClick={handleClearAllCaches}>Clear All Caches</button>
    </div>
  );
}
```

### Custom Service Instance (Testing)

Provide a custom service instance for testing or special configurations:

```tsx
import { BlockServiceProvider } from './services/BlockService';
import { createMockBlockService } from './testUtils';

function TestWrapper({ children }) {
  const mockService = createMockBlockService();

  return <BlockServiceProvider service={mockService}>{children}</BlockServiceProvider>;
}
```

## Performance Optimization

### Local Caching

The hooks implement intelligent caching with a 60-second TTL:

```tsx
// First mount - loads from service
const { blocks } = useBlockLibrary();

// Component unmounts and remounts within 60s
// Second mount - uses cached data, no service call
const { blocks } = useBlockLibrary();
```

**Cache Characteristics:**

- **TTL**: 60 seconds (1 minute)
- **Scope**:
  - `useBlockLibrary`: Module-level cache (shared across all instances)
  - `useBlock`: Per-block Map cache (independent caching per block name)
- **Invalidation**: Automatic on library change events

### Background Refresh

When cached data is available, the hooks display it immediately and refresh in the background:

```tsx
// On remount with valid cache:
// 1. Immediately displays cached data (loading: false)
// 2. Silently refreshes in background (if cache is stale)
// 3. Updates UI when fresh data arrives
const { blocks, loading } = useBlockLibrary();
```

### Selective Loading

Disable automatic loading when you control when data is fetched:

```tsx
function LazyBlockList() {
  const { blocks, loading, refresh } = useBlockLibrary({
    autoRefresh: false
  });

  return (
    <div>
      <button onClick={refresh}>Load Blocks</button>
      {loading && <div>Loading...</div>}
      {blocks.length > 0 && (
        <ul>
          {blocks.map((block) => (
            <li key={block.name}>{block.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## TypeScript Types

### Hook Return Types

```typescript
// useBlockLibrary return type
interface BlockLibraryState {
  blocks: BlockDefinition[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// useBlock return type
interface BlockState {
  block: BlockDefinition | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

### Hook Options

```typescript
interface HookOptions {
  autoRefresh?: boolean; // default: true
  useCache?: boolean; // default: true
}
```

## Common Patterns

### Search and Filter

```tsx
function SearchableBlockList() {
  const { blocks, loading } = useBlockLibrary();
  const [search, setSearch] = React.useState('');

  const filteredBlocks = blocks.filter(
    (block) =>
      block.name.toLowerCase().includes(search.toLowerCase()) ||
      block.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search blocks..." />
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {filteredBlocks.map((block) => (
            <li key={block.name}>{block.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Conditional Block Display

```tsx
function ConditionalBlockEditor() {
  const [selectedBlockName, setSelectedBlockName] = React.useState<string | null>(null);
  const { block, loading, error } = useBlock(selectedBlockName || '', {
    autoRefresh: !!selectedBlockName // only load if block is selected
  });

  return (
    <div>
      <select onChange={(e) => setSelectedBlockName(e.target.value)}>
        <option value="">-- Select Block --</option>
        <option value="gain">Gain</option>
        <option value="sum">Sum</option>
      </select>

      {selectedBlockName && (
        <>
          {loading && <div>Loading...</div>}
          {error && <div>Error: {error}</div>}
          {block && <div>{block.description}</div>}
        </>
      )}
    </div>
  );
}
```

### Block Count Badge

```tsx
function BlockCountBadge() {
  const { blocks, loading } = useBlockLibrary();

  if (loading) return <span>...</span>;

  return <span className="badge">{blocks.length} blocks available</span>;
}
```

## Platform Differences

The service automatically handles platform-specific implementations:

- **Electron**: Uses IPC to communicate with main process for file system access
- **Web**: Uses REST API to fetch blocks from server

Your components don't need to know about these differences - the hooks provide a unified interface.

## Best Practices

1. **Use Provider at App Root**: Place `BlockServiceProvider` at the top of your component tree
2. **Handle Loading States**: Always provide feedback during data loading
3. **Handle Errors Gracefully**: Show user-friendly error messages with retry options
4. **Leverage Caching**: Use default caching for better performance
5. **Clean Up**: The hooks automatically clean up subscriptions on unmount
6. **Type Safety**: Use TypeScript types for better development experience

## Troubleshooting

### "useBlockServiceContext must be used within BlockServiceProvider"

**Problem**: Hook is used outside of provider context

**Solution**: Ensure `BlockServiceProvider` wraps the component using hooks:

```tsx
// ❌ Wrong
function App() {
  return <BlockList />; // No provider
}

// ✅ Correct
function App() {
  return (
    <BlockServiceProvider>
      <BlockList />
    </BlockServiceProvider>
  );
}
```

### Infinite Re-renders

**Problem**: State updates causing infinite loops

**Solution**: Don't include hook return values in dependency arrays:

```tsx
// ❌ Wrong
const { blocks } = useBlockLibrary();
useEffect(() => {
  // Do something
}, [blocks]); // blocks reference changes on every render

// ✅ Correct
const { blocks } = useBlockLibrary();
useEffect(() => {
  // Do something
}, [blocks.length]); // Only depend on length
```

### Stale Cache Data

**Problem**: Cached data not updating

**Solution**: Clear cache or use manual refresh:

```tsx
import { clearBlockCache } from './services/BlockService';

// Clear specific block cache
clearBlockCache('gain');

// Or refresh manually
const { refresh } = useBlock('gain');
await refresh();
```
