import * as fs from 'fs';
import * as path from 'path';

// import * as DefaultBlocks from '@compx/common/DefaultBlocks';
import { app } from 'electron';

import StartupStep from './index';

export default class DefaultBlockCreation extends StartupStep {
  constructor() {
    super('Creating Blocks');
  }

  // eslint-disable-next-line class-methods-use-this
  async run(): Promise<void> {
    const userDataPath = app.getPath('userData');
    const blockStoragePath = path.join(userDataPath, 'block_storage');

    if (!fs.existsSync(blockStoragePath)) {
      fs.mkdirSync(blockStoragePath, { recursive: true });
    }

    console.log(blockStoragePath);
    // Object.keys(DefaultBlocks).forEach((block) => {
    //   console.log(JSON.stringify(block));
    // });
  }
}
