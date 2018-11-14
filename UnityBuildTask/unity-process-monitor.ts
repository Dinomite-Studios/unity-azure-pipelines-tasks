import findProcess = require('find-process');

/**
 * Utility class used to monitor whether the Unity build process is still running.
 */
export class UnityProcessMonitor {

    private static readonly windowsProcessName = "Unity.exe";
    private static readonly macProcessName = "Unity";

    public static async isUnityStillRunning(): Promise<boolean> {
        const runningOnWindows = process.platform === 'win32';
        const results = await findProcess("name", runningOnWindows ? this.windowsProcessName : this.macProcessName);

        // HACK / WORKAROUND:
        // find-process lib for some reason always returns 'node' as a running process, even though we are searching for processes with a 'Unity' substring.
        // So in case it's in the results array, we'll remove it first.
        const nodeProcessIndex = results.findIndex((v) => v.name.trim() === 'node');
        if (nodeProcessIndex !== -1) {
            results.splice(nodeProcessIndex, 1);
        }

        if (results.length > 0) {
            if (runningOnWindows) {
                return true;
            } else {
                let running = false;

                for (let i = 0; i < results.length; i++) {
                    const processCmd = results[i].cmd.trim();

                    // ANOTHER HACK / WORKAROUND:
                    // Unity Hub and Unity Editor share the same process name on Mac, which is 'Unity'.
                    // That's why we need to filter the Hub by cmd value since we don't care whether it's running.
                    if (!processCmd.startsWith('/Applications/Unity Hub.app')) {
                        running = true;
                    }
                }

                return running;
            }
        }

        // Since no process containing the name 'Unity' was found, we can assume that Unity has exited and the build is not
        // running anymore.
        return false;
    }
}