/**
 * BlockService Context Provider
 * React context for providing BlockService to components
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BlockService } from './interface';
import { getBlockService } from './factory';

/**
 * Context value type
 */
interface BlockServiceContextValue {
  /** The BlockService instance */
  service: BlockService;
  /** Whether the service is ready */
  ready: boolean;
}

/**
 * BlockService context
 */
const BlockServiceContext = createContext<BlockServiceContextValue | null>(null);

/**
 * BlockServiceProvider props
 */
export interface BlockServiceProviderProps {
  /** Child components */
  children: ReactNode;
  /** Optional custom service instance (for testing) */
  service?: BlockService;
  /** Optional API base URL for web platform */
  apiBaseUrl?: string;
}

/**
 * BlockService Context Provider
 *
 * Provides BlockService instance to React component tree.
 * Automatically detects platform and creates appropriate service.
 *
 * @example
 * ```tsx
 * // Wrap your app with the provider
 * function App() {
 *   return (
 *     <BlockServiceProvider>
 *       <YourComponents />
 *     </BlockServiceProvider>
 *   );
 * }
 * ```
 */
export function BlockServiceProvider({
  children,
  service: customService,
  apiBaseUrl
}: BlockServiceProviderProps): JSX.Element {
  // Initialize service synchronously to avoid render delays in tests
  const [service] = useState<BlockService>(() => {
    return customService || getBlockService(apiBaseUrl);
  });
  const [ready] = useState(true);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      // Don't dispose singleton service (shared across app)
      // Only dispose if custom service was provided
      if (customService && 'dispose' in customService && typeof customService.dispose === 'function') {
        customService.dispose();
      }
    };
  }, [customService]);

  return (
    <BlockServiceContext.Provider value={{ service, ready }}>
      {children}
    </BlockServiceContext.Provider>
  );
}

/**
 * Hook to access BlockService from context
 *
 * @returns BlockService instance
 * @throws Error if used outside BlockServiceProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const service = useBlockServiceContext();
 *   // Use service...
 * }
 * ```
 */
export function useBlockServiceContext(): BlockService {
  const context = useContext(BlockServiceContext);

  if (!context || !context.service) {
    throw new Error('useBlockServiceContext must be used within BlockServiceProvider');
  }

  return context.service;
}

/**
 * Hook to check if BlockService is ready
 *
 * @returns True if service is initialized and ready
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ready = useBlockServiceReady();
 *   if (!ready) return <Loading />;
 *   // Use service...
 * }
 * ```
 */
export function useBlockServiceReady(): boolean {
  const context = useContext(BlockServiceContext);
  return context?.ready ?? false;
}
