import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-build-shared';
import {
    UnityPathTools,
    UnityVersionInfoResult,
    Utilities
} from '@dinomite-studios/unity-azure-pipelines-tasks-lib';
import {
    customUnityEditorsPathInputVariableName,
    localPathInputVariableName,
    passwordInputVariableName,
    unityEditorsPathModeInputVariableName,
    usernameInputVariableName,
    versionInputVariableName,
    versionSelectionModeVariableName
} from './unity-activate-license';

// Input variable names.
const deactivateSeatOnCompleteInputVariableName = 'deactivateSeatOnComplete';

function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Setup and read inputs.
        const username = tl.getInput(usernameInputVariableName, true)!;
        const password = tl.getInput(passwordInputVariableName, true)!;
        const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
        const deactivateSeatOnComplete = tl.getBoolInput(deactivateSeatOnCompleteInputVariableName);
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));

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
        const logFilePath = path.join(logFilesDirectory, `UnityReturnLicenseLog_${Utilities.getLogFileNameTimeStamp()}.log`);

        // Set output variable values.
        tl.setVariable('logsOutputPath', logFilesDirectory);

        // Execute Unity command line.
        if (deactivateSeatOnComplete) {
            const unityCmd = tl.tool(unityExecutablePath)
                .arg('-batchmode')
                .arg('-nographics')
                .arg('-username').arg(username)
                .arg('-password').arg(password)
                .arg('-returnlicense')
                .arg('-logfile').arg(logFilePath)
                .arg('-quit');
            const result = unityCmd.execSync();

            // Unity process has finished. Set task result.
            if (result.code === 0) {
                const returnLicenseSuccessLog = tl.loc('successLicenseReturned');
                console.log(returnLicenseSuccessLog);
                tl.setResult(tl.TaskResult.Succeeded, returnLicenseSuccessLog);
            } else {
                const returnLicenseFailLog = `${tl.loc('failUnity')} ${result}`;
                console.error(returnLicenseFailLog);
                tl.setResult(tl.TaskResult.Failed, returnLicenseFailLog);
            }
        } else {
            tl.setResult(tl.TaskResult.Succeeded, tl.loc('successSkipReturn'));
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
