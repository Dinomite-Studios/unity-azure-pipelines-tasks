import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { ProjectVersionService } from '@dinomite-studios/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityEditorsPath = getUnityEditorsPath();

        // Find Project Unity Editor Version
        let projectPath = tl.getPathInput('unityProjectPath');
        const unityVersion = await ProjectVersionService.determineProjectVersion(projectPath ? projectPath : '');
        if (!unityVersion) {
            throw new Error(tl.loc('FailedToReadVersion'));
        } else {
            console.log(tl.loc('SuccessFoundProjectVersion') + unityVersion.version);
        }

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
