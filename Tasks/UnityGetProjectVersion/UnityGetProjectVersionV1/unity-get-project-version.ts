import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { UnityVersionTools } from '@dinomite-studios/unity-azure-pipelines-tasks-lib';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const unityProjectPathInputVariableName = 'unityProjectPath';

// Output variables.
const projectVersionOutputVariableName = 'projectVersion';
const projectVersionRevisionOutputVariableName = 'projectVersionRevision';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
function run() {
    try {
        // Setup and read inputs.
        const projectPath = tl.getPathInput(unityProjectPathInputVariableName) ?? '';
        console.log(`${tl.loc('projectPathInfo')} ${projectPath}`);

        // Determine the project's last used Unity editor version.
        const unityVersion = UnityVersionTools.determineProjectVersionFromFile(projectPath);
        if (unityVersion.error) {
            const error = `${tl.loc('failGetUnityEditorVersion')} | ${unityVersion.error}`;
            console.error(error);
            throw new Error(error);
        }

        // Log findings.
        const successGetVersionLog = `${tl.loc('successGetUnityEditorVersion')} ${unityVersion.info!.version}${unityVersion.info!.revision ? `, revision=${unityVersion.info!.revision}` : ''}, alpha=${unityVersion.info!.isAlpha}, beta=${unityVersion.info!.isBeta}`;
        console.log(successGetVersionLog);
        if (unityVersion.info!.isAlpha || unityVersion.info!.isBeta) {
            console.warn(tl.loc('warningAlphaBetaVersion'));
        }

        // Set output variable values.
        tl.setVariable(projectVersionOutputVariableName, unityVersion.info!.version);
        if (unityVersion.info!.revision) {
            tl.setVariable(projectVersionRevisionOutputVariableName, unityVersion.info!.revision);
        }

        // Set task result succeeded.
        tl.setResult(tl.TaskResult.Succeeded, successGetVersionLog);
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