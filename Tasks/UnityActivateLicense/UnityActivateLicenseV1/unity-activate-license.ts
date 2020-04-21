import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-activate-license-shared';
import { UnityToolRunner, UnityPathTools } from '@dinomite-studios/unity-utilities';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const username = tl.getInput('username', true)!;
        const password = tl.getInput('password', true)!;
        const serial = tl.getInput('serial', true)!;
        const unityVersion = await getUnityEditorVersion();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);

        const logFilesDirectory = path.join(tl.getVariable('Build.Repository.LocalPath')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityActivationLog_${Date.now()}.log`);
        tl.setVariable('logsOutputPath', logFilesDirectory);

        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-nographics')
            .arg('-username').arg(username)
            .arg('-password').arg(password)
            .arg('-serial ').arg(serial)
            .arg('-logfile').arg(logFilePath);

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        if (result === 0) {
            const activateLicenseSuccessLog = tl.loc('SuccessLicenseActivated');
            console.log(activateLicenseSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, activateLicenseSuccessLog);
        } else {
            const activateLicenseFailLog = `${tl.loc('FailUnity')} ${result}`;
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