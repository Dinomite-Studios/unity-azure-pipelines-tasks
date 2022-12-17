import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-build.shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const versionSelectionModeVariableName = "versionSelectionMode";
const versionInputVariableName = 'version';
const revisionInputVariableName = 'revision';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
function run() {
    try {
        // Setup and read inputs.
        const unityHubExecutablePath = 'C:\\Program Files\\Unity Hub\\Unity Hub.exe';
        const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
        var version = '';
        var revision = '';

        if (versionSelectionMode === 'specify') {
            version = tl.getPathInput(versionInputVariableName, true)!;
            revision = tl.getPathInput(revisionInputVariableName, true)!;
        } else {
            const projectVersion = getUnityEditorVersion();
            version = projectVersion.info!.version;
            revision = projectVersion.info!.revision!;
        }

        console.log(`${tl.loc('installVersionInfo')} ${version} (${revision})`);

        const unityHubCmd = tl.tool(unityHubExecutablePath)
            .arg('--')
            .arg('--headless')
            .arg('install')
            .arg('--version').arg(version)
            .arg('--changeset').arg(revision);

        console.log(`${unityHubCmd}`)
        unityHubCmd.exec();

        // Set task result succeeded.
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('successUnityInstall'));
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