import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { UnityBuildTarget } from './unity-build-target.enum';
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityBuildConfiguration = getBuildConfiguration();
        const unityEditorsPath = getUnityEditorsPath();

        // Make sure the selected editor exists
        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        // Build the output path where Unity output should be saved to
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath');
        const buildOutputDir = UnityBuildScriptHelper.getBuildOutputDirectory(unityBuildConfiguration.buildTarget);
        const fullBuildOutputPath = path.join(`${unityBuildConfiguration.projectPath}`, `${buildOutputDir}`)

        // If clean was specified by the user, delete the existing output directory, if it exists
        if (tl.getVariable('Build.Repository.Clean') === 'true') {
            fs.removeSync(fullBuildOutputPath);
        }

        // No matter if clean build or not, make sure the output diretory exists
        tl.mkdirP(fullBuildOutputPath);
        tl.checkPath(fullBuildOutputPath, 'Build Output Directory');
        tl.setVariable('buildOutputPath', fullBuildOutputPath.substr(repositoryLocalPath.length + 1));

        // Build Unity executable path depending on agent OS
        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');

        // Build the base Unity command to execute
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(UnityBuildTarget[unityBuildConfiguration.buildTarget])
            .arg('-projectPath').arg(unityBuildConfiguration.projectPath)
            .argIf(tl.getInput('additionalCmdArgs') !== '', tl.getInput('additionalCmdArgs'));

        // Perform setup depending on build script type selected
        const buildScriptType = tl.getInput('buildScriptType');
        if (buildScriptType === 'default' || buildScriptType === 'inline') {
            // For default or inline selection we need to make sure to place our default or the user's
            // entered build script inside the Untiy project.
            const isDefault = buildScriptType === 'default';

            // Create a C# script file in a Editor folder at the root Assets directory level. Then write
            // the default or the user's script into it. Unity will then compile it on launch and make sure it's available.
            const projectAssetsEditorFolderPath = path.join(`${unityBuildConfiguration.projectPath}`, 'Assets', 'Editor');
            tl.mkdirP(projectAssetsEditorFolderPath);
            tl.cd(projectAssetsEditorFolderPath);
            tl.writeFile('AzureDevOps.cs', isDefault
                ? UnityBuildScriptHelper.getUnityEditorBuildScriptContent(unityBuildConfiguration)
                : tl.getInput('inlineBuildScript'));
            tl.cd(unityBuildConfiguration.projectPath);

            // Tell Unity which method to execute for build.
            unityCmd.arg('-executeMethod').arg(isDefault ? 'AzureDevOps.PerformBuild' : tl.getInput('scriptExecuteMethod'));
        } else if (buildScriptType === 'existing') {
            // If the user already has an existing build script we only need the method to execute.
            unityCmd.arg('-executeMethod').arg(tl.getInput('scriptExecuteMethod'));
        }
        else {
            throw Error('Invalid build script type specified.')
        }

        // Execute build
        const result = unityCmd.execSync();
        setResultSucceeded(`Unity Build finished successfully with exit code ${result.code}`);
    } catch (err) {
        setResultFailed(err.message);
    }
}

function getBuildConfiguration(): UnityBuildConfiguration {
    const unityBuildConfiguration: UnityBuildConfiguration = new UnityBuildConfiguration();
    unityBuildConfiguration.outputFileName = tl.getInput('outputFileName');
    unityBuildConfiguration.buildTarget = (<any>UnityBuildTarget)[tl.getInput('buildTarget', true)];
    unityBuildConfiguration.projectPath = tl.getPathInput('unityProjectPath');

    let unityVersion = fs.readFileSync(path.join(`${unityBuildConfiguration.projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
        .toString()
        .split(':')[1]
        .trim();

    const revisionVersionIndex = unityVersion.indexOf('m_EditorVersionWithRevision');
    if (revisionVersionIndex > -1) {
        // The ProjectVersion.txt contains a revision version. We need to drop it.
        unityVersion = unityVersion.substr(0, revisionVersionIndex).trim();
    }

    unityBuildConfiguration.unityVersion = unityVersion;

    if (isNullOrUndefined(unityBuildConfiguration.unityVersion) || unityBuildConfiguration.unityVersion === '') {
        throw Error('Failed to get project version from ProjectVersion.txt file.');
    }

    if (process.platform !== 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.WindowsStoreApps) {
        throw Error('Cannot build an UWP project on a Mac.');
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

function setResultFailed(msg: string): void {
    tl.setResult(tl.TaskResult.Failed, msg);
}

function setResultSucceeded(msg: string = ''): void {
    tl.setResult(tl.TaskResult.Succeeded, msg);
}

run();