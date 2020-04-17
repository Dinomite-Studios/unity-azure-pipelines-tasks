import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorsPath, getUnityEditorVersion } from './unity-activate-license-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityEditorsPath = getUnityEditorsPath();
        const unityVersion = await getUnityEditorVersion();

        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');
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
