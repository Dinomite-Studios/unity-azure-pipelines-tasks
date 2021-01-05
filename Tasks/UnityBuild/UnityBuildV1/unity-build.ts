import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { UnityBuildTarget } from './unity-build-target.enum';
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';
import { UnityToolRunner, UnityPathTools, UnityLogTools } from '@dinomite-studios/unity-utilities';
import { getUnityEditorVersion } from './unity-build-shared';
import { UnityProjectVersion } from '@dinomite-studios/unity-project-version';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityBuildConfiguration = getBuildConfiguration();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath('unityHub');

        let unityVersion: UnityProjectVersion;
        if (tl.getInput('unityVersion') === 'project') {
            unityVersion = await getUnityEditorVersion();
        } else {
            const customUnityVersion = tl.getInput('specificUnityVersion');
            if (!customUnityVersion) {
                throw Error('Please specify a valid Unity version or use the project version option.');
            }

            unityVersion = {
                version: customUnityVersion,
                isAlpha: false,
                isBeta: false
            }
        }

        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath')!;

        const logFilesDirectory = path.join(repositoryLocalPath, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityBuildLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);

        // Create the editor script that will trigger the Unity build.
        const projectAssetsEditorFolderPath = path.join(`${unityBuildConfiguration.projectPath}`, 'Assets', 'Editor');
        tl.mkdirP(projectAssetsEditorFolderPath);
        tl.cd(projectAssetsEditorFolderPath);
        tl.writeFile('AzureDevOps.cs',
            UnityBuildScriptHelper.getUnityEditorBuildScriptContent(
                unityBuildConfiguration));
        tl.cd(unityBuildConfiguration.projectPath);

        let unityCmd = tl.tool(unityExecutablePath);
        const buildArgs = [
            '-batchmode',
            '-buildTarget', UnityBuildTarget[unityBuildConfiguration.buildTarget],
            '-projectPath', unityBuildConfiguration.projectPath,
            '-executeMethod', 'AzureDevOps.PerformBuild',
            '-logfile', logFilePath];

        if (unityBuildConfiguration.disablePackageManager) {
            buildArgs.push('-noUpm');
        }

        if (unityBuildConfiguration.runAPIUpdater) {
            buildArgs.push('-accept-apiupdate');
        }

        unityCmd.arg(buildArgs);

        // Make sure the build output directory exists.
        const buildOutputDir = UnityBuildScriptHelper.getBuildOutputDirectory(unityBuildConfiguration.buildTarget);
        const fullBuildOutputPath = path.join(`${unityBuildConfiguration.projectPath}`, `${buildOutputDir}`)

        fs.removeSync(fullBuildOutputPath);
        tl.mkdirP(fullBuildOutputPath);
        tl.checkPath(fullBuildOutputPath, 'Build Output Directory');
        tl.setVariable('buildOutputPath', fullBuildOutputPath.substr(repositoryLocalPath.length + 1));

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
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

function getBuildConfiguration(): UnityBuildConfiguration {
    const unityBuildConfiguration: UnityBuildConfiguration = new UnityBuildConfiguration();
    unityBuildConfiguration.developmentBuild = tl.getBoolInput('developmentBuild');
    unityBuildConfiguration.runAPIUpdater = tl.getBoolInput('acceptApiUpdate');
    unityBuildConfiguration.disablePackageManager = tl.getBoolInput('noPackageManager');
    unityBuildConfiguration.buildScenes = tl.getInput('buildScenes') || '';
    unityBuildConfiguration.buildTarget = (<any>UnityBuildTarget)[tl.getInput('buildTarget', true)!];
    unityBuildConfiguration.projectPath = tl.getPathInput('unityProjectPath') || '';

    if (process.platform !== 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.WindowsStoreApps) {
        throw Error('Cannot build an UWP project on a Mac.');
    } else if (process.platform === 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.iOS) {
        throw Error('Cannot build an iOS/tvOS project on a Windows PC.');
    }

    return unityBuildConfiguration;
}

run();