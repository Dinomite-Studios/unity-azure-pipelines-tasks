import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import {
    UnityToolRunner,
    UnityPathTools,
    UnityVersionInfoResult,
    Utilities,
    UnityVersionTools,
    UnityPackageManagerTools
} from '@dinomite-studios/unity-azure-pipelines-tasks-lib';

// Input variables.
const outputFileNameInputVariableName = 'outputFileName';
const buildTargetInputVariableName = 'buildTarget';
const outputPathInputVariableName = 'outputPath';
const unityProjectPathInputVariableName = 'unityProjectPath';
const versionInputVariableName = 'version';
const buildScriptTypeInputVariableName = 'buildScriptType';
const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
const inlineBuildScriptInputVariableName = 'inlineBuildScript';
const scriptExecuteMethodInputVariableName = 'scriptExecuteMethod';
const additionalCmdArgsInputVariableName = 'additionalCmdArgs';
const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';
const cleanBuildInputVariableName = 'Build.Repository.Clean';
const versionSelectionModeVariableName = 'versionSelectionMode';
const signAppBundleInputVariableName = 'signAppBundle';
const keystoreNameInputVariableName = 'keystoreName';
const keystorePassInputVariableName = 'keystorePass';
const keystoreAliasNameInputVariableName = 'keystoreAliasName';
const keystoreAliasPassInputVariableName = 'keystoreAliasPass';
const buildAppBundleInputVariableName = 'buildAppBundle';

// Output variables.
const editorLogFilePathOutputVariableName = 'editorLogFilePath';

async function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Setup and read inputs.
        const outputFileName = tl.getInput(outputFileNameInputVariableName) ?? 'drop';
        const buildTarget = tl.getInput(buildTargetInputVariableName, true)!;
        const projectPath = tl.getPathInput(unityProjectPathInputVariableName) ?? '';
        const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
        const outputPath = tl.getPathInput(outputPathInputVariableName) ?? '';
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));

        let unityVersion: UnityVersionInfoResult;
        if (versionSelectionMode === 'specify') {
            let customVersion = tl.getInput(versionInputVariableName, true)!;
            unityVersion = {
                info: {
                    isAlpha: false,
                    isBeta: false,
                    version: customVersion,
                    revision: undefined
                },
                error: undefined
            }
        } else {
            unityVersion = getUnityEditorVersion();
        }

        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion.info!);
        const cleanBuild = tl.getVariable(cleanBuildInputVariableName);

        // Set output variable values.
        const logFilesDirectory = path.join(tl.getVariable('Agent.TempDirectory')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityBuildLog_${Utilities.getLogFileNameTimeStamp()}.log`);
        tl.setVariable(editorLogFilePathOutputVariableName, logFilePath);

        // If clean was specified by the user, delete the existing output directory, if it exists
        if (cleanBuild === 'true') {
            fs.removeSync(outputPath);
        }

        // No matter if clean build or not, make sure the output diretory exists
        tl.mkdirP(outputPath);
        tl.checkPath(outputPath, 'Build Output Directory');

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(buildTarget)
            .arg('-projectPath').arg(projectPath)
            .arg('-logfile').arg(logFilePath);

        const additionalArgs = tl.getInput(additionalCmdArgsInputVariableName) ?? '';
        if (additionalArgs !== '') {
            unityCmd.line(additionalArgs);
        }

        // Perform setup depending on build script type selected
        const buildScriptType = tl.getInput(buildScriptTypeInputVariableName) ?? 'default';

        if (buildScriptType === 'default') {
            // When using default build scripts we rely on a Utility package being installed to the project via the Unity Package Manager.
            // By adding it to the manifest before opening the project, Unity will load the package before trying to build the project.
            UnityPackageManagerTools.addPackageToProject(projectPath, 'games.dinomite.azurepipelines', 'https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks-build-scripts.git');
            unityCmd.arg('-executeMethod').arg('AzurePipelinesBuild.PerformBuild');
            unityCmd.arg('-outputFileName').arg(outputFileName);
            unityCmd.arg('-outputPath').arg(outputPath);

            if (tl.getBoolInput(signAppBundleInputVariableName)) {
                unityCmd.arg('-keystoreName').arg(tl.getPathInput(keystoreNameInputVariableName) ?? '');
                unityCmd.arg('-keystorePass').arg(tl.getInput(keystorePassInputVariableName) ?? '');
                unityCmd.arg('-keystoreAliasName').arg(tl.getInput(keystoreAliasNameInputVariableName) ?? '');

                // The alias password is optional and should only be passed, if not empty or undefined.
                const keystoreAliasPass = tl.getInput(keystoreAliasPassInputVariableName) ?? '';
                if (keystoreAliasPass) {
                    unityCmd.arg('-keystoreAliasPass').arg(keystoreAliasPass);
                }
            }

            if (tl.getBoolInput(buildAppBundleInputVariableName)) {
                unityCmd.arg('-buildAppBundle');
            }
        } else if (buildScriptType === 'inline') {
            // Create a C# script file in a Editor folder at the root Assets directory level. Then write
            // the default or the user's script into it. Unity will then compile it on launch and make sure it's available.
            const projectAssetsEditorFolderPath = path.join(`${projectPath}`, 'Assets', 'Editor');
            tl.mkdirP(projectAssetsEditorFolderPath);
            tl.cd(projectAssetsEditorFolderPath);
            tl.writeFile('AzureDevOps.cs', tl.getInput(inlineBuildScriptInputVariableName)!);
            tl.cd(projectPath);

            // Tell Unity which method to execute for build.
            unityCmd.arg('-executeMethod').arg(tl.getInput(scriptExecuteMethodInputVariableName)!);
        } else if (buildScriptType === 'existing') {
            // If the user already has an existing build script we only need the method to execute.
            unityCmd.arg('-executeMethod').arg(tl.getInput(scriptExecuteMethodInputVariableName)!).arg('-quit');
        } else {
            throw `Unsupported build script type ${buildScriptType}`
        }

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        // Unity process has finished. Set task result.
        if (result === 0) {
            const buildSuccessLog = tl.loc('buildSuccess');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('buildFailed')} ${result}`;
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

function getUnityEditorVersion(): UnityVersionInfoResult {
    const projectPath = tl.getPathInput('unityProjectPath') ?? '';
    console.log(`${tl.loc('projectPathInfo')} ${projectPath}`);

    const unityVersion = UnityVersionTools.determineProjectVersionFromFile(projectPath);
    if (unityVersion.error) {
        const error = `${tl.loc('failGetUnityEditorVersion')} | ${unityVersion.error}`;
        console.error(error);
        throw new Error(error);
    }

    const successGetVersionLog = `${tl.loc('successGetUnityEditorVersion')} ${unityVersion.info!.version}${unityVersion.info!.revision ? `, revision=${unityVersion.info!.revision}` : ''}, alpha=${unityVersion.info!.isAlpha}, beta=${unityVersion.info!.isBeta}`;
    console.log(successGetVersionLog);

    if (unityVersion.info!.isAlpha || unityVersion.info!.isBeta) {
        console.warn(tl.loc('warningAlphaBetaVersion'));
    }

    return unityVersion;
}

run();