import { app, BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import EventEmitter from "events";
import * as fs from 'fs';
import https from 'https';

const DownloadFile = (url: string) => {
    const dest = "file.jpg";
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
        response.pipe(file);

        let total = 0;
        response.on('data', (c) => {
            total += c.length
            if (response.headers['content-length'] === undefined) return;
            const contentLength = parseFloat(response.headers['content-length']);
            if (contentLength !== undefined && !isNaN(contentLength))
                loadingEvents.emit('progress', total/contentLength);
        });

        // after download completed close filestream
        file.on("finish", () => {
            file.close();
            console.log("Download Completed");
        });
    }).on('error', err => {
        fs.unlink(dest, ()=>{
            console.log(err.message);
        });
    });
}

const SetupApp = async (onProgress: (pct: number)=>void, onFinished: ()=>void) => {
    function sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    const t = 20;
    for (let i=0; i<t; i++) {
        await sleep(1000);
        onProgress(i/t);
    }

    onFinished();
}

const loadingEvents = new EventEmitter();
const CreateWindow = (args?: BrowserWindowConstructorOptions) => new BrowserWindow({
    ...args,
    width: args?.width??900, height: args?.height??600, webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
    }
});

app.on('ready', () => {
    const loadingWindow = CreateWindow({width: 600, height: 400, frame: false, resizable: false});
    loadingWindow.loadFile(__dirname + "/../renderer/static/loading.html");

    SetupApp(
        (pct) => {
            loadingWindow.webContents.send('progress', pct);
        }, ()=>{
            const mainWindow = CreateWindow();
            mainWindow.loadFile(__dirname + "/../renderer/index.html");
            mainWindow.on('ready-to-show', () => {
                loadingWindow.close();
                loadingWindow.destroy();
                mainWindow.show();
                mainWindow.webContents.openDevTools();
            });
        }
    )

    // DownloadFile('https://512pixels.net/downloads/macos-wallpapers/10-15-Day.jpg');
});