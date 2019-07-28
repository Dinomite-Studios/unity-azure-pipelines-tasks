import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';

tl.setResourcePath(path.join(__dirname, 'task.json'));

function run() {
    try {
        const unityBuildConfiguration = getBuildConfiguration();
        const unityEditorsPath = getUnityEditorsPath();

        // Make sure the selected editor exists
        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        // If clean was specified by the user, delete the existing output directory, if it exists
        if (tl.getVariable('Build.Repository.Clean') === 'true') {
            fs.removeSync(unityBuildConfiguration.outputPath);
        }

        // No matter if clean build or not, make sure the output diretory exists
        tl.mkdirP(unityBuildConfiguration.outputPath);
        tl.checkPath(unityBuildConfiguration.outputPath, 'Build Output Directory');

        // Build Unity executable path depending on agent OS
        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');

        // Build the base Unity command to execute
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(unityBuildConfiguration.buildTarget)
            .arg('-projectPath').arg(unityBuildConfiguration.projectPath);

        const additionalArgs = tl.getInput('additionalCmdArgs');
        if (additionalArgs !== '') {
            unityCmd.line(additionalArgs);
        }

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
        unityCmd.exec().then((exitCode) => {
            if (exitCode === 0) {
                tl.setResult(tl.TaskResult.Succeeded, `Unity Build finished successfully with exit code ${exitCode}`);
            } else {
                tl.setResult(tl.TaskResult.Failed, `Unity Build failed with exit code ${exitCode}`)
            }
        });
    } catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

function getBuildConfiguration(): UnityBuildConfiguration {
    const outputFileName = tl.getInput('outputFileName');
    const buildTarget = tl.getInput('buildTarget', true);
    const projectPath = tl.getPathInput('unityProjectPath');
    const outputPath = tl.getPathInput('outputPath');

    let unityVersion = fs.readFileSync(path.join(`${projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
        .toString()
        .split(':')[1]
        .trim();

    const revisionVersionIndex = unityVersion.indexOf('m_EditorVersionWithRevision');
    if (revisionVersionIndex > -1) {
        // The ProjectVersion.txt contains a revision version. We need to drop it.
        unityVersion = unityVersion.substr(0, revisionVersionIndex).trim();
    }

    if (!unityVersion) {
        throw Error('Failed to get project version from ProjectVersion.txt file.');
    }

    return {
        buildTarget: buildTarget,
        outputFileName: outputFileName,
        outputPath: outputPath,
        projectPath: projectPath,
        unityVersion: unityVersion
    }
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

run();