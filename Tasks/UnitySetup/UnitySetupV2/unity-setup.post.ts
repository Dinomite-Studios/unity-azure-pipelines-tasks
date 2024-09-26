import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import { UnityEditorDeactivation } from './unity-editor-deactivation';

function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const unityDeactivation = UnityEditorDeactivation.run();
        if (unityDeactivation !== 0) {
            tl.setResult(tl.TaskResult.Failed, `${tl.loc('failUnityGeneric')} ${unityDeactivation}`);
            return;
        }

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