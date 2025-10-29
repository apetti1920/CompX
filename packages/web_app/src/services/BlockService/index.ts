/**
 * BlockService Module
 * Platform-agnostic block library service
 */

// Export types
export * from './types';

// Export interface
export * from './interface';

// Export service implementations
export { ElectronBlockService } from './ElectronBlockService';
export { WebBlockService } from './WebBlockService';

// Export factory and utilities
export {
  createBlockService,
  getBlockService,
  resetBlockService,
  hasBlockServiceInstance,
  detectPlatform
} from './factory';

// Export React context and provider
export {
  BlockServiceProvider,
  useBlockServiceContext,
  useBlockServiceReady
} from './context';
export type { BlockServiceProviderProps } from './context';

// Export React hooks
export * from './hooks';
