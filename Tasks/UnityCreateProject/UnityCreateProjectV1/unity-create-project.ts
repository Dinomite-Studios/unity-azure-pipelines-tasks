import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { UnityPathTools, UnityToolRunner, Utilities } from '@dinomite-studios/unity-azure-pipelines-tasks-lib';

// Input variables
const versionInputVariableName = 'version';
const pathInputVariableName = 'path';
const projectNameInputVariableName = 'projectName';
const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';

// Output variables.
const editorLogFilePathOutputVariableName = 'editorLogFilePath';

async function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Setup and read inputs.
        const projectPath = tl.getPathInput(pathInputVariableName) ?? '';
        const projectName = tl.getPathInput(projectNameInputVariableName) ?? 'New Project';
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));
        const unityVersion = {
            info: {
                isAlpha: false,
                isBeta: false,
                version: tl.getInput(versionInputVariableName, true)!,
                revision: undefined
            },
            error: undefined
        }

        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion.info!);

        // Set output variable values.
        const logFilesDirectory = path.join(tl.getVariable('Agent.TempDirectory')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityLog_${Utilities.getLogFileNameTimeStamp()}.log`);
        tl.setVariable(editorLogFilePathOutputVariableName, logFilePath);

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-createProject')
            .arg(path.join(projectPath, projectName))
            .arg('-logfile')
            .arg(logFilePath)
            .arg('-quit');

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        // Unity process has finished. Set task result.
        if (result === 0) {
            const buildSuccessLog = tl.loc('successProjectCreated');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('failCreateProject')} ${result}`;
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