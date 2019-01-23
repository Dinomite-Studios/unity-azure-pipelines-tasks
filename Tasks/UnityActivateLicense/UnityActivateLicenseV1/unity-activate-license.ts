import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const username = tl.getInput('username', true);
        const password = tl.getInput('password', true);
        const serial = tl.getInput('serial', true);
        const unityEditorsPath = getUnityEditorsPath();
        const unityVersion = getUnityProjectVersion(tl.getInput('unityProjectPath'));

        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-nographics')
            .arg('-username').arg(username)
            .arg('-password').arg(password)
            .arg('-serial ').arg(serial);

        const logFilePath = path.join(tl.getVariable('Build.Repository.LocalPath'), 'UnityActivationLog.log');
        unityCmd.arg('-logfile');
        unityCmd.arg(logFilePath);
        tl.setVariable('logFilePath', logFilePath);

        unityCmd.execSync();
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

run();

function getUnityProjectVersion(projectPath: string): string {
    return fs.readFileSync(path.join(`${projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
        .toString()
        .split(':')[1]
        .trim();
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