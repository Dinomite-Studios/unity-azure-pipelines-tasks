import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';
import { UnityToolRunner, UnityPathTools, UnityLogTools } from '@dinomite-studios/unity-utilities';
import { getUnityEditorVersion } from './unity-build-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityBuildConfiguration = await getBuildConfiguration();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityVersion = await getUnityEditorVersion();
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);
        const cleanBuild = tl.getVariable('Build.Repository.Clean');
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath')!;

        const logFilesDirectory = path.join(repositoryLocalPath!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityBuildLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);
        tl.setVariable('logsOutputPath', logFilesDirectory);

        // If clean was specified by the user, delete the existing output directory, if it exists
        if (cleanBuild === 'true') {
            fs.removeSync(unityBuildConfiguration.outputPath);
        }

        // No matter if clean build or not, make sure the output diretory exists
        tl.mkdirP(unityBuildConfiguration.outputPath);
        tl.checkPath(unityBuildConfiguration.outputPath, 'Build Output Directory');

        // Build the base Unity command to execute
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(unityBuildConfiguration.buildTarget)
            .arg('-projectPath').arg(unityBuildConfiguration.projectPath)
            .arg('-logfile').arg(logFilePath);

        const additionalArgs = tl.getInput('additionalCmdArgs') || '';
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
                : tl.getInput('inlineBuildScript')!);
            tl.cd(unityBuildConfiguration.projectPath);

            // Tell Unity which method to execute for build.
            unityCmd.arg('-executeMethod').arg(isDefault ? 'AzureDevOps.PerformBuild' : tl.getInput('scriptExecuteMethod')!);
        } else {
            // Must be build script type "existing".
            // If the user already has an existing build script we only need the method to execute.
            unityCmd.arg('-executeMethod').arg(tl.getInput('scriptExecuteMethod')!);
        }

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

async function getBuildConfiguration(): Promise<UnityBuildConfiguration> {
    const outputFileName = tl.getInput('outputFileName');
    const buildTarget = tl.getInput('buildTarget', true)!;
    const projectPath = tl.getPathInput('unityProjectPath') || '';
    const outputPath = tl.getPathInput('outputPath') || '';

    return {
        buildTarget: buildTarget,
        outputFileName: outputFileName ? outputFileName : 'drop',
        outputPath: outputPath,
        projectPath: projectPath
    };
}

run();