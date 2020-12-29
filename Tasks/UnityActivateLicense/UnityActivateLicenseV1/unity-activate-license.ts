import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-activate-license-shared';
import {
    UnityToolRunner,
    UnityPathTools,
    UnityLogTools
} from '@dinomite-studios/unity-utilities';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const username = tl.getInput('username', true)!;
        const password = tl.getInput('password', true)!;
        const serial = tl.getInput('serial', true)!;
        const activationMode = tl.getInput('activationMode', false) ?? "Plus/Pro";
        const unityVersion = await getUnityEditorVersion();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);

        const logFilesDirectory = path.join(tl.getVariable('Build.Repository.LocalPath')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityActivationLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);
        tl.setVariable('logsOutputPath', logFilesDirectory);

        let unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-nographics')
            .arg('-logfile').arg(logFilePath);

        if (activationMode == 'Plus/Pro') {
            unityCmd = unityCmd
                .arg('-username').arg(username)
                .arg('-password').arg(password)
                .arg('-serial ').arg(serial);
        } else {
            unityCmd = unityCmd
                .arg('-manualLicenseFile').arg(serial);
        }

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        if (result === 0) {
            const activateLicenseSuccessLog = tl.loc('successLicenseActivated');
            console.log(activateLicenseSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, activateLicenseSuccessLog);
        } else {
            const activateLicenseFailLog = `${tl.loc('failUnity')} ${result}`;
            console.log(activateLicenseFailLog);
            tl.setResult(tl.TaskResult.Failed, activateLicenseFailLog);
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