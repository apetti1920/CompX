/**
 * BlockService Type Definitions
 * Platform-agnostic types for block library service
 */

import { BlockDefinition, ValidationError } from '@compx/common';

/**
 * Platform types supported by CompX
 */
export enum Platform {
  /** Electron desktop application */
  Electron = 'electron',
  /** Web browser application */
  Web = 'web'
}

/**
 * Block search query parameters
 */
export interface BlockSearchQuery {
  /** Partial name match (case-insensitive) */
  name?: string;
  /** Match any of these tags */
  tags?: string[];
  /** Exact category match */
  category?: string;
}

/**
 * Library change event types
 */
export type LibraryChangeEventType = 'block-added' | 'block-updated' | 'block-removed';

/**
 * Library change event payload
 */
export interface LibraryChangeEvent {
  /** Type of change that occurred */
  type: LibraryChangeEventType;
  /** Name of the block that changed */
  blockName: string;
  /** Block definition (present for add/update events) */
  block?: BlockDefinition;
}

/**
 * Library error event payload
 */
export interface LibraryErrorEvent {
  /** File path that caused the error */
  blockFile: string;
  /** Error message */
  error: string;
  /** Validation errors if applicable */
  validationErrors?: ValidationError[];
}

/**
 * Block pack installation result
 */
export interface BlockPackInstallResult {
  /** Whether installation succeeded */
  success: boolean;
  /** Pack name that was installed */
  packName: string;
  /** List of block names that were added */
  blocksAdded: string[];
  /** Error message if installation failed */
  error?: string;
}

/**
 * Block pack uninstallation result
 */
export interface BlockPackUninstallResult {
  /** Whether uninstallation succeeded */
  success: boolean;
  /** Pack name that was uninstalled */
  packName: string;
  /** List of block names that were removed */
  blocksRemoved: string[];
  /** Error message if uninstallation failed */
  error?: string;
}

/**
 * Base error class for BlockService operations
 */
export class BlockServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'BlockServiceError';
    Object.setPrototypeOf(this, BlockServiceError.prototype);
  }
}

/**
 * Error codes for BlockService operations
 */
export enum BlockServiceErrorCode {
  /** Block not found in library */
  BLOCK_NOT_FOUND = 'BLOCK_NOT_FOUND',
  /** Network communication error */
  NETWORK_ERROR = 'NETWORK_ERROR',
  /** IPC communication error (Electron) */
  IPC_ERROR = 'IPC_ERROR',
  /** Block validation failed */
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  /** Block pack installation failed */
  PACK_INSTALL_ERROR = 'PACK_INSTALL_ERROR',
  /** Block pack uninstallation failed */
  PACK_UNINSTALL_ERROR = 'PACK_UNINSTALL_ERROR',
  /** Unknown or unexpected error */
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}
