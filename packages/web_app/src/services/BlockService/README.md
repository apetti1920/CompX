# BlockService - React Integration

Platform-agnostic block library service with React hooks for seamless component integration.

## Overview

The BlockService provides a unified interface for accessing the block library across different platforms (Electron and Web). It includes:

- **Platform Abstraction**: Automatic platform detection and service selection
- **React Context**: Provider pattern for dependency injection
- **React Hooks**: `useBlockLibrary` and `useBlock` for component integration
- **Real-Time Updates**: Automatic re-rendering on library changes
- **Performance Optimization**: Local caching with TTL for efficient data access

## Quick Start

```tsx
import React from 'react';
import { BlockServiceProvider, useBlockLibrary } from './services/BlockService';

// 1. Wrap app with provider
function App() {
  return (
    <BlockServiceProvider>
      <BlockPalette />
    </BlockServiceProvider>
  );
}

// 2. Use hooks in components
function BlockPalette() {
  const { blocks, loading, error } = useBlockLibrary();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {blocks.map((block) => (
        <li key={block.name}>{block.name}</li>
      ))}
    </ul>
  );
}
```

## Architecture

```
┌─────────────────────────────────────────────────┐
│           React Components (UI)                 │
│  ┌──────────────┐        ┌──────────────┐      │
│  │useBlockLibrary│        │   useBlock   │      │
│  └──────────────┘        └──────────────┘      │
└─────────────────┬───────────────┬───────────────┘
                  │               │
                  └───────┬───────┘
                          │
            ┌─────────────▼──────────────┐
            │ BlockServiceProvider        │
            │ (React Context)             │
            └─────────────┬───────────────┘
                          │
            ┌─────────────▼──────────────┐
            │   getBlockService()        │
            │   (Factory Pattern)         │
            └─────────────┬───────────────┘
                          │
              ┌───────────┴────────────┐
              │                        │
    ┌─────────▼──────────┐   ┌────────▼────────────┐
    │ElectronBlockService│   │  WebBlockService    │
    │  (IPC to main)     │   │  (REST API)         │
    └────────────────────┘   └─────────────────────┘
```

## Components

### 1. Platform Services

**ElectronBlockService** (`services/electron/ElectronBlockService.ts`)

- Uses Electron IPC for main process communication
- File system-based block storage
- Desktop-specific block pack installation

**WebBlockService** (`services/web/WebBlockService.ts`)

- REST API client for web server
- HTTP-based block library access
- Web-optimized caching strategy

### 2. Service Factory

**getBlockService()** (`factory.ts`)

- Automatic platform detection
- Singleton pattern for service instances
- Configuration support (API base URL)

### 3. React Context

**BlockServiceProvider** (`context.tsx`)

- Provides service instance to component tree
- Synchronous initialization for test compatibility
- Custom service injection for testing

### 4. React Hooks

**useBlockLibrary()** (`hooks/useBlockLibrary.ts`)

- Access all available blocks
- Module-level caching with 60s TTL
- Real-time library change events
- Returns: `{ blocks, loading, error, refresh }`

**useBlock(blockName)** (`hooks/useBlock.ts`)

- Access specific block by name
- Per-block Map cache with 60s TTL
- Event-filtered updates (only for matching block)
- Returns: `{ block, loading, error, refresh }`

## API Reference

### BlockServiceProvider

```tsx
interface BlockServiceProviderProps {
  children: ReactNode;
  service?: BlockService; // Optional custom service (for testing)
  apiBaseUrl?: string; // Optional API URL for WebBlockService
}

<BlockServiceProvider apiBaseUrl="https://api.example.com">{children}</BlockServiceProvider>;
```

### useBlockLibrary Hook

```tsx
function useBlockLibrary(options?: {
  autoRefresh?: boolean; // default: true
  useCache?: boolean; // default: true
}): BlockLibraryState;

interface BlockLibraryState {
  blocks: BlockDefinition[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

**Example:**

```tsx
const { blocks, loading, error, refresh } = useBlockLibrary();
```

### useBlock Hook

```tsx
function useBlock(
  blockName: string,
  options?: {
    autoRefresh?: boolean; // default: true
    useCache?: boolean; // default: true
  }
): BlockState;

interface BlockState {
  block: BlockDefinition | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
```

**Example:**

```tsx
const { block, loading, error, refresh } = useBlock('gain');
```

### Cache Management Functions

```tsx
// Clear cache for specific block
clearBlockCache(blockName: string): void

// Clear all block caches
clearAllBlockCaches(): void

// Clear block library cache
clearBlockLibraryCache(): void
```

**Example:**

```tsx
import { clearBlockCache, clearAllBlockCaches } from './services/BlockService';

// Clear specific block
clearBlockCache('gain');

// Clear all caches
clearAllBlockCaches();
```

### Context Hooks

```tsx
// Get service instance directly
const service = useBlockServiceContext();

// Check if service is ready
const ready = useBlockServiceReady();
```

## Features

### Real-Time Updates

Both hooks automatically subscribe to library change events:

```typescript
type LibraryChangeEvent =
  | { type: 'block-added'; blockName: string; block: BlockDefinition }
  | { type: 'block-updated'; blockName: string; block: BlockDefinition }
  | { type: 'block-removed'; blockName: string };
```

When the library changes, components using the hooks automatically re-render with updated data.

### Intelligent Caching

**Cache Strategy:**

- **TTL**: 60 seconds (1 minute)
- **Cache Location**: Module-level (shared across component instances)
- **Cache Invalidation**: Automatic on library change events
- **Background Refresh**: Displays cached data immediately, refreshes if stale

**Benefits:**

- Reduces unnecessary service calls
- Improves UI responsiveness
- Supports offline-first scenarios
- Configurable via `useCache` option

### Loading States

The hooks provide granular loading state management:

```tsx
const { loading } = useBlockLibrary();

// loading: true  → Initial load (no cache)
// loading: false → Cached data available or load complete
```

**Smart Loading Logic:**

- Shows `loading: true` only when cache is absent or stale
- Shows cached data immediately even during background refresh
- Provides optimal UX with instant feedback

### Error Handling

Comprehensive error state management:

```tsx
const { error } = useBlockLibrary();

if (error) {
  return <div>Error: {error}</div>;
}
```

**Error Scenarios:**

- Network failures
- Service unavailable
- Invalid block data
- IPC communication errors (Electron)

## Usage Examples

See [USAGE.md](./USAGE.md) for comprehensive examples including:

- Basic usage patterns
- Advanced hook options
- Error handling strategies
- Performance optimization techniques
- Cache management
- Testing patterns
- TypeScript types
- Common component patterns

## Testing

### Unit Tests

Comprehensive test coverage for all hooks and components:

```bash
npm test -- packages/web_app/__tests__/services/BlockService/hooks
```

**Test Coverage:**

- Initial data loading
- Caching behavior
- Real-time update events
- Error scenarios
- Subscription cleanup
- Manual refresh
- Hook option variations

### Mock Service for Testing

```tsx
import { BlockServiceProvider } from './services/BlockService';

function TestWrapper({ children }) {
  const mockService = {
    getAvailableBlocks: jest.fn(),
    getBlock: jest.fn(),
    onLibraryChanged: jest.fn()
    // ... other methods
  };

  return <BlockServiceProvider service={mockService}>{children}</BlockServiceProvider>;
}
```

## Performance Considerations

### Optimization Strategies

1. **Caching**: Module-level cache reduces service calls
2. **Event Filtering**: `useBlock` only updates for matching block events
3. **Lazy Loading**: Disable `autoRefresh` for on-demand loading
4. **Background Refresh**: Shows cached data instantly, updates silently

### Memory Management

- Caches use weak references where possible
- Automatic cleanup on component unmount
- Configurable cache TTL
- Manual cache clearing utilities

## Migration Guide

### From Direct Service Usage

**Before:**

```tsx
function BlockList() {
  const [blocks, setBlocks] = useState([]);

  useEffect(() => {
    const service = getBlockService();
    service.getAvailableBlocks().then(setBlocks);
  }, []);

  return (
    <ul>
      {blocks.map((b) => (
        <li>{b.name}</li>
      ))}
    </ul>
  );
}
```

**After:**

```tsx
function BlockList() {
  const { blocks, loading } = useBlockLibrary();

  if (loading) return <div>Loading...</div>;

  return (
    <ul>
      {blocks.map((b) => (
        <li>{b.name}</li>
      ))}
    </ul>
  );
}
```

**Benefits:**

- Automatic re-rendering on updates
- Built-in loading/error states
- Caching included
- Less boilerplate code

## Platform-Specific Notes

### Electron Platform

- Requires main process IPC handlers
- File system access for block storage
- Block pack installation via electron-builder
- Desktop-specific block pack formats

### Web Platform

- Requires backend API server
- REST API endpoints for block access
- Web-based block pack installation
- CORS configuration required

## Troubleshooting

### Common Issues

**1. "useBlockServiceContext must be used within BlockServiceProvider"**

Ensure provider wraps components using hooks:

```tsx
<BlockServiceProvider>
  <YourComponents />
</BlockServiceProvider>
```

**2. Stale cached data**

Clear cache or use manual refresh:

```tsx
const { refresh } = useBlockLibrary();
await refresh();
```

**3. Infinite re-renders**

Don't include hook return values in useEffect dependencies:

```tsx
const { blocks } = useBlockLibrary();
useEffect(() => {
  // Process blocks
}, [blocks.length]); // Use length, not blocks array
```

## Future Enhancements

Potential improvements for future development:

- [ ] Configurable cache TTL via provider props
- [ ] Offline mode with IndexedDB persistence
- [ ] Optimistic updates for block modifications
- [ ] WebSocket support for real-time updates (Web platform)
- [ ] Block search and filtering hooks
- [ ] Block category and tag filtering
- [ ] Prefetching strategies for improved performance
- [ ] Service worker integration for offline support

## License

Part of the CompX project. See root LICENSE file for details.
