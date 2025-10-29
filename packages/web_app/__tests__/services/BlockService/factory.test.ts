/**
 * Unit tests for BlockService factory and platform detection
 */

import {
  createBlockService,
  getBlockService,
  resetBlockService,
  hasBlockServiceInstance,
  detectPlatform,
  Platform,
  ElectronBlockService,
  WebBlockService
} from '../../../src/services/BlockService';

describe('BlockService Factory', () => {
  beforeEach(() => {
    // Reset singleton before each test
    resetBlockService();
  });

  afterEach(() => {
    // Clean up after each test
    resetBlockService();
  });

  describe('detectPlatform', () => {
    it('should detect Electron platform when window.electron exists', () => {
      // Mock Electron environment
      Object.defineProperty(global, 'window', {
        writable: true,
        value: {
          electron: {
            ipcRenderer: {}
          }
        }
      });

      const platform = detectPlatform();
      expect(platform).toBe(Platform.Electron);

      // Cleanup
      delete (global as any).window;
    });

    it('should detect Web platform when window.electron does not exist', () => {
      // Mock Web environment
      (global as any).window = {
        location: {
          protocol: 'https:',
          hostname: 'example.com',
          port: ''
        }
      };
      (global as any).navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      };

      const platform = detectPlatform();
      expect(platform).toBe(Platform.Web);

      // Cleanup
      delete (global as any).window;
      delete (global as any).navigator;
    });

    it('should detect Electron via user agent', () => {
      (global as any).window = {};
      (global as any).navigator = {
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Electron/25.0.0'
      };

      const platform = detectPlatform();
      expect(platform).toBe(Platform.Electron);

      // Cleanup
      delete (global as any).window;
      delete (global as any).navigator;
    });
  });

  describe('createBlockService', () => {
    it('should create ElectronBlockService when in Electron environment', () => {
      // Mock Electron environment
      (global as any).window = {
        electron: {
          ipcRenderer: {
            invoke: jest.fn(),
            on: jest.fn(),
            removeListener: jest.fn()
          }
        }
      };

      const service = createBlockService();
      expect(service).toBeInstanceOf(ElectronBlockService);

      // Cleanup
      delete (global as any).window;
    });

    it('should create WebBlockService when in Web environment', () => {
      // Mock Web environment
      (global as any).window = {
        location: {
          protocol: 'https:',
          hostname: 'example.com',
          port: ''
        }
      };

      const service = createBlockService();
      expect(service).toBeInstanceOf(WebBlockService);

      // Cleanup
      delete (global as any).window;
    });

    it('should throw error if Electron IPC not available in Electron environment', () => {
      // Mock incomplete Electron environment
      (global as any).window = {};
      (global as any).navigator = {
        userAgent: 'Electron/25.0.0'
      };

      // Should detect Electron but fail to create service
      expect(() => createBlockService()).toThrow();

      // Cleanup
      delete (global as any).window;
      delete (global as any).navigator;
    });

    it('should pass API base URL to WebBlockService', () => {
      // Mock Web environment
      (global as any).window = {
        location: {
          protocol: 'https:',
          hostname: 'example.com',
          port: ''
        }
      };

      const service = createBlockService('https://api.example.com');
      expect(service).toBeInstanceOf(WebBlockService);

      // Cleanup
      delete (global as any).window;
    });
  });

  describe('getBlockService', () => {
    it('should return singleton instance', () => {
      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      const service1 = getBlockService();
      const service2 = getBlockService();

      expect(service1).toBe(service2);

      // Cleanup
      delete (global as any).window;
    });

    it('should create instance on first call', () => {
      expect(hasBlockServiceInstance()).toBe(false);

      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      getBlockService();

      expect(hasBlockServiceInstance()).toBe(true);

      // Cleanup
      delete (global as any).window;
    });

    it('should reuse instance on subsequent calls', () => {
      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      const service1 = getBlockService();
      const service2 = getBlockService();
      const service3 = getBlockService();

      expect(service1).toBe(service2);
      expect(service2).toBe(service3);

      // Cleanup
      delete (global as any).window;
    });
  });

  describe('resetBlockService', () => {
    it('should clear singleton instance', () => {
      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      getBlockService();
      expect(hasBlockServiceInstance()).toBe(true);

      resetBlockService();
      expect(hasBlockServiceInstance()).toBe(false);

      // Cleanup
      delete (global as any).window;
    });

    it('should allow creating new instance after reset', () => {
      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      const service1 = getBlockService();
      resetBlockService();
      const service2 = getBlockService();

      expect(service1).not.toBe(service2);

      // Cleanup
      delete (global as any).window;
    });

    it('should call dispose on service if available', () => {
      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      const service = getBlockService();
      const disposeSpy = jest.spyOn(service as any, 'dispose');

      resetBlockService();

      expect(disposeSpy).toHaveBeenCalled();

      // Cleanup
      delete (global as any).window;
    });
  });

  describe('hasBlockServiceInstance', () => {
    it('should return false when no instance exists', () => {
      expect(hasBlockServiceInstance()).toBe(false);
    });

    it('should return true when instance exists', () => {
      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      getBlockService();

      expect(hasBlockServiceInstance()).toBe(true);

      // Cleanup
      delete (global as any).window;
    });

    it('should return false after reset', () => {
      // Mock Web environment
      (global as any).window = {
        location: { protocol: 'https:', hostname: 'example.com', port: '' }
      };

      getBlockService();
      resetBlockService();

      expect(hasBlockServiceInstance()).toBe(false);

      // Cleanup
      delete (global as any).window;
    });
  });
});
