import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const projectPath = tl.getPathInput('unityProjectPath');
        let projectVersion = fs.readFileSync(path.join(`${projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
            .toString()
            .split(':')[1]
            .trim();

        const revisionVersionIndex = projectVersion.indexOf('m_EditorVersionWithRevision');
        if (revisionVersionIndex > -1) {
            // The ProjectVersion.txt contains a revision version. We need to drop it.
            projectVersion = projectVersion.substr(0, revisionVersionIndex).trim();
        }

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