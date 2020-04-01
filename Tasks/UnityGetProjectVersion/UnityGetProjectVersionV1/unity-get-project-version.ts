import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { ProjectVersionService } from '@dinomite-studios/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        // Find Project Unity Editor Version
        let projectPath = tl.getPathInput('unityProjectPath') || '';
        const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
        if (unityVersion.error) {
            throw new Error(`${tl.loc('FailedToReadVersion')} | ${unityVersion.error}`);
        }

        tl.setVariable('projectVersion', unityVersion.version);
        tl.setResult(tl.TaskResult.Succeeded, `${tl.loc('SuccessFoundProjectVersion')} | ${unityVersion}`);
    } catch (e) {
        if (e instanceof Error) {
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();