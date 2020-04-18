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

        let result = -1;

        try {
            result = await execResult;

            let size = 0;
            if (fs.existsSync(logFilePath)) {
                size = fs.statSync(logFilePath).size;
            }

            while (size > UnityLogStreamer.getTailPos(logTail) || UnityLogStreamer.getTailQueueLength(logTail) > 0) {
                UnityLogStreamer.sleep(2089);
            }

            logTail.unwatch();

            return result;
        } catch (e) {
            if (logTail != null) {
                logTail.unwatch();
            }

            // WORKAROUND for license activation
            // The unity exe might return the error code 3221225477 and throw an
            // error because it can't write the license file on the agent, due to
            // missing access right. Nontheless the Unity process has finished
            // its operation at this point and can we ignore this specific error,
            // since the licnse is going to get released anyways after the pipeline
            // has finished.
            if (e instanceof Error && e.message.includes('exit code 3221225477')) {
                result = 0;
            }

            if (result === 0) {
                return result;
            }

            throw e;
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

    public static sleep(ms: number): void {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
    }
}
