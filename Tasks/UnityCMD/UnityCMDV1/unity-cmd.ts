import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { UnityToolRunner, UnityPathTools, UnityLogTools } from '@dinomite-studios/unity-utilities';
import { getUnityEditorVersion } from './unity-build-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const projectPath = tl.getPathInput('unityProjectPath') || '';
        const buildTarget = tl.getInput('buildTarget', true)!;
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityVersion = await getUnityEditorVersion();
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath')!;

        const logFilesDirectory = path.join(repositoryLocalPath!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityCMDLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);
        tl.setVariable('logsOutputPath', logFilesDirectory);

        // Mandatory set of command line arguments for Unity.
        // -logfile tells Unity where to put the operation log
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-projectPath').arg(projectPath)
            .arg('-buildTarget').arg(buildTarget)
            .arg('-logfile').arg(logFilePath);

        // Add the user's custom cmd arguments.
        unityCmd.line(tl.getInput('cmdArgs')!);

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        if (result === 0) {
            const buildSuccessLog = tl.loc('ExecuteSuccess');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('ExecuteFailed')} ${result}`;
            console.log(buildFailLog);
            tl.setResult(tl.TaskResult.Failed, buildFailLog);
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