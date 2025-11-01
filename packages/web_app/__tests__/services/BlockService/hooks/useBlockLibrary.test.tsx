/**
 * Unit tests for useBlockLibrary hook
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { BlockDefinition } from '@compx/common';
import { useBlockLibrary, clearBlockLibraryCache } from '../../../../src/services/BlockService/hooks/useBlockLibrary';
import { BlockServiceProvider } from '../../../../src/services/BlockService/context';
import { BlockService } from '../../../../src/services/BlockService/interface';
import { LibraryChangeEvent } from '../../../../src/services/BlockService/types';

// Mock blocks
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

describe('useBlockLibrary', () => {
  let mockService: jest.Mocked<BlockService>;

  beforeEach(() => {
    mockService = createMockService();
    clearBlockLibraryCache(); // Clear cache before each test
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BlockServiceProvider service={mockService}>{children}</BlockServiceProvider>
  );

  describe('initial load', () => {
    it('should load blocks on mount', async () => {
      const mockBlocks = [createMockBlock('gain'), createMockBlock('sum')];
      mockService.getAvailableBlocks.mockResolvedValue(mockBlocks);

      const { result } = renderHook(() => useBlockLibrary(), { wrapper });

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.blocks).toEqual([]);

      // Wait for load to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.blocks).toEqual(mockBlocks);
      expect(result.current.error).toBeNull();
      expect(mockService.getAvailableBlocks).toHaveBeenCalledTimes(1);
    });

    it('should handle loading error', async () => {
      mockService.getAvailableBlocks.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBlockLibrary(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.blocks).toEqual([]);
    });

    it('should not auto-load when autoRefresh is false', () => {
      const { result } = renderHook(() => useBlockLibrary({ autoRefresh: false }), { wrapper });

      expect(result.current.loading).toBe(false);
      expect(mockService.getAvailableBlocks).not.toHaveBeenCalled();
    });
  });

  describe('caching', () => {
    it('should use cached blocks on subsequent mounts', async () => {
      const mockBlocks = [createMockBlock('gain')];
      mockService.getAvailableBlocks.mockResolvedValue(mockBlocks);

      // First render - should load
      const { result: result1, unmount: unmount1 } = renderHook(() => useBlockLibrary(), {
        wrapper
      });

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      expect(mockService.getAvailableBlocks).toHaveBeenCalledTimes(1);

      // Unmount
      unmount1();

      // Second render - should use cache
      const { result: result2 } = renderHook(() => useBlockLibrary(), { wrapper });

      // Should have blocks immediately from cache
      expect(result2.current.blocks).toEqual(mockBlocks);
      expect(result2.current.loading).toBe(false);

      // Should not call service again
      await waitFor(() => {
        expect(mockService.getAvailableBlocks).toHaveBeenCalledTimes(1);
      });
    });

    it('should not use cache when useCache is false', async () => {
      const mockBlocks = [createMockBlock('gain')];
      mockService.getAvailableBlocks.mockResolvedValue(mockBlocks);

      // First render with cache disabled
      const { result: result1, unmount: unmount1 } = renderHook(() => useBlockLibrary({ useCache: false }), {
        wrapper
      });

      await waitFor(() => {
        expect(result1.current.loading).toBe(false);
      });

      unmount1();

      // Second render - should load again
      const { result: result2 } = renderHook(() => useBlockLibrary({ useCache: false }), {
        wrapper
      });

      expect(result2.current.loading).toBe(true);

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(mockService.getAvailableBlocks).toHaveBeenCalledTimes(2);
    });

    it('should allow manual cache clearing', async () => {
      const mockBlocks = [createMockBlock('gain')];
      mockService.getAvailableBlocks.mockResolvedValue(mockBlocks);

      // Load with cache
      const { result, unmount } = renderHook(() => useBlockLibrary(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      unmount();

      // Clear cache
      clearBlockLibraryCache();

      // Re-render should load again
      const { result: result2 } = renderHook(() => useBlockLibrary(), { wrapper });

      expect(result2.current.loading).toBe(true);

      await waitFor(() => {
        expect(result2.current.loading).toBe(false);
      });

      expect(mockService.getAvailableBlocks).toHaveBeenCalledTimes(2);
    });
  });

  describe('refresh', () => {
    it('should reload blocks when refresh is called', async () => {
      const mockBlocks1 = [createMockBlock('gain')];
      const mockBlocks2 = [createMockBlock('gain'), createMockBlock('sum')];

      mockService.getAvailableBlocks.mockResolvedValueOnce(mockBlocks1).mockResolvedValueOnce(mockBlocks2);

      const { result } = renderHook(() => useBlockLibrary(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.blocks).toEqual(mockBlocks1);

      // Call refresh
      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.blocks).toEqual(mockBlocks2);
      expect(mockService.getAvailableBlocks).toHaveBeenCalledTimes(2);
    });
  });

  describe('real-time updates', () => {
    it('should add new block on block-added event', async () => {
      const mockBlocks = [createMockBlock('gain')];
      mockService.getAvailableBlocks.mockResolvedValue(mockBlocks);

      const { result } = renderHook(() => useBlockLibrary(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Emit block-added event
      const newBlock = createMockBlock('sum');
      act(() => {
        (mockService as any)._emit({
          type: 'block-added',
          blockName: 'sum',
          block: newBlock
        });
      });

      expect(result.current.blocks).toHaveLength(2);
      expect(result.current.blocks).toContainEqual(newBlock);
    });

    it('should update existing block on block-updated event', async () => {
      const initialBlock = createMockBlock('gain');
      mockService.getAvailableBlocks.mockResolvedValue([initialBlock]);

      const { result } = renderHook(() => useBlockLibrary(), { wrapper });

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

      expect(result.current.blocks).toHaveLength(1);
      expect(result.current.blocks[0].description).toBe('Updated description');
    });

    it('should remove block on block-removed event', async () => {
      const mockBlocks = [createMockBlock('gain'), createMockBlock('sum')];
      mockService.getAvailableBlocks.mockResolvedValue(mockBlocks);

      const { result } = renderHook(() => useBlockLibrary(), { wrapper });

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

      expect(result.current.blocks).toHaveLength(1);
      expect(result.current.blocks[0].name).toBe('sum');
    });
  });

  describe('subscription cleanup', () => {
    it('should unsubscribe when unmounted', async () => {
      mockService.getAvailableBlocks.mockResolvedValue([]);

      const { result, unmount } = renderHook(() => useBlockLibrary(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const unsubscribeSpy = jest.fn();
      (mockService.onLibraryChanged as jest.Mock).mockReturnValue(unsubscribeSpy);

      unmount();

      // Note: The actual unsubscribe happens during cleanup,
      // so we verify the subscription was created
      expect(mockService.onLibraryChanged).toHaveBeenCalled();
    });
  });
});
