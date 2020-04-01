import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { ProjectVersionService } from '@dinomite-studios/unity-project-version';
import { UnityLogStreamer } from './unity-log-streamer';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const username = tl.getInput('username', true)!;
        const password = tl.getInput('password', true)!;
        const serial = tl.getInput('serial', true)!;
        const unityEditorsPath = getUnityEditorsPath();

        // Find Project Unity Editor Version
        let projectPath = tl.getPathInput('unityProjectPath') || '';
        const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
        if (unityVersion.error) {
            throw new Error(`${tl.loc('FailedToReadVersion')} | ${unityVersion.error}`);
        }

        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityVersion!.version}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityVersion!.version}`);
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

        const logFilePath = path.join(tl.getVariable('Build.Repository.LocalPath')!, 'UnityActivationLog.log');
        unityCmd.arg('-logfile');
        unityCmd.arg(logFilePath);
        tl.setVariable('logFilePath', logFilePath);

        const logStreamer = new UnityLogStreamer(logFilePath);
        let execResult = unityCmd.exec();
        while (execResult.isPending && !fs.existsSync(logFilePath)) {
            await logStreamer.sleep(1000);
        }

        logStreamer.open();
        await execResult;
        logStreamer.stream();
        logStreamer.close();

        tl.setResult(tl.TaskResult.Succeeded, tl.loc('SuccessLicenseActivated'));
    } catch (e) {
        if (e instanceof Error) {
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
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
        if (!environmentVariablePath) {
            throw Error(tl.loc('EditorsPathEnvironmentVariableNotSet'));
        }

        return environmentVariablePath;
    } else {
        const customPath = tl.getInput('customUnityEditorsPath');
        if (!customPath) {
            throw Error(tl.loc('EditorsPathCustomPathNotSet'));
        }

        return customPath;
    }
}

run();