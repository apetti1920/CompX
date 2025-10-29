/**
 * Unit tests for useBlock hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BlockDefinition } from '@compx/common';
import { useBlock, clearBlockCache, clearAllBlockCaches } from '../../../../src/services/BlockService/hooks/useBlock';
import { BlockServiceProvider } from '../../../../src/services/BlockService/context';
import { BlockService } from '../../../../src/services/BlockService/interface';
import { LibraryChangeEvent } from '../../../../src/services/BlockService/types';

// Mock block
const createMockBlock = (name: string): BlockDefinition => ({
  schema_version: '1.0.0',
  name,
  version: '1.0.0',
  description: `Test block ${name}`,
  category: 'test',
  tags: ['test'],
  inputPorts: [],
  outputPorts: [],
  callbackString: 'return []'
});

// Mock service
const createMockService = (): jest.Mocked<BlockService> => {
  const listeners = new Set<(event: LibraryChangeEvent) => void>();

  return {
    getAvailableBlocks: jest.fn(),
    getBlock: jest.fn(),
    searchBlocks: jest.fn(),
    onLibraryChanged: jest.fn((callback) => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    }),
    installBlockPack: jest.fn(),
    uninstallBlockPack: jest.fn(),
    // Helper to emit events
    _emit: (event: LibraryChangeEvent) => {
      listeners.forEach((listener) => listener(event));
    }
  } as any;
};

describe('useBlock', () => {
  let mockService: jest.Mocked<BlockService>;

  beforeEach(() => {
    mockService = createMockService();
    clearAllBlockCaches(); // Clear cache before each test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BlockServiceProvider service={mockService}>{children}</BlockServiceProvider>
  );

  describe('initial load', () => {
    it('should load block on mount', async () => {
      const mockBlock = createMockBlock('gain');
      mockService.getBlock.mockResolvedValue(mockBlock);

      const { result } = renderHook(() => useBlock('gain'), { wrapper });

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.block).toBeNull();

      // Wait for load to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.block).toEqual(mockBlock);
      expect(result.current.error).toBeNull();
      expect(mockService.getBlock).toHaveBeenCalledWith('gain');
    });

    it('should handle block not found', async () => {
      mockService.getBlock.mockResolvedValue(null);

      const { result } = renderHook(() => useBlock('nonexistent'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.block).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should handle loading error', async () => {
      mockService.getBlock.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBlock('gain'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.block).toBeNull();
    });

    it('should not load when blockName is empty', () => {
      const { result } = renderHook(() => useBlock(''), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(result.current.block).toBeNull();
      expect(mockService.getBlock).not.toHaveBeenCalled();
    });

    it('should not auto-load when autoRefresh is false', () => {
      const { result } = renderHook(() => useBlock('gain', { autoRefresh: false }), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(mockService.getBlock).not.toHaveBeenCalled();
    });
  });

  describe('caching', () => {
    it('should use cached block on subsequent mounts', async () => {
      const mockBlock = createMockBlock('gain');
      mockService.getBlock.mockResolvedValue(mockBlock);

      // First render - should load
      const { result: result1, unmount: unmount1 } = renderHook(() => useBlock('gain'), {
        wrapper
      });

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(mockService.getBlock).toHaveBeenCalledTimes(1);

      // Unmount
      unmount1();

      // Second render - should use cache
      const { result: result2 } = renderHook(() => useBlock('gain'), { wrapper });

      // Should have block immediately from cache
      expect(result2.current.block).toEqual(mockBlock);
      expect(result2.current.loading).toBe(false);

      // Should not call service again
      await waitFor(() => {
        expect(mockService.getBlock).toHaveBeenCalledTimes(1);
      });
    });

    it('should not use cache when useCache is false', async () => {
      const mockBlock = createMockBlock('gain');
      mockService.getBlock.mockResolvedValue(mockBlock);

      // First render with cache disabled
      const { result: result1, unmount: unmount1 } = renderHook(
        () => useBlock('gain', { useCache: false }),
        { wrapper }
      );

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      unmount1();

      // Second render - should load again
      const { result: result2 } = renderHook(() => useBlock('gain', { useCache: false }), {
        wrapper
      });

      expect(result2.current.loading).toBe(true);

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(mockService.getBlock).toHaveBeenCalledTimes(2);
    });

    it('should allow clearing specific block cache', async () => {
      const mockBlock = createMockBlock('gain');
      mockService.getBlock.mockResolvedValue(mockBlock);

      // Load with cache
      const { result, unmount } = renderHook(() => useBlock('gain'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      unmount();

      // Clear cache for this block
      clearBlockCache('gain');

      // Re-render should load again
      const { result: result2 } = renderHook(() => useBlock('gain'), { wrapper });

      expect(result2.current.loading).toBe(true);

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(mockService.getBlock).toHaveBeenCalledTimes(2);
    });

    it('should allow clearing all block caches', async () => {
      const mockBlock1 = createMockBlock('gain');
      const mockBlock2 = createMockBlock('sum');
      mockService.getBlock.mockImplementation(async (name) => {
        return name === 'gain' ? mockBlock1 : mockBlock2;
      });

      // Load two blocks
      const { unmount: unmount1 } = renderHook(() => useBlock('gain'), { wrapper });
      const { unmount: unmount2 } = renderHook(() => useBlock('sum'), { wrapper });

      await waitFor(() => {
        expect(mockService.getBlock).toHaveBeenCalledTimes(2);
      });

      unmount1();
      unmount2();

      // Clear all caches
      clearAllBlockCaches();

      // Re-render should load both again
      renderHook(() => useBlock('gain'), { wrapper });
      renderHook(() => useBlock('sum'), { wrapper });

      await waitFor(() => {
        expect(mockService.getBlock).toHaveBeenCalledTimes(4);
      });
    });
  });

  describe('refresh', () => {
    it('should reload block when refresh is called', async () => {
      const mockBlock1 = createMockBlock('gain');
      const mockBlock2 = { ...mockBlock1, description: 'Updated' };

      mockService.getBlock.mockResolvedValueOnce(mockBlock1).mockResolvedValueOnce(mockBlock2);

      const { result } = renderHook(() => useBlock('gain'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.block?.description).toBe('Test block gain');

      // Call refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.block?.description).toBe('Updated');
      expect(mockService.getBlock).toHaveBeenCalledTimes(2);
    });
  });

  describe('real-time updates', () => {
    it('should update block on block-updated event', async () => {
      const initialBlock = createMockBlock('gain');
      mockService.getBlock.mockResolvedValue(initialBlock);

      const { result } = renderHook(() => useBlock('gain'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Emit block-updated event
      const updatedBlock = { ...initialBlock, description: 'Updated description' };
      act(() => {
        (mockService as any)._emit({
          type: 'block-updated',
          blockName: 'gain',
          block: updatedBlock
        });
      });

      expect(result.current.block?.description).toBe('Updated description');
    });

    it('should ignore updates for different blocks', async () => {
      const initialBlock = createMockBlock('gain');
      mockService.getBlock.mockResolvedValue(initialBlock);

      const { result } = renderHook(() => useBlock('gain'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Emit update for different block
      act(() => {
        (mockService as any)._emit({
          type: 'block-updated',
          blockName: 'sum',
          block: createMockBlock('sum')
        });
      });

      // Block should not change
      expect(result.current.block).toEqual(initialBlock);
    });

    it('should set block to null on block-removed event', async () => {
      const initialBlock = createMockBlock('gain');
      mockService.getBlock.mockResolvedValue(initialBlock);

      const { result } = renderHook(() => useBlock('gain'), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Emit block-removed event
      act(() => {
        (mockService as any)._emit({
          type: 'block-removed',
          blockName: 'gain'
        });
      });

      expect(result.current.block).toBeNull();
    });
  });

  describe('block name changes', () => {
    it('should reload when blockName prop changes', async () => {
      const gainBlock = createMockBlock('gain');
      const sumBlock = createMockBlock('sum');

      mockService.getBlock.mockImplementation(async (name) => {
        return name === 'gain' ? gainBlock : sumBlock;
      });

      const { result, rerender } = renderHook(({ name }) => useBlock(name), {
        wrapper,
        initialProps: { name: 'gain' }
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.block).toEqual(gainBlock);

      // Change block name
      rerender({ name: 'sum' });

      await waitFor(() => {
        expect(result.current.block).toEqual(sumBlock);
      });

      expect(mockService.getBlock).toHaveBeenCalledWith('gain');
      expect(mockService.getBlock).toHaveBeenCalledWith('sum');
    });
  });
});
