import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { UnityBuildTarget } from './unity-build-target.enum';
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';
import { UnityToolRunner, UnityPathTools, UnityLogTools } from '@dinomite-studios/unity-utilities';
import { getUnityEditorVersion } from './unity-build-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityBuildConfiguration = getBuildConfiguration();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityVersion = await getUnityEditorVersion();
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);
        const cleanBuild = tl.getVariable('Build.Repository.Clean');
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath')!;
        const buildOutputDir = UnityBuildScriptHelper.getBuildOutputDirectory(unityBuildConfiguration.buildTarget);
        const fullBuildOutputPath = path.join(`${unityBuildConfiguration.projectPath}`, `${buildOutputDir}`)

        const logFilesDirectory = path.join(repositoryLocalPath!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityBuildLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);
        tl.setVariable('logsOutputPath', logFilesDirectory);

        if (cleanBuild === 'true') {
            fs.removeSync(fullBuildOutputPath);
        }

        tl.mkdirP(fullBuildOutputPath);
        tl.checkPath(fullBuildOutputPath, 'Build Output Directory');
        tl.setVariable('buildOutputPath', fullBuildOutputPath.substr(repositoryLocalPath.length + 1));

        // Mandatory set of command line arguments for Unity.
        // -batchmode opens Unity without UI
        // -buildTarget sets the configured target platform
        // -projectPath tells Unity which project to load
        // -logfile tells Unity where to put the operation log
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(UnityBuildTarget[unityBuildConfiguration.buildTarget])
            .arg('-projectPath').arg(unityBuildConfiguration.projectPath)
            .arg('-logfile').arg(logFilePath);

        if (tl.getBoolInput('noPackageManager')) {
            unityCmd.arg('-noUpm');
        }

        if (tl.getBoolInput('acceptApiUpdate')) {
            unityCmd.arg('-accept-apiupdate');
        }

        if (tl.getBoolInput('noGraphics')) {
            unityCmd.arg('-nographics');
        }

        // We rely on having a C# script in the Unity project to trigger the build. This C# script
        // is generated here based on the tasks configuration and then "injected" into the project
        // before Unity launches. This way it will be available to us and we can Invoke it using the command line.
        const projectAssetsEditorFolderPath = path.join(`${unityBuildConfiguration.projectPath}`, 'Assets', 'Editor');
        tl.mkdirP(projectAssetsEditorFolderPath);
        tl.cd(projectAssetsEditorFolderPath);
        tl.writeFile('AzureDevOps.cs', UnityBuildScriptHelper.getUnityEditorBuildScriptContent(unityBuildConfiguration));
        tl.cd(unityBuildConfiguration.projectPath);
        unityCmd.arg('-executeMethod');
        unityCmd.arg('AzureDevOps.PerformBuild');

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        if (result === 0) {
            const buildSuccessLog = tl.loc('BuildSuccess');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('BuildFailed')} ${result}`;
            console.log(buildFailLog);
            tl.setResult(tl.TaskResult.Failed, buildFailLog);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            console.error(e);
            tl.setResult(tl.TaskResult.Failed, `${e}`);
        }
    }
}

function getBuildConfiguration(): UnityBuildConfiguration {
    const unityBuildConfiguration: UnityBuildConfiguration = new UnityBuildConfiguration();
    unityBuildConfiguration.outputFileName = tl.getInput('outputFileName') || 'drop';
    unityBuildConfiguration.developmentBuild = tl.getBoolInput('developmentBuild');
    unityBuildConfiguration.buildScenes = tl.getInput('buildScenes') || '';
    unityBuildConfiguration.buildTarget = (<any>UnityBuildTarget)[tl.getInput('buildTarget', true)!];
    unityBuildConfiguration.projectPath = tl.getPathInput('unityProjectPath') || '';

    if (process.platform !== 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.WindowsStoreApps) {
        throw Error('Cannot build an UWP project on a Mac.');
    }

    return unityBuildConfiguration;
}

run();