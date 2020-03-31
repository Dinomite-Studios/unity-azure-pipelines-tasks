import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { ProjectVersionService } from '@dinomite-studios/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        // Find Project Unity Editor Version
        let projectPath = tl.getPathInput('unityProjectPath');
        const unityVersion = await ProjectVersionService.determineProjectVersion(projectPath ? projectPath : '');
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