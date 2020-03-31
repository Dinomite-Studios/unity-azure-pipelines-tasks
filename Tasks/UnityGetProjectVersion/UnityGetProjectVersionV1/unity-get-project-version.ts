import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { ProjectVersionService } from './node_modules/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        // Find Project Unity Editor Version
        let projectPath = tl.getPathInput('unityProjectPath');
        if (!projectPath) {
            projectPath = tl.getVariable('Build.Repository.LocalPath')!
        }
        const unityVersion = await ProjectVersionService.determineProjectVersion(projectPath);
        if (!unityVersion) {
            throw new Error(tl.loc('FailedToReadVersion'));
        } else {
            console.log(tl.loc('SuccessFoundProjectVersion') + unityVersion.version);
        }

        tl.setVariable('projectVersion', unityVersion!.version);
        tl.setResult(tl.TaskResult.Succeeded, `${tl.loc('SuccessFoundProjectVersion')} ${unityVersion!.version}`);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();