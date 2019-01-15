import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const projectPath = tl.getPathInput('unityProjectPath');
        const projectVersion = fs.readFileSync(path.join(`${projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
            .toString()
            .split(':')[1]
            .trim();

        if (!isNullOrUndefined(projectVersion) && projectVersion !== '') {
            tl.setVariable('projectVersion', projectVersion);
            tl.setResult(tl.TaskResult.Succeeded, `Found project version: ${projectVersion}`);
        } else {
            tl.setResult(tl.TaskResult.Failed, 'Failed to get project version from ProjectVersion.txt file.');
        }
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();