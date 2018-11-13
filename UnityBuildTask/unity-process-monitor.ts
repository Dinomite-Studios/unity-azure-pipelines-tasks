import findProcess = require('find-process');

/**
 * Utility class used to monitor whether the Unity build process is still running.
 */
export class UnityProcessMonitor {

    /**
     * Array contains a list of processes that should be ignored
     * when checking whether the Unity editor build process is still running.
     */
    private static ignoredProcesses = [
        "Unity Helper",
        "Unity Hub Helper",
        "Unity Hub",
        "node" // HACK: find-process lib for some reason always returns 'node' as a running process.
    ];

    private static readonly windowsProcess = "Unity.exe";
    private static readonly macProcess = "Unity";

    public static async isUnityStillRunning(): Promise<boolean> {
        const results = await findProcess("name", process.platform === 'win32' ? this.windowsProcess : this.macProcess);

        if (results.length > 0) {
            let running = false;

            for (let i = 0; i < results.length; i++) {
                const process = results[i].name.trim();

                // If the process is NOT in the list of ignored Unity related
                // processes, then it's most likely actually the Unity Editor process.
                if (this.ignoredProcesses.indexOf(process) === -1) {
                    running = true;
                }
            }

            return running;
        }

        return false;
    }
}