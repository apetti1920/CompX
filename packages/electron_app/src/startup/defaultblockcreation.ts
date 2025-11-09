import * as fs from 'fs';
import * as path from 'path';

import { app } from 'electron';

import StartupStep from './index';

/**
 * Recursively find all JSON files in a directory and its subdirectories
 */
function findJsonFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json') && file !== 'schema.json') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Find the block_definitions source directory
 * Works in both development and production
 */
function findBlockDefinitionsPath(): string | null {
  // __dirname in compiled code: dist/main/electron_app/src
  // Need to go up to project root, then to packages/common/block_definitions

  let currentPath = __dirname;

  // Try going up to find packages/common/block_definitions
  for (let i = 0; i < 10; i++) {
    const testPath = path.join(currentPath, 'packages', 'common', 'block_definitions');
    if (fs.existsSync(testPath)) {
      return testPath;
    }
    currentPath = path.join(currentPath, '..');
  }

  // Also try relative from common package (for development)
  const commonPath = path.join(__dirname, '../../../../common/block_definitions');
  if (fs.existsSync(commonPath)) {
    return commonPath;
  }

  return null;
}

export default class DefaultBlockCreation extends StartupStep {
  constructor() {
    super('Creating Blocks');
  }

  // eslint-disable-next-line class-methods-use-this
  async run(): Promise<void> {
    const userDataPath = app.getPath('userData');
    const blockStoragePath = path.join(userDataPath, 'block_storage');

    // Ensure storage directory exists
    if (!fs.existsSync(blockStoragePath)) {
      fs.mkdirSync(blockStoragePath, { recursive: true });
      console.log(`Created block storage directory: ${blockStoragePath}`);
    }

    // Find source block definitions directory
    const sourceDir = findBlockDefinitionsPath();
    if (!sourceDir) {
      console.warn('Could not find block_definitions source directory. Skipping block copy.');
      return;
    }

    console.log(`Copying blocks from: ${sourceDir}`);
    console.log(`To: ${blockStoragePath}`);

    try {
      // Find all JSON files (excluding schema.json)
      const jsonFiles = findJsonFiles(sourceDir);

      // First, read all existing blocks in storage to check for duplicates by block name
      const existingBlockNames = new Set<string>();
      const existingFiles = fs.readdirSync(blockStoragePath);
      for (const file of existingFiles) {
        if (file.endsWith('.json')) {
          try {
            const filePath = path.join(blockStoragePath, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            const blockData = JSON.parse(content);
            if (blockData.name) {
              existingBlockNames.add(blockData.name);
            }
          } catch (error) {
            // Skip invalid JSON files
            console.warn(`Skipping invalid JSON file in storage: ${file}`);
          }
        }
      }

      let copiedCount = 0;
      let skippedCount = 0;
      let duplicateCount = 0;

      for (const sourceFile of jsonFiles) {
        try {
          // Read the source file to get the block name
          const sourceContent = fs.readFileSync(sourceFile, 'utf-8');
          const sourceBlockData = JSON.parse(sourceContent);

          // Skip if block name already exists from a different file (to avoid duplicates)
          const fileName = path.basename(sourceFile);
          const destFile = path.join(blockStoragePath, fileName);
          const destFileExists = fs.existsSync(destFile);

          // Check if this block name exists in a different file
          if (destFileExists) {
            try {
              const destContent = fs.readFileSync(destFile, 'utf-8');
              const destBlockData = JSON.parse(destContent);
              if (destBlockData.name !== sourceBlockData.name) {
                // Different block name in this file, skip to avoid overwriting
                console.log(`Skipped (different block name in file): ${fileName}`);
                skippedCount++;
                continue;
              }
            } catch (error) {
              // If we can't read the dest file, we'll overwrite it
              console.warn(`Could not read existing file ${fileName}, will overwrite`);
            }
          } else if (existingBlockNames.has(sourceBlockData.name)) {
            // Block name exists but in a different file - skip to avoid duplicates
            console.log(`Skipped (duplicate block name): ${sourceBlockData.name} from ${path.basename(sourceFile)}`);
            duplicateCount++;
            continue;
          }

          // Always overwrite if file exists (to get latest updates from source)
          // This ensures block definitions stay in sync with source code
          fs.copyFileSync(sourceFile, destFile);
          if (!existingBlockNames.has(sourceBlockData.name)) {
            existingBlockNames.add(sourceBlockData.name); // Track newly copied block
          }
          console.log(`${destFileExists ? 'Updated' : 'Copied'}: ${fileName} (${sourceBlockData.name})`);
          copiedCount++;
        } catch (error) {
          console.error(`Failed to process ${sourceFile}:`, error);
        }
      }

      console.log(
        `Block copy complete: ${copiedCount} copied, ${skippedCount} skipped, ${duplicateCount} duplicates skipped`
      );
    } catch (error) {
      console.error('Error copying block definitions:', error);
    }
  }
}
