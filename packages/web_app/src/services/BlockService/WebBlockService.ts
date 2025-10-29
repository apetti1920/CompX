/**
 * WebBlockService
 * HTTP-based block library service for web browser application
 *
 * **Note**: This is currently a stub implementation for future web server support.
 * Full HTTP API integration will be implemented in later phases.
 */

import { BlockDefinition } from '@compx/common';
import { BlockService } from './interface';
import {
  BlockSearchQuery,
  LibraryChangeEvent,
  BlockPackInstallResult,
  BlockPackUninstallResult,
  BlockServiceError,
  BlockServiceErrorCode
} from './types';

/**
 * HTTP API endpoints for block library
 */
const API_ENDPOINTS = {
  GET_ALL: '/api/blocks',
  GET_BLOCK: '/api/blocks/:name',
  SEARCH: '/api/blocks/search',
  STREAM: '/api/blocks/stream',
  INSTALL_PACK: '/api/block-packs/install',
  UNINSTALL_PACK: '/api/block-packs/uninstall'
} as const;

/**
 * WebBlockService implementation
 *
 * Communicates with backend HTTP API to access the block library.
 * Provides real-time updates through Server-Sent Events (SSE).
 *
 * **Current Status**: Stub implementation
 * - Core methods throw "Not implemented" errors
 * - Future implementation will use fetch API and SSE
 *
 * @example
 * ```typescript
 * const service = new WebBlockService('https://api.compx.example.com');
 * // Will throw "Not implemented" until HTTP API is available
 * const blocks = await service.getAvailableBlocks();
 * ```
 */
export class WebBlockService implements BlockService {
  private baseUrl: string;
  private changeListeners: Set<(event: LibraryChangeEvent) => void> = new Set();
  private eventSource: EventSource | null = null;

  /**
   * Create a new WebBlockService
   *
   * @param baseUrl - Base URL of the block library HTTP API
   *
   * @example
   * ```typescript
   * const service = new WebBlockService('https://api.compx.example.com');
   * ```
   */
  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl || this.detectApiBaseUrl();
  }

  /**
   * Detect API base URL from current page location
   * @private
   */
  private detectApiBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const { protocol, hostname, port } = window.location;
      return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
    }
    return '';
  }

  /**
   * Set up Server-Sent Events (SSE) listener for real-time updates
   * @private
   */
  private setupEventStream(): void {
    if (this.eventSource) {
      return; // Already connected
    }

    const streamUrl = `${this.baseUrl}${API_ENDPOINTS.STREAM}`;

    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.addEventListener('block-added', (event) => {
        const data = JSON.parse(event.data) as LibraryChangeEvent;
        this.notifyListeners(data);
      });

      this.eventSource.addEventListener('block-updated', (event) => {
        const data = JSON.parse(event.data) as LibraryChangeEvent;
        this.notifyListeners(data);
      });

      this.eventSource.addEventListener('block-removed', (event) => {
        const data = JSON.parse(event.data) as LibraryChangeEvent;
        this.notifyListeners(data);
      });

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.eventSource?.close();
        this.eventSource = null;
      };
    } catch (error) {
      console.error('Failed to setup SSE stream:', error);
    }
  }

  /**
   * Notify all registered listeners of a library change
   * @private
   */
  private notifyListeners(event: LibraryChangeEvent): void {
    this.changeListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in library change listener:', error);
      }
    });
  }

  /**
   * Clean up SSE connection (call when service is no longer needed)
   */
  public dispose(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.changeListeners.clear();
  }

  /**
   * Get all available blocks from the library
   *
   * **Status**: Stub - throws "Not implemented"
   */
  async getAvailableBlocks(): Promise<BlockDefinition[]> {
    // TODO: Implement HTTP GET request to /api/blocks
    throw new BlockServiceError(
      'WebBlockService not implemented - HTTP API support coming in future phase',
      BlockServiceErrorCode.UNKNOWN_ERROR
    );

    /* Future implementation:
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.GET_ALL}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.blocks as BlockDefinition[];
    } catch (error) {
      throw new BlockServiceError(
        `Failed to get available blocks: ${(error as Error).message}`,
        BlockServiceErrorCode.NETWORK_ERROR,
        error
      );
    }
    */
  }

  /**
   * Get a specific block by name
   *
   * **Status**: Stub - throws "Not implemented"
   */
  async getBlock(name: string): Promise<BlockDefinition | null> {
    // TODO: Implement HTTP GET request to /api/blocks/:name
    throw new BlockServiceError(
      'WebBlockService not implemented - HTTP API support coming in future phase',
      BlockServiceErrorCode.UNKNOWN_ERROR
    );

    /* Future implementation:
    try {
      const endpoint = API_ENDPOINTS.GET_BLOCK.replace(':name', encodeURIComponent(name));
      const response = await fetch(`${this.baseUrl}${endpoint}`);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.block as BlockDefinition;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to get block '${name}': ${(error as Error).message}`,
        BlockServiceErrorCode.NETWORK_ERROR,
        error
      );
    }
    */
  }

  /**
   * Search for blocks matching query criteria
   *
   * **Status**: Stub - throws "Not implemented"
   */
  async searchBlocks(query: BlockSearchQuery): Promise<BlockDefinition[]> {
    // TODO: Implement HTTP GET request to /api/blocks/search with query params
    throw new BlockServiceError(
      'WebBlockService not implemented - HTTP API support coming in future phase',
      BlockServiceErrorCode.UNKNOWN_ERROR
    );

    /* Future implementation:
    try {
      const params = new URLSearchParams();
      if (query.name) params.set('name', query.name);
      if (query.category) params.set('category', query.category);
      if (query.tags) params.set('tags', query.tags.join(','));

      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.SEARCH}?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.blocks as BlockDefinition[];
    } catch (error) {
      throw new BlockServiceError(
        `Failed to search blocks: ${(error as Error).message}`,
        BlockServiceErrorCode.NETWORK_ERROR,
        error
      );
    }
    */
  }

  /**
   * Subscribe to library change events via Server-Sent Events
   *
   * **Status**: Partially implemented (SSE setup, but not functional without HTTP API)
   */
  onLibraryChanged(callback: (event: LibraryChangeEvent) => void): () => void {
    this.changeListeners.add(callback);

    // Setup SSE stream if this is the first listener
    if (this.changeListeners.size === 1) {
      this.setupEventStream();
    }

    // Return unsubscribe function
    return () => {
      this.changeListeners.delete(callback);

      // Close SSE stream if no more listeners
      if (this.changeListeners.size === 0) {
        this.dispose();
      }
    };
  }

  /**
   * Install a block pack
   *
   * **Status**: Stub - throws "Not implemented"
   */
  async installBlockPack(packUrl: string): Promise<BlockPackInstallResult> {
    // TODO: Implement HTTP POST request to /api/block-packs/install
    throw new BlockServiceError(
      'Block pack installation not implemented - coming in future phase',
      BlockServiceErrorCode.PACK_INSTALL_ERROR
    );

    /* Future implementation:
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.INSTALL_PACK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packUrl })
      });

      const data = await response.json();
      return data as BlockPackInstallResult;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to install block pack: ${(error as Error).message}`,
        BlockServiceErrorCode.PACK_INSTALL_ERROR,
        error
      );
    }
    */
  }

  /**
   * Uninstall a block pack
   *
   * **Status**: Stub - throws "Not implemented"
   */
  async uninstallBlockPack(packName: string): Promise<BlockPackUninstallResult> {
    // TODO: Implement HTTP POST request to /api/block-packs/uninstall
    throw new BlockServiceError(
      'Block pack uninstallation not implemented - coming in future phase',
      BlockServiceErrorCode.PACK_UNINSTALL_ERROR
    );

    /* Future implementation:
    try {
      const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.UNINSTALL_PACK}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packName })
      });

      const data = await response.json();
      return data as BlockPackUninstallResult;
    } catch (error) {
      throw new BlockServiceError(
        `Failed to uninstall block pack: ${(error as Error).message}`,
        BlockServiceErrorCode.PACK_UNINSTALL_ERROR,
        error
      );
    }
    */
  }
}
