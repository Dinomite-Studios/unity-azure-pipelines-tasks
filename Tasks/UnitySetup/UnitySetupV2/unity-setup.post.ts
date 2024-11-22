import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import { UnityEditorDeactivation } from './unity-editor-deactivation';

function run() {
    try {
        const unityDeactivation = UnityEditorDeactivation.run();
        if (unityDeactivation !== 0) {
            const log = `${tl.loc('taskResultFailedEditorDeactivation')} ${unityDeactivation}`;
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        // Set task result succeeded.
        const log = tl.loc('taskResultSuccessEditorDeactivation');
        console.log(log);
        tl.setResult(tl.TaskResult.Succeeded, log);
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