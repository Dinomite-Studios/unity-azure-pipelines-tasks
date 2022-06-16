import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-build-shared';
import {
    UnityToolRunner,
    UnityPathTools,
    UnityLogTools
} from '@dinomite-studios/unity-utilities';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const usernameInputVariableName = 'username';
const passwordInputVariableName = 'password';
const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';
const localPathInputVariableName = 'Build.Repository.LocalPath';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
async function run() {
    try {
        const username = tl.getInput(usernameInputVariableName, true)!;
        const password = tl.getInput(passwordInputVariableName, true)!;
        const unityVersion = getUnityEditorVersion();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);
        const logFilesDirectory = path.join(tl.getVariable(localPathInputVariableName)!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityReturnLicenseLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);

        // Set output variable values.
        tl.setVariable('logsOutputPath', logFilesDirectory);

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-nographics')
            .arg('-username').arg(username)
            .arg('-password').arg(password)
            .arg('-returnlicense')
            .arg('-logfile').arg(logFilePath);
        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        // Unity process has finished. Set task result.
        if (result === 0) {
            const returnLicenseSuccessLog = tl.loc('successLicenseReturned');
            console.log(returnLicenseSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, returnLicenseSuccessLog);
        } else {
            const returnLicenseFailLog = `${tl.loc('failUnity')} ${result}`;
            console.error(returnLicenseFailLog);
            tl.setResult(tl.TaskResult.Failed, returnLicenseFailLog);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            console.error(e);
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();
