import tl = require('azure-pipelines-task-lib/task');
import { usernameInputVariableName, passwordInputVariableName, serialInputVariableName, activateLicenseInputVariableName } from './variables';
import { getProjectUnityVersion } from './utilities';
import path = require('path');
import { UnityPathTools, Utilities } from '@dinomite-studios/unity-azure-pipelines-tasks-lib';

export class UnityEditorActivation {
    public static run(): number {
        const activateLicense = tl.getBoolInput(activateLicenseInputVariableName);
        if (!activateLicense) {
            return 0;
        }

        const editorVersion = getProjectUnityVersion();
        const editorInstallationsPath = UnityPathTools.getUnityEditorsPath('default');
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(editorInstallationsPath, editorVersion!);

        const username = tl.getInput(usernameInputVariableName, true)!;
        const password = tl.getInput(passwordInputVariableName, true)!;
        const serial = tl.getInput(serialInputVariableName, true)!;

        const logFilesDirectory = path.join(tl.getVariable('Agent.TempDirectory')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityActivationLog_${Utilities.getLogFileNameTimeStamp()}.log`);

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-nographics')
            .arg('-username').arg(username)
            .arg('-password').arg(password)
            .arg('-serial ').arg(serial)
            .arg('-logfile').arg(logFilePath)
            .arg('-quit');

        const result = unityCmd.execSync();
        if (result.code !== 0) {
            return result.code;
        }

        return 0;
    }
}