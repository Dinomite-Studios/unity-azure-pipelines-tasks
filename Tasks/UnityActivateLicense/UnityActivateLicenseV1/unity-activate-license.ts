import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { UnityLogStreamer } from './unity-log-streamer';
import { getUnityEditorVersion, getUnityEditorsPath, getUnityExecutableFullPath } from './unity-activate-license-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const username = tl.getInput('username', true)!;
        const password = tl.getInput('password', true)!;
        const serial = tl.getInput('serial', true)!;
        const unityVersion = await getUnityEditorVersion();
        const unityEditorsPath = getUnityEditorsPath();
        const unityExecutablePath = getUnityExecutableFullPath(unityEditorsPath, unityVersion);

        const logFilePath = path.join(tl.getVariable('Build.Repository.LocalPath')!, 'UnityActivationLog.log');
        tl.setVariable('logFilePath', logFilePath);

        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-nographics')
            .arg('-username').arg(username)
            .arg('-password').arg(password)
            .arg('-serial ').arg(serial)
            .arg('-logfile').arg(logFilePath);

        let execResult = unityCmd.exec();
        while (execResult.isPending && !fs.existsSync(logFilePath)) {
            await UnityLogStreamer.sleep(1000);
        }

        UnityLogStreamer.printOpen();
        const result = await UnityLogStreamer.stream(logFilePath, execResult);
        UnityLogStreamer.printClose();

        if (result === 0) {
            tl.setResult(tl.TaskResult.Succeeded, tl.loc('SuccessLicenseActivated'));
        } else {
            tl.setResult(tl.TaskResult.Failed, `${tl.loc('FailUnity')} ${result}`);
        }
    } catch (e) {
        if (e instanceof Error) {
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();