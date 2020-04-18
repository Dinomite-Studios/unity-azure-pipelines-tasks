import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { getUnityEditorsPath, getUnityEditorVersion, getUnityExecutableFullPath } from './unity-activate-license-shared';
import { UnityLogStreamer } from './unity-log-streamer';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityVersion = await getUnityEditorVersion();
        const unityEditorsPath = getUnityEditorsPath();
        const unityExecutablePath = getUnityExecutableFullPath(unityEditorsPath, unityVersion);

        const logFilePath = path.join(tl.getVariable('Build.Repository.LocalPath')!, 'UnityReturnLicenseLog.log');
        // tl.setVariable('logFilePath', logFilePath);

        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-returnlicense')
            .arg('-logfile').arg(logFilePath);

        let execResult = unityCmd.exec();
        while (execResult.isPending && !fs.existsSync(logFilePath)) {
            await UnityLogStreamer.sleep(1000);
        }

        UnityLogStreamer.printOpen();
        const result = await UnityLogStreamer.stream(logFilePath, execResult);
        UnityLogStreamer.printClose();

        if (result === 0) {
            const returnLicenseSuccessLog = tl.loc('SuccessLicenseReturned');
            console.log(returnLicenseSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, returnLicenseSuccessLog);
        } else {
            const returnLicenseFailLog = `${tl.loc('FailUnity')} ${result}`;
            console.error(returnLicenseFailLog);
            tl.setResult(tl.TaskResult.Failed, returnLicenseFailLog);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            console.error(e);
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();
