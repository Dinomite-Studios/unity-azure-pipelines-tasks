import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { UnityEditorInstall } from './unity-editor-install';
import { UnityModulesInstall } from './unity-modules-install';
// import { UnityEditorConfiguration } from './unity-editor-configuration';
import { UnityEditorActivation } from './unity-editor-activation';

function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const installResult = UnityEditorInstall.run();
        if (installResult !== 0) {
            const log = `${tl.loc('taskResultFailedEditorInstall')} ${installResult}`
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        const installModulesResult = UnityModulesInstall.run();
        if (installModulesResult !== 0) {
            const log = `${tl.loc('taskResultFailedModulesInstall')} ${installResult}`
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        const unityActivationResult = UnityEditorActivation.run();
        if (unityActivationResult !== 0) {
            const log = `${tl.loc('taskResultFailedEditorActivation')} ${installResult}`
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        // const configurationResult = UnityEditorConfiguration.run();
        // if (configurationResult !== 0) {
        //     const log = `${tl.loc('taskResultFailedEditorConfig')} ${installResult}`
        //     console.error(log);
        //     tl.setResult(tl.TaskResult.Failed, log);
        //     return;
        // }

        // Set task result succeeded.
        tl.setResult(tl.TaskResult.Succeeded);
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