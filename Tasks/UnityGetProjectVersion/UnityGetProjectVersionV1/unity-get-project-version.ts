import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const projectVersion = await getProjectVersion();
        tl.setVariable('projectVersion', projectVersion);
        tl.setResult(tl.TaskResult.Succeeded, `${tl.loc('SuccessFoundProjectVersion')} ${projectVersion}`);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

async function getProjectVersion(): Promise<string> {
    const projectPath = tl.getPathInput('unityProjectPath');
    const projectVersionFilePath = path.join(`${projectPath}`, 'ProjectSettings', 'ProjectVersion.txt');
    tl.debug(`${tl.loc('DebugProjectPath')} ${projectPath}`);
    tl.debug(`${tl.loc('DebugProjectVersionFilePath')} ${projectVersionFilePath}`);

    const projectVersionFileContent = await fs.readFile(projectVersionFilePath, { encoding: 'utf8' });
    tl.debug(`${tl.loc('DebugProjectVersionFileContent')} ${projectVersionFileContent}`);

    let projectVersion = projectVersionFileContent.split(':')[1].trim();
    tl.debug(`${tl.loc('DebugProjectVersion')} ${projectVersion}`);

    const revisionVersionIndex = projectVersion.indexOf('m_EditorVersionWithRevision');
    if (revisionVersionIndex > -1) {
        tl.debug(tl.loc('DebugRevisionVersion'));
        projectVersion = projectVersion.substr(0, revisionVersionIndex).trim();
    }

    if (projectVersion) {
        return projectVersion;
    }

    throw new Error(tl.loc('FailedToReadVersion'));
}

run();