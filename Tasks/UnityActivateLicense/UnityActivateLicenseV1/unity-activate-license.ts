import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-build-shared';
import {
    UnityPathTools,
    UnityVersionInfoResult,
    Utilities
} from '@dinomite-studios/unity-azure-pipelines-tasks-lib';

// Input variable names.
export const usernameInputVariableName = 'username';
export const passwordInputVariableName = 'password';
export const versionInputVariableName = 'version';
export const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
export const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';
export const unityProjectPathInputVariableName = "unityProjectPath";
export const localPathInputVariableName = 'Build.Repository.LocalPath';
export const versionSelectionModeVariableName = "versionSelectionMode";
const serialInputVariableName = 'serial';

function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Setup and read inputs.
        const username = tl.getInput(usernameInputVariableName, true)!;
        const password = tl.getInput(passwordInputVariableName, true)!;
        const serial = tl.getInput(serialInputVariableName, true)!;
        const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));
        const unityProjectPath = tl.getPathInput(unityProjectPathInputVariableName) || '';

        var unityVersion: UnityVersionInfoResult;
        if (versionSelectionMode === 'specify') {
            let customVersion = tl.getInput(versionInputVariableName, true)!;
            unityVersion = {
                info: {
                    isAlpha: false,
                    isBeta: false,
                    version: customVersion,
                    revision: undefined
                },
                error: undefined
            }
        } else {
            unityVersion = getUnityEditorVersion();
        }

        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion.info!);
        const logFilesDirectory = path.join(tl.getVariable(localPathInputVariableName)!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityActivationLog_${Utilities.getLogFileNameTimeStamp()}.log`);

        // Set output variable values.
        tl.setVariable('logsOutputPath', logFilesDirectory);

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-nographics')
            .arg('-projectPath').arg(unityProjectPath)
            .arg('-username').arg(username)
            .arg('-password').arg(password)
            .arg('-serial ').arg(serial)
            .arg('-logfile').arg(logFilePath);
        const result = unityCmd.execSync();

        // Unity process has finished. Set task result.
        if (result.code === 0) {
            const activateLicenseSuccessLog = tl.loc('successLicenseActivated');
            console.log(activateLicenseSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, activateLicenseSuccessLog);
        } else {
            const activateLicenseFailLog = `${tl.loc('failUnity')} ${result}`;
            console.log(activateLicenseFailLog);
            tl.setResult(tl.TaskResult.Failed, activateLicenseFailLog);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            console.error(e);
            tl.setResult(tl.TaskResult.Failed, `${e}`);
        }
    }
}

run();