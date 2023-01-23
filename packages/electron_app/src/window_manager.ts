import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import logger from 'loglevel';

export default class WindowManager {
  private static instance: WindowManager;
  private readonly windows: Record<string, BrowserWindow>;

  private constructor() {
    this.windows = {};
  }

  public static GetInstance() {
    if (!this.instance) this.instance = new this();
    return this.instance;
  }

  public CreateWindow(windowName: string, windowArgs?: BrowserWindowConstructorOptions): BrowserWindow {
    const win = new BrowserWindow({
      ...windowArgs,
      width: windowArgs?.width ?? 900,
      height: windowArgs?.height ?? 600,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    if (windowName in this.windows) throw new Error(`Window ${windowName} already created.`);
    this.windows[windowName] = win;
    return this.windows[windowName];
  }

  public GetWindowByName(windowName: string): BrowserWindow {
    if (!(windowName in this.windows)) throw new Error(`Window ${windowName} is not defined`);

    return this.windows[windowName];
  }

  public CloseWindow(windowName: string) {
    if (!(windowName in this.windows)) {
      logger.warn(`Window ${windowName} not found`);
      return;
    }

    this.windows[windowName].close();
    delete this.windows[windowName];
  }
}
