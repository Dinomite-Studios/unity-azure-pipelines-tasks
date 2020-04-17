import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { ProjectVersionService } from '@dinomite-studios/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        // Find Project Unity Editor Version
        let projectPath = tl.getPathInput('unityProjectPath') || '';
        console.log(`${tl.loc('ProjectPathInfo')} ${projectPath}`);

        const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
        if (unityVersion.error) {
            let error = `${tl.loc('FailGetUnityEditorVersion')} | ${unityVersion.error}`;
            console.error(error);
            throw new Error(error);
        }

        let successLog = `${tl.loc('SuccessGetUnityEditorVersion')} | ${unityVersion.version} | Alpha ${unityVersion.isAlpha} | Beta ${unityVersion.isBeta}`;
        console.log(successLog);
        if (unityVersion.isAlpha || unityVersion.isBeta) {
            console.warn(tl.loc('WarningAlphaBetaVersion'));
        }

        tl.setVariable('projectVersion', unityVersion.version);
        tl.setResult(tl.TaskResult.Succeeded, successLog);
    } catch (e) {
        if (e instanceof Error) {
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();