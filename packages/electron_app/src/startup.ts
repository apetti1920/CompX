import fs from "fs";
import https from "https";
import tmp from 'tmp';

async function DownloadFile(url: string, onData?: (pct: number)=>void): Promise<void> {
    return new Promise(async (res, rej) => {
        tmp.file((errFile, path, fd, cleanupCallback) => {
            if (errFile) {
                cleanupCallback();
                rej(errFile);
            }

            let writeStream = fs.createWriteStream(path);
            https.get(url, (response) => {
                response.pipe(writeStream);

                let total = 0;
                response.on('data', (c) => {
                    total += c.length
                    if (response.headers['content-length'] === undefined) return;
                    const contentLength = parseFloat(response.headers['content-length']);
                    if (contentLength !== undefined && !isNaN(contentLength))
                        onData?.(total/contentLength);
                });

                // after download completed close filestream
                writeStream.on("finish", () => {
                    writeStream.close();
                    res();
                });
            }).on('error', err => {
                cleanupCallback();
                rej(err);
            });
        });
    });
}

export async function AppStart(onUpdate: (pct: number)=>void): Promise<void> {

}