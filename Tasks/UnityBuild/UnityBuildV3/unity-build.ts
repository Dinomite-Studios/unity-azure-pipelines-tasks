import path = require('path');
import taskLib = require('azure-pipelines-task-lib/task');
import fileSystem = require('fs-extra');
import nodeChildProcess = require('child_process');
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';

taskLib.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityBuildConfiguration = getBuildConfiguration();
        const unityEditorsPath = getUnityEditorsPath();

        // Make sure the selected editor exists
        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`);
        taskLib.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        // If clean was specified by the user, delete the existing output directory, if it exists
        if (taskLib.getVariable('Build.Repository.Clean') === 'true') {
            fileSystem.removeSync(unityBuildConfiguration.outputPath);
        }

        // No matter if clean build or not, make sure the output diretory exists
        taskLib.mkdirP(unityBuildConfiguration.outputPath);
        taskLib.checkPath(unityBuildConfiguration.outputPath, 'Build Output Directory');

        // Build Unity executable path depending on agent OS
        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');

        // Build the base Unity command to execute
        const unityCmd = taskLib.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(unityBuildConfiguration.buildTarget)
            .arg('-projectPath').arg(unityBuildConfiguration.projectPath);

        const additionalArgs = taskLib.getInput('additionalCmdArgs');
        if (additionalArgs !== '') {
            unityCmd.line(additionalArgs);
        }

        // Perform setup depending on build script type selected
        const buildScriptType = taskLib.getInput('buildScriptType');
        if (buildScriptType === 'default' || buildScriptType === 'inline') {
            // For default or inline selection we need to make sure to place our default or the user's
            // entered build script inside the Untiy project.
            const isDefault = buildScriptType === 'default';

            // Create a C# script file in a Editor folder at the root Assets directory level. Then write
            // the default or the user's script into it. Unity will then compile it on launch and make sure it's available.
            const projectAssetsEditorFolderPath = path.join(`${unityBuildConfiguration.projectPath}`, 'Assets', 'Editor');
            taskLib.mkdirP(projectAssetsEditorFolderPath);
            taskLib.cd(projectAssetsEditorFolderPath);
            taskLib.writeFile('AzureDevOps.cs', isDefault
                ? UnityBuildScriptHelper.getUnityEditorBuildScriptContent(unityBuildConfiguration)
                : taskLib.getInput('inlineBuildScript'));
            taskLib.cd(unityBuildConfiguration.projectPath);

            // Tell Unity which method to execute for build.
            unityCmd.arg('-executeMethod').arg(isDefault ? 'AzureDevOps.PerformBuild' : taskLib.getInput('scriptExecuteMethod'));
        } else {
            // Must be build script type "existing".
            // If the user already has an existing build script we only need the method to execute.
            unityCmd.arg('-executeMethod').arg(taskLib.getInput('scriptExecuteMethod'));
        }

        // Execute build
        const child = nodeChildProcess.spawn(unityCmd);
        child.on('exit', (code: number, signal: string) => {
            if (code === 0) {
                taskLib.setResult(taskLib.TaskResult.Succeeded, `Unity Build finished successfully with exit code ${code}`);
            } else {
                taskLib.setResult(taskLib.TaskResult.Failed, `Unity Build failed with exit code ${code}`)
            }
        });
    } catch (err) {
        taskLib.setResult(taskLib.TaskResult.Failed, err.message);
    }
}

function getBuildConfiguration(): UnityBuildConfiguration {
    const outputFileName = taskLib.getInput('outputFileName');
    const buildTarget = taskLib.getInput('buildTarget', true);
    const projectPath = taskLib.getPathInput('unityProjectPath');
    const outputPath = taskLib.getPathInput('outputPath');

    let unityVersion = fileSystem.readFileSync(path.join(`${projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
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
    const editorsPathMode = taskLib.getInput('unityEditorsPathMode', true);
    if (editorsPathMode === 'unityHub') {
        const unityHubPath = process.platform === 'win32' ?
            path.join('C:', 'Program Files', 'Unity', 'Hub', 'Editor')
            : path.join('/', 'Applications', 'Unity', 'Hub', 'Editor');

        return unityHubPath;
    } else if (editorsPathMode === 'environmentVariable') {
        const environmentVariablePath = process.env.UNITYHUB_EDITORS_FOLDER_LOCATION as string;
        if (!environmentVariablePath) {
            throw Error('Expected UNITYHUB_EDITORS_FOLDER_LOCATION environment variable to be set!');
        }

        return environmentVariablePath;
    } else {
        const customPath = taskLib.getInput('customUnityEditorsPath');
        if (!customPath) {
            throw Error('Expected custom editors folder location to be set. Please check the task configuration.');
        }

        return customPath;
    }
}

run();