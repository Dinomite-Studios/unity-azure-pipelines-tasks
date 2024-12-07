import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import {
    UnityToolRunner,
    UnityPathTools,
    Utilities
} from '@dinomite-studios/unity-azure-pipelines-tasks-lib';
import { getProjectUnityVersion } from './utilities';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const unityProjectPathInputVariableName = 'unityProjectPath';
export const versionSelectionModeVariableName = "versionSelectionMode";
export const versionInputVariableName = 'version';
const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';
const cmdArgsInputVariableName = 'cmdArgs';

// Output variables.
const editorLogFilePathOutputVariableName = 'editorLogFilePath';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
async function run() {
    try {
        // Setup and read inputs.
        const projectPath = tl.getPathInput(unityProjectPathInputVariableName) ?? '';
        const editorInstallationsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));
        const editorVersion = getProjectUnityVersion();
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(editorInstallationsPath, editorVersion!);

        // Set output variable values.
        const logFilesDirectory = path.join(tl.getVariable('Agent.TempDirectory')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityCMDLog_${Utilities.getLogFileNameTimeStamp()}.log`);
        tl.setVariable(editorLogFilePathOutputVariableName, logFilePath);

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-projectPath').arg(projectPath)
            .arg('-logfile').arg(logFilePath)
            .line(tl.getInput(cmdArgsInputVariableName)!);
        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        // Unity process has finished. Set task result.
        if (result === 0) {
            const buildSuccessLog = tl.loc('executeSuccess');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('executeFailed')} ${result}`;
            console.log(buildFailLog);
            tl.setResult(tl.TaskResult.Failed, buildFailLog);
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