import { app, BrowserWindow } from 'electron';

let mainWindow: BrowserWindow;
function CreateWindows(): void {
    mainWindow = new BrowserWindow({
        width: 900, height: 600, webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile(__dirname + "/../renderer/index.html");
    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
        mainWindow.webContents.openDevTools();
    });
}

app.on('ready', CreateWindows);