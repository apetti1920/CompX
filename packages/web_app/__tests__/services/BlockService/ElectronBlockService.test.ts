/**
 * Unit tests for ElectronBlockService
 */

import { ElectronBlockService } from '../../../src/services/BlockService/ElectronBlockService';
import { BlockDefinition } from '@compx/common';
import { LibraryChangeEvent } from '../../../src/services/BlockService/types';

// Mock IPC renderer
const createMockIpcRenderer = () => {
  const listeners = new Map<string, Set<Function>>();

  return {
    invoke: jest.fn(),
    on: jest.fn((channel: string, listener: Function) => {
      if (!listeners.has(channel)) {
        listeners.set(channel, new Set());
      }
      listeners.get(channel)!.add(listener);
    }),
    removeListener: jest.fn((channel: string, listener: Function) => {
      listeners.get(channel)?.delete(listener);
    }),
    // Helper to trigger events
    _emit: (channel: string, ...args: any[]) => {
      listeners.get(channel)?.forEach((listener) => listener({}, ...args));
    },
    _listeners: listeners
  };
};

describe('ElectronBlockService', () => {
  let mockIpc: ReturnType<typeof createMockIpcRenderer>;
  let service: ElectronBlockService;

  beforeEach(() => {
    mockIpc = createMockIpcRenderer();
    service = new ElectronBlockService(mockIpc as any);
  });

  afterEach(() => {
    service.dispose();
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should setup IPC listeners on construction', () => {
      expect(mockIpc.on).toHaveBeenCalledWith('block-library:changed', expect.any(Function));
    });
  });

  describe('getAvailableBlocks', () => {
    it('should call IPC invoke with correct channel', async () => {
      const mockBlocks: BlockDefinition[] = [
        {
          schema_version: '1.0.0',
          name: 'gain',
          version: '1.0.0',
          description: 'Test block',
          category: 'math',
          tags: ['test'],
          inputPorts: [],
          outputPorts: [],
          callbackString: 'return []'
        }
      ];

      mockIpc.invoke.mockResolvedValue(mockBlocks);

      const result = await service.getAvailableBlocks();

      expect(mockIpc.invoke).toHaveBeenCalledWith('block-library:get-all');
      expect(result).toEqual(mockBlocks);
    });

    it('should throw BlockServiceError on IPC failure', async () => {
      mockIpc.invoke.mockRejectedValue(new Error('IPC error'));

      await expect(service.getAvailableBlocks()).rejects.toThrow('Failed to get available blocks');
    });
  });

  describe('getBlock', () => {
    it('should call IPC invoke with block name', async () => {
      const mockBlock: BlockDefinition = {
        schema_version: '1.0.0',
        name: 'gain',
        version: '1.0.0',
        description: 'Gain block',
        category: 'math',
        tags: ['math'],
        inputPorts: [],
        outputPorts: [],
        callbackString: 'return []'
      };

      mockIpc.invoke.mockResolvedValue(mockBlock);

      const result = await service.getBlock('gain');

      expect(mockIpc.invoke).toHaveBeenCalledWith('block-library:get', 'gain');
      expect(result).toEqual(mockBlock);
    });

    it('should return null when block not found', async () => {
      mockIpc.invoke.mockResolvedValue(null);

      const result = await service.getBlock('nonexistent');

      expect(result).toBeNull();
    });

    it('should throw BlockServiceError on IPC failure', async () => {
      mockIpc.invoke.mockRejectedValue(new Error('IPC error'));

      await expect(service.getBlock('gain')).rejects.toThrow("Failed to get block 'gain'");
    });
  });

  describe('searchBlocks', () => {
    it('should call IPC invoke with search query', async () => {
      const query = { category: 'math', tags: ['control'] };
      const mockBlocks: BlockDefinition[] = [];

      mockIpc.invoke.mockResolvedValue(mockBlocks);

      const result = await service.searchBlocks(query);

      expect(mockIpc.invoke).toHaveBeenCalledWith('block-library:search', query);
      expect(result).toEqual(mockBlocks);
    });

    it('should handle empty search results', async () => {
      mockIpc.invoke.mockResolvedValue([]);

      const result = await service.searchBlocks({ name: 'nonexistent' });

      expect(result).toEqual([]);
    });

    it('should throw BlockServiceError on IPC failure', async () => {
      mockIpc.invoke.mockRejectedValue(new Error('IPC error'));

      await expect(service.searchBlocks({})).rejects.toThrow('Failed to search blocks');
    });
  });

  describe('onLibraryChanged', () => {
    it('should register change listener', () => {
      const callback = jest.fn();

      const unsubscribe = service.onLibraryChanged(callback);

      expect(typeof unsubscribe).toBe('function');
    });

    it('should receive IPC library change events', () => {
      const callback = jest.fn();
      service.onLibraryChanged(callback);

      const event: LibraryChangeEvent = {
        type: 'block-added',
        blockName: 'new_block',
        block: {
          schema_version: '1.0.0',
          name: 'new_block',
          version: '1.0.0',
          description: 'New block',
          category: 'test',
          tags: [],
          inputPorts: [],
          outputPorts: [],
          callbackString: 'return []'
        }
      };

      // Simulate IPC event
      mockIpc._emit('block-library:changed', event);

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should support multiple listeners', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      service.onLibraryChanged(callback1);
      service.onLibraryChanged(callback2);

      const event: LibraryChangeEvent = {
        type: 'block-updated',
        blockName: 'gain'
      };

      mockIpc._emit('block-library:changed', event);

      expect(callback1).toHaveBeenCalledWith(event);
      expect(callback2).toHaveBeenCalledWith(event);
    });

    it('should unsubscribe listener when unsubscribe is called', () => {
      const callback = jest.fn();

      const unsubscribe = service.onLibraryChanged(callback);

      const event: LibraryChangeEvent = {
        type: 'block-removed',
        blockName: 'old_block'
      };

      // Event before unsubscribe
      mockIpc._emit('block-library:changed', event);
      expect(callback).toHaveBeenCalledTimes(1);

      // Unsubscribe
      unsubscribe();

      // Event after unsubscribe
      mockIpc._emit('block-library:changed', event);
      expect(callback).toHaveBeenCalledTimes(1); // Still 1, not called again
    });

    it('should handle listener errors gracefully', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const errorCallback = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalCallback = jest.fn();

      service.onLibraryChanged(errorCallback);
      service.onLibraryChanged(normalCallback);

      const event: LibraryChangeEvent = {
        type: 'block-added',
        blockName: 'test'
      };

      mockIpc._emit('block-library:changed', event);

      // Error callback threw, but normal callback should still execute
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('installBlockPack', () => {
    it('should call IPC invoke with pack URL', async () => {
      const packUrl = 'https://example.com/pack.json';
      const mockResult = {
        success: true,
        packName: 'test-pack',
        blocksAdded: ['block1', 'block2']
      };

      mockIpc.invoke.mockResolvedValue(mockResult);

      const result = await service.installBlockPack(packUrl);

      expect(mockIpc.invoke).toHaveBeenCalledWith('block-library:install-pack', packUrl);
      expect(result).toEqual(mockResult);
    });

    it('should throw BlockServiceError on installation failure', async () => {
      mockIpc.invoke.mockRejectedValue(new Error('Installation failed'));

      await expect(service.installBlockPack('invalid-url')).rejects.toThrow('Failed to install block pack');
    });
  });

  describe('uninstallBlockPack', () => {
    it('should call IPC invoke with pack name', async () => {
      const packName = 'test-pack';
      const mockResult = {
        success: true,
        packName: 'test-pack',
        blocksRemoved: ['block1', 'block2']
      };

      mockIpc.invoke.mockResolvedValue(mockResult);

      const result = await service.uninstallBlockPack(packName);

      expect(mockIpc.invoke).toHaveBeenCalledWith('block-library:uninstall-pack', packName);
      expect(result).toEqual(mockResult);
    });

    it('should throw BlockServiceError on uninstallation failure', async () => {
      mockIpc.invoke.mockRejectedValue(new Error('Uninstallation failed'));

      await expect(service.uninstallBlockPack('test-pack')).rejects.toThrow('Failed to uninstall block pack');
    });
  });

  describe('dispose', () => {
    it('should remove IPC listeners', () => {
      service.dispose();

      expect(mockIpc.removeListener).toHaveBeenCalledWith('block-library:changed', expect.any(Function));
    });

    it('should clear all change listeners', () => {
      const callback = jest.fn();
      service.onLibraryChanged(callback);

      service.dispose();

      const event: LibraryChangeEvent = {
        type: 'block-added',
        blockName: 'test'
      };

      mockIpc._emit('block-library:changed', event);

      // Callback should not be called after dispose
      expect(callback).not.toHaveBeenCalled();
    });

    it('should be safe to call multiple times', () => {
      expect(() => {
        service.dispose();
        service.dispose();
        service.dispose();
      }).not.toThrow();
    });
  });
});
