import tail = require('tail');
import fs = require('fs-extra');

/**
 * Watches the unity log output and streams it back to the console.
 */
export class UnityLogStreamer {

    public static printOpen(): void {
        console.log("================================ UNITY LOG ===================================")
    }

    public static async stream(logFilePath: string, execResult: Q.Promise<number>): Promise<number> {
        const logTail = new tail.Tail(logFilePath, {
            fromBeginning: true, follow: true,
            logger: console, useWatchFile: true,
            fsWatchOptions: { interval: 1009 }
        });

        logTail.on("line", function (data) { console.log(data); });
        logTail.on("error", function (error) { console.log('ERROR: ', error); });

        try {
            const result = await execResult;

            let size = 0;
            if (fs.existsSync(logFilePath)) {
                size = fs.statSync(logFilePath).size;
            }

            while (size > this.getTailPos(logTail) || this.getTailQueueLength(logTail) > 0) {
                await UnityLogStreamer.sleep(2089);
            }

            logTail.unwatch();

            return result;
        } catch (error) {
            if (logTail != null) {
                logTail.unwatch();
            }

            throw error;
        }
    }

    public static printClose(): void {
        console.log("=============================== UNITY LOG END ================================");
    }

    private static getTailPos(t: any): number {
        return t.pos;
    }

    private static getTailQueueLength(t: any): number {
        return t.queue.length;
    }

    public static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
