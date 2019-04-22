import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { UnityProcessMonitor } from './unity-process-monitor';

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

        // The build is now running. Start observing the output directory.
        // Check every minute whether the Unity process is still running and if not,
        // whether there is build output.
        setTimeout(() => {
            waitForResult();
        }, 30000);
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err);
    }
}

async function waitForResult(): Promise<void> {
    console.log('Checking whether Unity process is still running...');
    const unityStillRunning = await UnityProcessMonitor.isUnityStillRunning();

    if (unityStillRunning) {
        console.log('Unity process still running. Will check again in 30 seconds...')
        setTimeout(() => {
            waitForResult();
        }, 30000);
    } else {
        console.log('Unity process has finished.');
        tl.setResult(tl.TaskResult.Succeeded, '');
    }
}

function getUnityProjectVersion(projectPath: string): string {
    let unityVersion = fs.readFileSync(path.join(`${projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
        .toString()
        .split(':')[1]
        .trim();

    const revisionVersionIndex = unityVersion.indexOf('m_EditorVersionWithRevision');
    if (revisionVersionIndex > -1) {
        // The ProjectVersion.txt contains a revision version. We need to drop it.
        unityVersion = unityVersion.substr(0, revisionVersionIndex).trim();
    }

    return unityVersion;
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

run();