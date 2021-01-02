import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { ProjectVersionService } from '@dinomite-studios/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const unityProjectPathInputVariableName = 'unityProjectPath';

// Output variables.
const projectVersionOutputVariableName = 'projectVersion';
const projectVersionRevisionOutputVariableName = 'projectVersionRevision';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
async function run() {
    try {
        // Setup and read inputs.
        const projectPath = tl.getPathInput(unityProjectPathInputVariableName) || '';
        console.log(`${tl.loc('projectPathInfo')} ${projectPath}`);

        // Determine the project's last used Unity editor version.
        const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
        if (unityVersion.error) {
            const error = `${tl.loc('failGetUnityEditorVersion')} | ${unityVersion.error}`;
            console.error(error);
            throw new Error(error);
        }

        // Log findings.
        const successGetVersionLog = `${tl.loc('successGetUnityEditorVersion')} ${unityVersion.version}${unityVersion.revision ? `, revision=${unityVersion.revision}` : ''}, alpha=${unityVersion.isAlpha}, beta=${unityVersion.isBeta}`;
        console.log(successGetVersionLog);
        if (unityVersion.isAlpha || unityVersion.isBeta) {
            console.warn(tl.loc('warningAlphaBetaVersion'));
        }

        // Set output variable values.
        tl.setVariable(projectVersionOutputVariableName, unityVersion.version);
        if (unityVersion.revision) {
            tl.setVariable(projectVersionRevisionOutputVariableName, unityVersion.revision);
        }

        // Set task result succeeded.
        tl.setResult(tl.TaskResult.Succeeded, successGetVersionLog);
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