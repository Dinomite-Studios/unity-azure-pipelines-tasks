import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorsPath, getUnityEditorVersion, getUnityExecutableFullPath } from './unity-activate-license-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityVersion = await getUnityEditorVersion();
        const unityEditorsPath = getUnityEditorsPath();
        const unityExecutablePath = getUnityExecutableFullPath(unityEditorsPath, unityVersion);

        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-returnlicense');

        unityCmd.execSync();

        tl.setResult(tl.TaskResult.Succeeded, tl.loc('SuccessLicenseReleased'));
    } catch (e) {
        if (e instanceof Error) {
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();
