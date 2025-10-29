/**
 * Block Definition Schema Migrator
 * Handles automatic migration between schema versions
 */

import { BlockDefinition, CURRENT_SCHEMA_VERSION, BLOCK_DEFAULTS } from './types';

/**
 * Migration result containing migrated block and any warnings
 */
export interface MigrationResult {
  /** The migrated block definition */
  block: BlockDefinition;
  /** Whether migration was performed */
  migrated: boolean;
  /** Migration warnings (non-blocking) */
  warnings: string[];
  /** Original schema version */
  originalVersion: string;
  /** Target schema version */
  targetVersion: string;
}

/**
 * Schema version comparison result
 */
interface VersionComparison {
  /** Major version difference */
  majorDiff: number;
  /** Minor version difference */
  minorDiff: number;
  /** Patch version difference */
  patchDiff: number;
  /** Is the version compatible? */
  compatible: boolean;
}

/**
 * Block Schema Migrator
 * Automatically migrates block definitions between schema versions
 */
export class BlockSchemaMigrator {
  /**
   * Attempt to migrate a block definition to the current schema version
   * @param block - Block definition (potentially old version)
   * @returns Migration result
   */
  migrate(block: BlockDefinition): MigrationResult {
    const warnings: string[] = [];
    const originalVersion = block.schema_version;
    const targetVersion = CURRENT_SCHEMA_VERSION;

    // If already current version, no migration needed
    if (originalVersion === targetVersion) {
      return {
        block,
        migrated: false,
        warnings: [],
        originalVersion,
        targetVersion
      };
    }

    // Compare versions
    const comparison = this.compareVersions(originalVersion, targetVersion);

    // Cannot migrate if major version differs (breaking changes)
    if (!comparison.compatible) {
      warnings.push(
        `Cannot automatically migrate from schema version ${originalVersion} to ${targetVersion}. ` +
          `Major version differences require manual migration.`
      );
      return {
        block,
        migrated: false,
        warnings,
        originalVersion,
        targetVersion
      };
    }

    // Perform migration
    let migratedBlock = { ...block };
    let migrationPerformed = false;

    // Apply version-specific migrations (always apply defaults, even for same version)
    const migrationResult = this.applyMigrations(migratedBlock, originalVersion, targetVersion);
    migratedBlock = migrationResult.block;

    if (migrationResult.warnings.length > 0) {
      warnings.push(...migrationResult.warnings);
      migrationPerformed = true;
    }

    // Only update schema version if it changed
    if (comparison.minorDiff > 0 || comparison.patchDiff > 0) {
      migratedBlock.schema_version = targetVersion;
      migrationPerformed = true;
    }

    return {
      block: migratedBlock,
      migrated: migrationPerformed,
      warnings,
      originalVersion,
      targetVersion
    };
  }

  /**
   * Compare two semantic versions
   * @param from - Source version
   * @param to - Target version
   * @returns Version comparison result
   */
  private compareVersions(from: string, to: string): VersionComparison {
    const fromParts = this.parseVersion(from);
    const toParts = this.parseVersion(to);

    const majorDiff = toParts.major - fromParts.major;
    const minorDiff = toParts.minor - fromParts.minor;
    const patchDiff = toParts.patch - fromParts.patch;

    // Compatible if same major version and moving forward
    const compatible = majorDiff === 0 && (minorDiff > 0 || (minorDiff === 0 && patchDiff >= 0));

    return {
      majorDiff,
      minorDiff,
      patchDiff,
      compatible
    };
  }

  /**
   * Parse semantic version string
   */
  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
    if (!match) {
      throw new Error(`Invalid version format: ${version}`);
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10)
    };
  }

  /**
   * Apply version-specific migrations
   */
  private applyMigrations(
    block: BlockDefinition,
    from: string,
    to: string
  ): { block: BlockDefinition; warnings: string[] } {
    const warnings: string[] = [];
    let migratedBlock = { ...block };

    // Apply default values for optional fields if missing
    if (!migratedBlock.description) {
      migratedBlock.description = BLOCK_DEFAULTS.description;
      warnings.push('Added default description');
    }

    if (!migratedBlock.category) {
      migratedBlock.category = BLOCK_DEFAULTS.category;
      warnings.push('Added default category');
    }

    if (!migratedBlock.tags) {
      migratedBlock.tags = [...BLOCK_DEFAULTS.tags]; // Create mutable copy
      warnings.push('Added default tags array');
    }

    if (!migratedBlock.visual) {
      migratedBlock.visual = { ...BLOCK_DEFAULTS.visual }; // Create mutable copy
      warnings.push('Added default visual properties');
    }

    // Check for deprecated fields (examples for future use)
    // This is where we'd handle field renames, removals, etc.
    const blockAny = block as any;

    if (blockAny.deprecated_field !== undefined) {
      warnings.push('Deprecated field "deprecated_field" found and removed');
      delete (migratedBlock as any).deprecated_field;
    }

    return { block: migratedBlock, warnings };
  }

  /**
   * Check if a block can be migrated from its version to the current version
   * @param schemaVersion - Schema version to check
   * @returns True if migration is possible
   */
  canMigrate(schemaVersion: string): boolean {
    try {
      const comparison = this.compareVersions(schemaVersion, CURRENT_SCHEMA_VERSION);
      return comparison.compatible;
    } catch {
      return false;
    }
  }

  /**
   * Get migration path description
   * @param from - Source version
   * @param to - Target version
   * @returns Human-readable migration description
   */
  getMigrationPath(from: string, to: string): string {
    if (from === to) {
      return 'No migration needed (versions match)';
    }

    const comparison = this.compareVersions(from, to);

    if (!comparison.compatible) {
      return `Cannot migrate automatically (major version difference: ${comparison.majorDiff})`;
    }

    if (comparison.minorDiff > 0) {
      return `Minor version upgrade: ${from} → ${to} (automatic migration available)`;
    }

    if (comparison.patchDiff > 0) {
      return `Patch version upgrade: ${from} → ${to} (automatic migration available)`;
    }

    return `Downgrade not recommended: ${from} → ${to}`;
  }
}

/**
 * Default migrator instance (singleton)
 */
let defaultMigrator: BlockSchemaMigrator | null = null;

/**
 * Get the default migrator instance
 */
export function getMigrator(): BlockSchemaMigrator {
  if (!defaultMigrator) {
    defaultMigrator = new BlockSchemaMigrator();
  }
  return defaultMigrator;
}

/**
 * Convenience function to migrate a block definition
 */
export function migrateBlock(block: BlockDefinition): MigrationResult {
  return getMigrator().migrate(block);
}

/**
 * Convenience function to check if a version can be migrated
 */
export function canMigrateVersion(schemaVersion: string): boolean {
  return getMigrator().canMigrate(schemaVersion);
}
