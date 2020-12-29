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
        const activationMode = tl.getInput('activationMode', false) ?? "Plus/Pro";

        if (activationMode != 'Plus/Pro')
            return; // No need to return manual license.

        const unityVersion = await getUnityEditorVersion();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);

        const logFilesDirectory = path.join(tl.getVariable('Build.Repository.LocalPath')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityReturnLicenseLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);
        tl.setVariable('logsOutputPath', logFilesDirectory);

        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-quit')
            .arg('-returnlicense')
            .arg('-logfile').arg(logFilePath);

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        if (result === 0) {
            const returnLicenseSuccessLog = tl.loc('successLicenseReturned');
            console.log(returnLicenseSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, returnLicenseSuccessLog);
        } else {
            const returnLicenseFailLog = `${tl.loc('failUnity')} ${result}`;
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
