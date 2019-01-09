import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');

import { isNullOrUndefined } from 'util';
import { UnityBuildTarget } from './unity-build-target.enum';
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';
import { UnityProcessMonitor } from './unity-process-monitor';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityBuildConfiguration = getBuildConfiguration();

        // Make sure the selected editor exists.
        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityBuildConfiguration.unityHubEditorFolderLocation}`, `${unityBuildConfiguration.unityVersion}`, 'Editor')
            : path.join(`${unityBuildConfiguration.unityHubEditorFolderLocation}`, `${unityBuildConfiguration.unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        // Create the editor script that will trigger the Unity build.
        const projectAssetsEditorFolderPath = path.join(`${unityBuildConfiguration.projectPath}`, 'Assets', 'Editor');
        tl.mkdirP(projectAssetsEditorFolderPath);
        tl.cd(projectAssetsEditorFolderPath);
        tl.writeFile('AzureDevOps.cs',
            UnityBuildScriptHelper.getUnityEditorBuildScriptContent(
                unityBuildConfiguration));
        tl.cd(unityBuildConfiguration.projectPath);

        // Execute Unity command line.
        let unityBuildTool = tl.tool(
            process.platform === 'win32' ?
                path.join(`${unityEditorDirectory}`, 'Unity.exe')
                : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity'));

        const buildArgs = [
            '-batchmode',
            '-buildTarget', UnityBuildTarget[unityBuildConfiguration.buildTarget],
            '-projectPath', unityBuildConfiguration.projectPath,
            '-executeMethod', 'AzureDevOps.PerformBuild'];

        if (unityBuildConfiguration.disablePackageManager) {
            buildArgs.push('-noUpm');
        }

        if (unityBuildConfiguration.runAPIUpdater) {
            buildArgs.push('-accept-apiupdate');
        }

        unityBuildTool.arg(buildArgs);

        // Make sure the build output directory exists.
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath');
        const buildOutputDir = UnityBuildScriptHelper.getBuildOutputDirectory(unityBuildConfiguration.buildTarget);
        const fullBuildOutputPath = path.join(`${unityBuildConfiguration.projectPath}`, `${buildOutputDir}`)

        fs.removeSync(fullBuildOutputPath);
        tl.mkdirP(fullBuildOutputPath);
        tl.checkPath(fullBuildOutputPath, 'Build Output Directory');
        tl.setVariable('buildOutputPath', fullBuildOutputPath.substr(repositoryLocalPath.length + 1));

        // Execute the unity command, which will launche the Unity editor in batch mode and trigger a build.
        // Unfortuntely, the command line will return before the unity build has actually finished, and eventually
        // give us a false positive. The solution is currently to observe the output directory until it contains output files
        // and fail the build after a given timeout if not.
        unityBuildTool.execSync();

        // The build is now running. Start observing the output directory.
        // Check every minute whether the Unity process is still running and if not,
        // whether there is build output.
        setTimeout(() => {
            waitForResult(fullBuildOutputPath);
        }, 30000);
    } catch (err) {
        setResultFailed(err.message);
    }
}

async function waitForResult(path: string): Promise<void> {
    console.log('Checking whether Unity process is still running...');
    const unityStillRunning = await UnityProcessMonitor.isUnityStillRunning();

    if (unityStillRunning) {
        console.log('Unity process still running. Will check again in 30 seconds...')

        // Check every minute whether the unity process is still running.
        setTimeout(() => {
            waitForResult(path);
        }, 30000);
    } else {
        console.log(`Unity process has finished. Checking for build output in ${path}`);
        if (checkForFilesInFolder(path)) {
            // If there is build output, the build succeeded.
            setResultSucceeded(`Unity Build task completed successfully.`);
        } else {
            // We don't know what happened at this point but the build failed most likely.
            setResultFailed('The Unity build task finished without results. Check editor logs for details.');
        }
    }
}

function getBuildConfiguration(): UnityBuildConfiguration {
    const unityBuildConfiguration: UnityBuildConfiguration = new UnityBuildConfiguration();
    unityBuildConfiguration.developmentBuild = tl.getBoolInput('developmentBuild');
    unityBuildConfiguration.runAPIUpdater = tl.getBoolInput('acceptApiUpdate');
    unityBuildConfiguration.disablePackageManager = tl.getBoolInput('noPackageManager');
    unityBuildConfiguration.buildScenes = tl.getInput('buildScenes');
    unityBuildConfiguration.buildTarget = (<any>UnityBuildTarget)[tl.getInput('buildTarget', true)];
    unityBuildConfiguration.projectPath = tl.getPathInput('unityProjectPath');

    if (tl.getInput('unityVersion') === 'project') {
        unityBuildConfiguration.unityVersion = fs.readFileSync(path.join(`${unityBuildConfiguration.projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
            .toString()
            .split(':')[1]
            .trim();
    } else {
        unityBuildConfiguration.unityVersion = tl.getInput('specificUnityVersion');
        if (isNullOrUndefined(unityBuildConfiguration.unityVersion)) {
            throw Error('Please specify a valid Unity version or use the project version option.')
        }
    }

    unityBuildConfiguration.unityHubEditorFolderLocation = process.env.UNITYHUB_EDITORS_FOLDER_LOCATION as string;
    if (isNullOrUndefined(unityBuildConfiguration.unityHubEditorFolderLocation) || unityBuildConfiguration.unityHubEditorFolderLocation === '') {
        throw Error('Expected UNITYHUB_EDITORS_FOLDER_LOCATION environment variable to be set!');
    }

    if (process.platform !== 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.WindowsStoreApps) {
        throw Error('Cannot build an UWP project on a Mac.');
    } else if (process.platform === 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.iOS) {
        throw Error('Cannot build an iOS/tvOS project on a Windows PC.');
    }

    return unityBuildConfiguration;
}

function checkForFilesInFolder(path: string): boolean {
    const files: string[] = fs.readdirSync(path);
    return !isNullOrUndefined(files) && files.length > 0;
}

function setResultFailed(msg: string): void {
    tl.setResult(tl.TaskResult.Failed, msg);
}

function setResultSucceeded(msg: string): void {
    tl.setResult(tl.TaskResult.Succeeded, msg);
}

run();