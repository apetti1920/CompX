// import fs from 'fs';
import path from 'path';
// import util from 'util';

import { app } from 'electron';

import WindowManager from './window_manager';

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

app.on('ready', async () => {
  // const loadingWindowPath = path.join(__dirname, '/../renderer/loader/index.html');
  // windowManager.CreateWindow('loader', { width: 450, height: 300, frame: false });
  // await windowManager.GetWindowByName('loader').loadFile(loadingWindowPath);

  // await SetupApp();

  const mainWindowPath = path.join(__dirname, '/../renderer/app/index.html');
  windowManager.CreateWindow('main', { titleBarStyle: 'hidden', titleBarOverlay: true });
  const mainWindow = windowManager.GetWindowByName('main');
  await mainWindow.loadFile(mainWindowPath);

  // Open DevTools for debugging
  mainWindow.webContents.openDevTools();

  windowManager.CloseWindow('loader');
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
