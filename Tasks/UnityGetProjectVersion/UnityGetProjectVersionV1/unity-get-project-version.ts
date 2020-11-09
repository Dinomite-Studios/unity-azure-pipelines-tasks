import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { ProjectVersionService } from '@dinomite-studios/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const projectPath = tl.getPathInput('unityProjectPath') || '';
        console.log(`${tl.loc('ProjectPathInfo')} ${projectPath}`);

        const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
        if (unityVersion.error) {
            const error = `${tl.loc('FailGetUnityEditorVersion')} | ${unityVersion.error}`;
            console.error(error);
            throw new Error(error);
        }

        const successGetVersionLog = `${tl.loc('SuccessGetUnityEditorVersion')} ${unityVersion.version}, alpha=${unityVersion.isAlpha}, beta=${unityVersion.isBeta}`;
        console.log(successGetVersionLog);
        if (unityVersion.isAlpha || unityVersion.isBeta) {
            console.warn(tl.loc('WarningAlphaBetaVersion'));
        }

        tl.setVariable('projectVersion', unityVersion.version);
        tl.setVariable('projectVersionRevision', unityVersion.revision);
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