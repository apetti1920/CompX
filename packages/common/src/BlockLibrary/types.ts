/**
 * Type definitions for Block Library Manager system
 */

import { BlockDefinition } from '../BlockSchema/types';

/**
 * Search query for finding blocks in the registry
 */
export interface BlockSearchQuery {
  /** Partial match on block name (case-insensitive) */
  name?: string;
  /** Filter by category (exact match) */
  category?: string;
  /** Match any of the provided tags */
  tags?: string[];
  /** Filter by specific version pattern */
  version?: string;
}

/**
 * Types of events emitted by the Block Library Manager
 */
export type LibraryEventType =
  | 'block-added'
  | 'block-updated'
  | 'block-removed'
  | 'library-initialized'
  | 'library-error';

/**
 * Event data for library changes
 */
export interface LibraryChangeEvent {
  /** Type of event */
  type: Exclude<LibraryEventType, 'library-error'>;
  /** Name of the affected block */
  blockName: string;
  /** The block definition (present for add/update events) */
  block?: BlockDefinition;
  /** Timestamp of the event */
  timestamp: number;
}

/**
 * Error event data
 */
export interface LibraryErrorEvent {
  /** Type is always 'library-error' */
  type: 'library-error';
  /** Error message */
  message: string;
  /** Block file that caused the error (if applicable) */
  blockFile?: string;
  /** Timestamp of the error */
  timestamp: number;
  /** Additional error context */
  details?: unknown;
}

/**
 * All library events
 */
export type LibraryEvent = LibraryChangeEvent | LibraryErrorEvent;

/**
 * Event listener callback function
 */
export type LibraryEventCallback = (event: LibraryEvent) => void;

/**
 * Statistics about the block library
 */
export interface LibraryStats {
  /** Total number of blocks */
  totalBlocks: number;
  /** Blocks grouped by category */
  byCategory: Record<string, number>;
  /** All unique tags across all blocks */
  allTags: string[];
  /** When the library was last updated */
  lastUpdate: number;
}
