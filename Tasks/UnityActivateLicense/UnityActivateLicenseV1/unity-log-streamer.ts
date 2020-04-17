import tail = require('tail');
import fs = require('fs-extra');

/**
 * Watches the unity log output and streams it back to the console.
 */
export class UnityLogStreamer {

    /**
     * Creates a new instance of the log streamer
     * to watch specified logfile and stream its content
     * to the console.
     */
    constructor(logFilePath: string) {
        this.logFilePath = logFilePath;
    }

    private readonly logFilePath: string;

    public open(): void {
        console.log("================================ UNITY LOG ===================================")
    }

    public async stream(execResult: Q.Promise<number>): Promise<void> {
        const logTail = new tail.Tail(this.logFilePath, {
            fromBeginning: true, follow: true,
            logger: console, useWatchFile: true,
            fsWatchOptions: { interval: 1009 }
        });

        logTail.on("line", function (data) { console.log(data); });
        logTail.on("error", function (error) { console.log('ERROR: ', error); });

        let size = fs.statSync(this.logFilePath).size;
        await execResult;

        while (size > this.getTailPos(logTail) || this.getTailQueueLength(logTail) > 0) {
            await this.sleep(2089);
        }

        logTail.unwatch();
    }

    public close(): void {
        console.log("=============================== UNITY LOG END ================================");
    }

    private getTailPos(t: any): number {
        return t.pos;
    }

    private getTailQueueLength(t: any): number {
        return t.queue.length;
    }

    public sleep(milliseconds: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
}
