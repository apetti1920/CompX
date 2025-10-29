/**
 * useBlockLibrary Hook
 * React hook for accessing all blocks in the library
 */

import { useState, useEffect, useCallback } from 'react';
import { BlockDefinition } from '@compx/common';
import { useBlockServiceContext } from '../context';
import { LibraryChangeEvent } from '../types';

/**
 * Block library state
 */
export interface BlockLibraryState {
  /** All available blocks */
  blocks: BlockDefinition[];
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh function to reload blocks */
  refresh: () => Promise<void>;
}

/**
 * Local cache for block library
 */
let cachedBlocks: BlockDefinition[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60000; // 1 minute cache TTL

/**
 * Hook for accessing all blocks in the library
 *
 * Provides automatic re-rendering on library updates and local caching
 * for performance optimization.
 *
 * @param options - Hook options
 * @param options.autoRefresh - Whether to automatically refresh on mount (default: true)
 * @param options.useCache - Whether to use local cache (default: true)
 * @returns Block library state with blocks, loading, error, and refresh function
 *
 * @example
 * ```tsx
 * function BlockPalette() {
 *   const { blocks, loading, error, refresh } = useBlockLibrary();
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <div>
 *       <button onClick={refresh}>Refresh</button>
 *       {blocks.map(block => (
 *         <BlockCard key={block.name} block={block} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBlockLibrary(options: {
  autoRefresh?: boolean;
  useCache?: boolean;
} = {}): BlockLibraryState {
  const { autoRefresh = true, useCache = true } = options;
  const service = useBlockServiceContext();

  const [blocks, setBlocks] = useState<BlockDefinition[]>(() => {
    // Initialize with cached blocks if available and fresh
    if (useCache && cachedBlocks && Date.now() - cacheTimestamp < CACHE_TTL) {
      return cachedBlocks;
    }
    return [];
  });
  const [loading, setLoading] = useState<boolean>(() => {
    // If we have cached blocks, don't show loading initially (even with autoRefresh)
    // This provides better UX - show cached data immediately, silently refresh in background
    if (useCache && cachedBlocks && Date.now() - cacheTimestamp < CACHE_TTL) {
      return false;
    }
    // Only show loading if autoRefresh is enabled and no valid cache
    return autoRefresh;
  });
  const [error, setError] = useState<string | null>(null);

  /**
   * Load all blocks from service
   */
  const loadBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allBlocks = await service.getAvailableBlocks();
      setBlocks(allBlocks);

      // Update cache
      if (useCache) {
        cachedBlocks = allBlocks;
        cacheTimestamp = Date.now();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load blocks';
      setError(errorMessage);
      console.error('Error loading blocks:', err);
    } finally {
      setLoading(false);
    }
  }, [service, useCache]);

  /**
   * Handle library change events
   */
  const handleLibraryChange = useCallback(
    (event: LibraryChangeEvent) => {
      setBlocks((prevBlocks) => {
        let updatedBlocks = [...prevBlocks];

        switch (event.type) {
          case 'block-added':
            if (event.block) {
              // Add new block if not already present
              const exists = updatedBlocks.some((b) => b.name === event.blockName);
              if (!exists) {
                updatedBlocks.push(event.block);
              }
            }
            break;

          case 'block-updated':
            if (event.block) {
              // Update existing block
              const index = updatedBlocks.findIndex((b) => b.name === event.blockName);
              if (index !== -1) {
                updatedBlocks[index] = event.block;
              } else {
                // If not found, add it
                updatedBlocks.push(event.block);
              }
            }
            break;

          case 'block-removed':
            // Remove block
            updatedBlocks = updatedBlocks.filter((b) => b.name !== event.blockName);
            break;
        }

        // Update cache
        if (useCache) {
          cachedBlocks = updatedBlocks;
          cacheTimestamp = Date.now();
        }

        return updatedBlocks;
      });
    },
    [useCache]
  );

  /**
   * Subscribe to library changes on mount
   */
  useEffect(() => {
    // Load blocks if auto-refresh is enabled and cache is not fresh
    if (autoRefresh) {
      const isCacheFresh = useCache && cachedBlocks && Date.now() - cacheTimestamp < CACHE_TTL;
      if (!isCacheFresh) {
        loadBlocks();
      }
    }

    // Subscribe to library change events
    const unsubscribe = service.onLibraryChanged(handleLibraryChange);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [service, autoRefresh, handleLibraryChange, loadBlocks, useCache]);

  return {
    blocks,
    loading,
    error,
    refresh: loadBlocks
  };
}

/**
 * Clear the block library cache
 *
 * Useful for forcing a fresh load on next hook usage or
 * when you know the cache is stale.
 *
 * @example
 * ```tsx
 * function Settings() {
 *   const handleClearCache = () => {
 *     clearBlockLibraryCache();
 *     alert('Cache cleared!');
 *   };
 *
 *   return <button onClick={handleClearCache}>Clear Cache</button>;
 * }
 * ```
 */
export function clearBlockLibraryCache(): void {
  cachedBlocks = null;
  cacheTimestamp = 0;
}
