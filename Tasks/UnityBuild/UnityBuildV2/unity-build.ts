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
        const unityEditorsPath = getUnityEditorsPath();

        // Make sure the selected editor exists.
        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        // Here we make sure the build output directory exists and we can export Unity artifacts
        // there. If the folder already exists, we'll delete it so we get a clean build.
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath');
        const buildOutputDir = UnityBuildScriptHelper.getBuildOutputDirectory(unityBuildConfiguration.buildTarget);
        const fullBuildOutputPath = path.join(`${unityBuildConfiguration.projectPath}`, `${buildOutputDir}`)
        fs.removeSync(fullBuildOutputPath);
        tl.mkdirP(fullBuildOutputPath);
        tl.checkPath(fullBuildOutputPath, 'Build Output Directory');
        tl.setVariable('buildOutputPath', fullBuildOutputPath.substr(repositoryLocalPath.length + 1));

        // Mandatory set of command line arguments for Unity.
        // -batchmode will open Unity without UI
        // -buildTarget sets the configured target platform
        // -projectPath tell Unity which project to load
        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(UnityBuildTarget[unityBuildConfiguration.buildTarget])
            .arg('-projectPath').arg(unityBuildConfiguration.projectPath);

        if (tl.getInput('commandLineArgumentsMode', true) === 'default') {
            if (tl.getBoolInput('noPackageManager')) {
                unityCmd.arg('-noUpm');
            }

            if (tl.getBoolInput('acceptApiUpdate')) {
                unityCmd.arg('-accept-apiupdate');
            }

            // When using the default command line arguments set, we rely on having a C# script
            // in the Unity project to trigger the build. This C# script is generated here based on the
            // tasks configuration and then "injected" into the project before Unity launches. This way it will
            // be available to us and we can Invoke it using the command line.
            const projectAssetsEditorFolderPath = path.join(`${unityBuildConfiguration.projectPath}`, 'Assets', 'Editor');
            tl.mkdirP(projectAssetsEditorFolderPath);
            tl.cd(projectAssetsEditorFolderPath);
            tl.writeFile('AzureDevOps.cs', UnityBuildScriptHelper.getUnityEditorBuildScriptContent(unityBuildConfiguration));
            tl.cd(unityBuildConfiguration.projectPath);
            unityCmd.arg('-executeMethod');
            unityCmd.arg('AzureDevOps.PerformBuild');
        } else {
            // The user has configured to use his own custom command line arguments.
            // In this case, just append them to the mandatory set of arguments and we're done.
            unityCmd.line(tl.getInput('customCommandLineArguments'));
        }

        // Now we are ready to execute the Unity command line.
        // Unfortuntely, the command line will return before the unity build has actually finished, and eventually
        // give us a false positive. The solution is currently to observe whether the Unity process is still running,
        // and when done, check whether there are output files.
        unityCmd.execSync();

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
        if (isFolderNotEmpty(path)) {
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
    unityBuildConfiguration.outputFileName = tl.getInput('outputFileName');
    unityBuildConfiguration.developmentBuild = tl.getBoolInput('developmentBuild');
    unityBuildConfiguration.buildScenes = tl.getInput('buildScenes');
    unityBuildConfiguration.buildTarget = (<any>UnityBuildTarget)[tl.getInput('buildTarget', true)];
    unityBuildConfiguration.projectPath = tl.getPathInput('unityProjectPath');
    unityBuildConfiguration.unityVersion = fs.readFileSync(path.join(`${unityBuildConfiguration.projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
        .toString()
        .split(':')[1]
        .trim();

    if (isNullOrUndefined(unityBuildConfiguration.unityVersion) || unityBuildConfiguration.unityVersion === '') {
        throw Error('Failed to get project version from ProjectVersion.txt file.');
    }

    if (process.platform !== 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.WindowsStoreApps) {
        throw Error('Cannot build an UWP project on a Mac.');
    } else if (process.platform === 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.iOS) {
        throw Error('Cannot build an iOS/tvOS project on a Windows PC.');
    }

    return unityBuildConfiguration;
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
        if (isNullOrUndefined(environmentVariablePath) || environmentVariablePath === '') {
            throw Error('Expected UNITYHUB_EDITORS_FOLDER_LOCATION environment variable to be set!');
        }

        return environmentVariablePath;
    } else {
        const customPath = tl.getInput('customUnityEditorsPath');
        if (isNullOrUndefined(customPath) || customPath === '') {
            throw Error('Expected custom editors folder location to be set. Please the task configuration.');
        }

        return customPath;
    }
}

function isFolderNotEmpty(path: string): boolean {
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