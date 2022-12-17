import path = require('path');
import tl = require('azure-pipelines-task-lib/task');

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const versionInputVariableName = 'version';
const revisionInputVariableName = 'revision';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
function run() {
    try {
        // Setup and read inputs.
        const version = tl.getPathInput(versionInputVariableName, true);
        const revision = tl.getPathInput(revisionInputVariableName, true);
        console.log(`${tl.loc('installVersionInfo')} ${version} (${revision})`);

        // Set task result succeeded.
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('successUnityInstall'));
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