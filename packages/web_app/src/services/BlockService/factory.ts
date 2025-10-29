/**
 * BlockService Factory
 * Platform detection and service instantiation
 */

import { BlockService } from './interface';
import { ElectronBlockService } from './ElectronBlockService';
import { WebBlockService } from './WebBlockService';
import { Platform, BlockServiceError, BlockServiceErrorCode } from './types';

/**
 * Electron global interface (when running in Electron)
 */
interface ElectronGlobal {
  ipcRenderer: any;
}

/**
 * Extended window interface with optional electron property
 */
declare global {
  interface Window {
    electron?: ElectronGlobal;
  }
}

/**
 * Detect the current platform
 *
 * @returns Platform enum indicating runtime environment
 *
 * @example
 * ```typescript
 * const platform = detectPlatform();
 * if (platform === Platform.Electron) {
 *   console.log('Running in Electron');
 * }
 * ```
 */
export function detectPlatform(): Platform {
  // Check for Electron environment
  if (typeof window !== 'undefined' && window.electron?.ipcRenderer) {
    return Platform.Electron;
  }

  // Check for user agent (alternative detection method)
  if (typeof navigator !== 'undefined' && navigator.userAgent) {
    if (navigator.userAgent.toLowerCase().includes('electron')) {
      return Platform.Electron;
    }
  }

  // Check for process.versions.electron (Node.js environment)
  if (typeof process !== 'undefined' && (process as any).versions?.electron) {
    return Platform.Electron;
  }

  // Default to Web platform
  return Platform.Web;
}

/**
 * Create a BlockService instance appropriate for the current platform
 *
 * Automatically detects whether the app is running in Electron or Web browser
 * and returns the corresponding service implementation.
 *
 * @param apiBaseUrl - Optional base URL for web API (only used in Web platform)
 * @returns Platform-appropriate BlockService instance
 * @throws {BlockServiceError} If platform detection fails or required dependencies are missing
 *
 * @example
 * ```typescript
 * // Automatic platform detection
 * const blockService = createBlockService();
 *
 * // Explicit API URL for web platform
 * const blockService = createBlockService('https://api.compx.example.com');
 * ```
 */
export function createBlockService(apiBaseUrl?: string): BlockService {
  const platform = detectPlatform();

  switch (platform) {
    case Platform.Electron: {
      // Try to get IPC renderer from window.electron (preload script)
      let ipcRenderer = window.electron?.ipcRenderer;

      // Fallback: Try direct require if nodeIntegration is enabled
      if (!ipcRenderer && typeof (window as any).require === 'function') {
        try {
          const { ipcRenderer: electronIpc } = (window as any).require('electron');
          ipcRenderer = electronIpc;
        } catch (error) {
          // Ignore error, will throw below if still not available
        }
      }

      // Verify IPC is available
      if (!ipcRenderer) {
        throw new BlockServiceError(
          'Electron IPC renderer not available. Ensure preload script is configured correctly or nodeIntegration is enabled.',
          BlockServiceErrorCode.IPC_ERROR
        );
      }

      return new ElectronBlockService(ipcRenderer);
    }

    case Platform.Web: {
      return new WebBlockService(apiBaseUrl);
    }

    default: {
      throw new BlockServiceError(
        `Unsupported platform: ${platform}`,
        BlockServiceErrorCode.UNKNOWN_ERROR
      );
    }
  }
}

/**
 * Singleton instance of BlockService
 */
let serviceInstance: BlockService | null = null;

/**
 * Get or create singleton BlockService instance
 *
 * Ensures only one service instance exists per application lifecycle.
 * Useful for maintaining consistent state and event listeners.
 *
 * @param apiBaseUrl - Optional base URL for web API (only used on first call)
 * @returns Singleton BlockService instance
 *
 * @example
 * ```typescript
 * // First call creates instance
 * const service1 = getBlockService();
 *
 * // Subsequent calls return same instance
 * const service2 = getBlockService();
 *
 * console.log(service1 === service2); // true
 * ```
 */
export function getBlockService(apiBaseUrl?: string): BlockService {
  if (!serviceInstance) {
    serviceInstance = createBlockService(apiBaseUrl);
  }
  return serviceInstance;
}

/**
 * Reset the singleton instance (primarily for testing)
 *
 * Disposes the current service instance and clears the singleton.
 * Next call to getBlockService() will create a new instance.
 *
 * @example
 * ```typescript
 * // Clean up before test
 * resetBlockService();
 *
 * // Create new instance for test
 * const service = getBlockService();
 * ```
 */
export function resetBlockService(): void {
  if (serviceInstance) {
    // Dispose if the service has a dispose method
    if ('dispose' in serviceInstance && typeof serviceInstance.dispose === 'function') {
      serviceInstance.dispose();
    }
    serviceInstance = null;
  }
}

/**
 * Check if a BlockService singleton instance exists
 *
 * @returns True if singleton instance has been created
 *
 * @example
 * ```typescript
 * if (hasBlockServiceInstance()) {
 *   const service = getBlockService();
 * } else {
 *   console.log('No service instance yet');
 * }
 * ```
 */
export function hasBlockServiceInstance(): boolean {
  return serviceInstance !== null;
}
