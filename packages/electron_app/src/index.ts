// import fs from 'fs';
import path from 'path';
// import util from 'util';

const env = process.env.NODE_ENV || 'development';

// If development environment - only reload on main process changes
// Renderer (web_app) uses webpack dev server hot reload
if (env === 'development') {
  try {
    // Use electron-reload only for main process changes
    const electronReload = require('electron-reload');
    // __dirname in compiled code will be: dist/main/electron_app/src
    // We want to watch: dist/main (where all the compiled JS files are)
    const watchPath = path.join(__dirname, '../..');

    // Use process.execPath as the electron executable (works when running in electron)
    electronReload(watchPath, {
      electron: process.execPath,
      hardResetMethod: 'exit',
      ignore: [
        /node_modules/,
        /\.git/,
        /\.map$/,
        /dist\/renderer/ // Don't reload on renderer changes (handled by webpack HMR)
      ]
    });
    console.log('electron-reload watching main process:', watchPath);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.log('electron-reload error:', error);
  }
}

import { app } from 'electron';

import WindowManager from './window_manager';
import { setupBlockServiceHandlers } from './ipc/blockServiceHandlers';

// import { BrowserWindow, BrowserWindowConstructorOptions, app } from 'electron';
//
// import StartupStep from './startup';
// import DefaultBlockCreation from './startup/defaultblockcreation';
//
// const logFile = fs.createWriteStream('/Users/aidanpetti/Downloads/debug.log', { flags: 'w' });
//
// // const SetupApp = async (onProgress: (pct: number) => void) => {
// //   type StartupOrderType = StartupStep[] | Record<'conn', StartupStep[]>;
// //   const startupOrder: StartupOrderType[] = [];
// //
// //   const StartupParseInt = (steps: StartupOrderType[] = startupOrder) => {
// //     return Promise.all(
// //       steps.map((step) => {
// //         if (Array.isArray(step)) return StartupParseInt(step);
// //         return step.run();
// //       })
// //     );
// //   };
// //
// //   await StartupParseInt();
// // };
//
// const SetupApp = async (onProgress?: (pct: number) => void, onFinished?: () => void) => {
//   function sleep(ms: number) {
//     return new Promise((resolve) => {
//       setTimeout(resolve, ms);
//     });
//   }
//
//   const t = 20;
//   for (let i = 0; i < t; i += 1) {
//     // eslint-disable-next-line no-await-in-loop
//     await sleep(1000);
//     onProgress?.(i / t);
//   }
//
//   onFinished?.();
// };
//
//
//
// app.on('ready', async () => {
//   logFile.write(`${util.format('App Ready')}\n`);
//
//   const loadingWindowPath = path.join(__dirname, '/../renderer/loader/index.html');
//   await CreateWindow(loadingWindowPath, {}, async (win) => {
//     logFile.write(`${util.format('loading ready to show')}\n`);
//     await SetupApp();
//     logFile.write(`${util.format('done setting up')}\n`);
//     await CreateWindow(path.join(__dirname, '/../renderer/app/index.html'), {}, () => {
//       logFile.write(`${util.format('main ready to show')}\n`);
//     });
//
//     win.close();
//   });
// });

const windowManager = WindowManager.GetInstance();

// Set application name for userData path
app.setName('CompX');

app.on('ready', async () => {
  // Initialize block service IPC handlers
  try {
    await setupBlockServiceHandlers();
    console.log('Block service initialized successfully');
  } catch (error) {
    console.error('Failed to initialize block service:', error);
  }

  // const loadingWindowPath = path.join(__dirname, '/../renderer/loader/index.html');
  // windowManager.CreateWindow('loader', { width: 450, height: 300, frame: false });
  // await windowManager.GetWindowByName('loader').loadFile(loadingWindowPath);

  // await SetupApp();

  // In development, load from webpack dev server for hot reloading
  // In production, load from static files
  windowManager.CreateWindow('main', { titleBarStyle: 'hidden', titleBarOverlay: true });
  const mainWindow = windowManager.GetWindowByName('main');

  if (env === 'development') {
    // Load from webpack dev server for hot module reloading
    await mainWindow.loadURL('http://localhost:3000');
    console.log('Loading from webpack dev server: http://localhost:3000');
  } else {
    // Load from static files in production
    // Path calculation: __dirname is dist/main/electron_app/src
    // Need to go up 3 levels to get to dist/, then into renderer/app/
    const mainWindowPath = path.join(__dirname, '../../../renderer/app/index.html');
    await mainWindow.loadFile(mainWindowPath);
  }

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Note: loader window creation is commented out above, so no need to close it
  // windowManager.CloseWindow('loader');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
