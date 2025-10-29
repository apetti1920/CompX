/**
 * useBlock Hook
 * React hook for accessing a specific block by name
 */

import { useState, useEffect, useCallback } from 'react';
import { BlockDefinition } from '@compx/common';
import { useBlockServiceContext } from '../context';
import { LibraryChangeEvent } from '../types';

/**
 * Single block state
 */
export interface BlockState {
  /** The block definition (null if not found) */
  block: BlockDefinition | null;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
  /** Refresh function to reload the block */
  refresh: () => Promise<void>;
}

/**
 * Local cache for individual blocks
 * Map of block name to { block, timestamp }
 */
const blockCache = new Map<string, { block: BlockDefinition | null; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute cache TTL

/**
 * Hook for accessing a specific block by name
 *
 * Provides automatic re-rendering when the specific block changes and
 * local caching for performance optimization.
 *
 * @param blockName - Name of the block to retrieve
 * @param options - Hook options
 * @param options.autoRefresh - Whether to automatically refresh on mount (default: true)
 * @param options.useCache - Whether to use local cache (default: true)
 * @returns Block state with block, loading, error, and refresh function
 *
 * @example
 * ```tsx
 * function BlockEditor({ blockName }: { blockName: string }) {
 *   const { block, loading, error, refresh } = useBlock(blockName);
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *   if (!block) return <NotFound blockName={blockName} />;
 *
 *   return (
 *     <div>
 *       <h2>{block.name}</h2>
 *       <p>{block.description}</p>
 *       <button onClick={refresh}>Refresh</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useBlock(
  blockName: string,
  options: {
    autoRefresh?: boolean;
    useCache?: boolean;
  } = {}
): BlockState {
  const { autoRefresh = true, useCache = true } = options;
  const service = useBlockServiceContext();

  const [block, setBlock] = useState<BlockDefinition | null>(() => {
    // Initialize with cached block if available and fresh
    if (useCache) {
      const cached = blockCache.get(blockName);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.block;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    // If we have cached block, don't show loading initially (even with autoRefresh)
    // This provides better UX - show cached data immediately, silently refresh in background
    if (useCache) {
      const cached = blockCache.get(blockName);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return false;
      }
    }
    // Only show loading if autoRefresh is enabled and no valid cache
    return autoRefresh;
  });
  const [error, setError] = useState<string | null>(null);

  /**
   * Load the block from service
   */
  const loadBlock = useCallback(async () => {
    if (!blockName) {
      setBlock(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fetchedBlock = await service.getBlock(blockName);
      setBlock(fetchedBlock);

      // Update cache
      if (useCache) {
        blockCache.set(blockName, {
          block: fetchedBlock,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to load block '${blockName}'`;
      setError(errorMessage);
      console.error(`Error loading block '${blockName}':`, err);
    } finally {
      setLoading(false);
    }
  }, [service, blockName, useCache]);

  /**
   * Handle library change events
   */
  const handleLibraryChange = useCallback(
    (event: LibraryChangeEvent) => {
      // Only update if this event is for our block
      if (event.blockName !== blockName) {
        return;
      }

      switch (event.type) {
        case 'block-added':
        case 'block-updated':
          if (event.block) {
            setBlock(event.block);

            // Update cache
            if (useCache) {
              blockCache.set(blockName, {
                block: event.block,
                timestamp: Date.now()
              });
            }
          }
          break;

        case 'block-removed':
          setBlock(null);

          // Remove from cache
          if (useCache) {
            blockCache.delete(blockName);
          }
          break;
      }
    },
    [blockName, useCache]
  );

  /**
   * Load block and subscribe to changes on mount or when blockName changes
   */
  useEffect(() => {
    // Load block if auto-refresh is enabled and cache is not fresh
    if (autoRefresh) {
      const cached = blockCache.get(blockName);
      const isCacheFresh = useCache && cached && Date.now() - cached.timestamp < CACHE_TTL;
      if (!isCacheFresh) {
        loadBlock();
      }
    }

    // Subscribe to library change events
    const unsubscribe = service.onLibraryChanged(handleLibraryChange);

    // Cleanup
    return () => {
      unsubscribe();
    };
  }, [service, blockName, autoRefresh, handleLibraryChange, loadBlock, useCache]);

  return {
    block,
    loading,
    error,
    refresh: loadBlock
  };
}

/**
 * Clear the cache for a specific block
 *
 * @param blockName - Name of the block to clear from cache
 *
 * @example
 * ```tsx
 * function BlockSettings({ blockName }: { blockName: string }) {
 *   const handleClearCache = () => {
 *     clearBlockCache(blockName);
 *     alert('Cache cleared for ' + blockName);
 *   };
 *
 *   return <button onClick={handleClearCache}>Clear Cache</button>;
 * }
 * ```
 */
export function clearBlockCache(blockName: string): void {
  blockCache.delete(blockName);
}

/**
 * Clear all block caches
 *
 * @example
 * ```tsx
 * function Settings() {
 *   const handleClearAllCaches = () => {
 *     clearAllBlockCaches();
 *     alert('All block caches cleared!');
 *   };
 *
 *   return <button onClick={handleClearAllCaches}>Clear All Caches</button>;
 * }
 * ```
 */
export function clearAllBlockCaches(): void {
  blockCache.clear();
}
