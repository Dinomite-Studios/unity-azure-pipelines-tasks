import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityEditorsPath = getUnityEditorsPath();
        const unityVersion = await getProjectVersion();

        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-returnlicense');

        unityCmd.execSync();
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

run();

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

function getUnityEditorsPath(): string {
    const editorsPathMode = tl.getInput('unityEditorsPathMode', true);
    if (editorsPathMode === 'unityHub') {
        const unityHubPath = process.platform === 'win32' ?
            path.join('C:', 'Program Files', 'Unity', 'Hub', 'Editor')
            : path.join('/', 'Applications', 'Unity', 'Hub', 'Editor');

        return unityHubPath;
    } else if (editorsPathMode === 'environmentVariable') {
        const environmentVariablePath = process.env.UNITYHUB_EDITORS_FOLDER_LOCATION as string;
        if (isNullOrUndefined(environmentVariablePath) || environmentVariablePath === '') {
            throw Error(tl.loc('EditorsPathEnvironmentVariableNotSet'));
        }

        return environmentVariablePath;
    } else {
        const customPath = tl.getInput('customUnityEditorsPath');
        if (isNullOrUndefined(customPath) || customPath === '') {
            throw Error(tl.loc('EditorsPathCustomPathNotSet'));
        }

        return customPath;
    }
}
