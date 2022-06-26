import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-build-shared';
import {
    UnityToolRunner,
    UnityPathTools,
    Utilities
} from '@dinomite-studios/unity-azure-pipelines-tasks-lib';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const usernameInputVariableName = 'username';
const passwordInputVariableName = 'password';
const serialInputVariableName = 'serial';
const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';
const localPathInputVariableName = 'Build.Repository.LocalPath';
const unityProjectPathInputVariableName = 'unityProjectPath';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
async function run() {
    try {
        // Setup and read inputs.
        const username = tl.getInput(usernameInputVariableName, true)!;
        const password = tl.getInput(passwordInputVariableName, true)!;
        const serial = tl.getInput(serialInputVariableName) || '';
        const projectPath = tl.getPathInput(unityProjectPathInputVariableName) || '';
        const unityVersion = getUnityEditorVersion();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));
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
            .arg('-username').arg(username)
            .arg('-password').arg(password)
            .arg('-projectPath').arg(projectPath)
            .arg('-logfile').arg(logFilePath);
        
        if (serial !== '') {
            unityCmd.arg('-serial ').arg(serial);
        }
        
        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        // Unity process has finished. Set task result.
        if (result === 0) {
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