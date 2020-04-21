import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { UnityBuildTarget } from './unity-build-target.enum';
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';
import { UnityToolRunner, UnityPathTools } from '@dinomite-studios/unity-utilities';
import { UnityProjectVersion, ProjectVersionService } from '@dinomite-studios/unity-project-version';

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
        const logFilePath = path.join(repositoryLocalPath, 'UnityBuildLog.log');

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

        if (tl.getInput('commandLineArgumentsMode', true) === 'default') {
            if (tl.getBoolInput('noPackageManager')) {
                unityCmd.arg('-noUpm');
            }

            if (tl.getBoolInput('acceptApiUpdate')) {
                unityCmd.arg('-accept-apiupdate');
            }

            if (tl.getBoolInput('noGraphics')) {
                unityCmd.arg('-nographics');
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
            unityCmd.line(tl.getInput('customCommandLineArguments')!);
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

function getBuildConfiguration(): UnityBuildConfiguration {
    const unityBuildConfiguration: UnityBuildConfiguration = new UnityBuildConfiguration();
    unityBuildConfiguration.outputFileName = tl.getInput('outputFileName');
    unityBuildConfiguration.developmentBuild = tl.getBoolInput('developmentBuild');
    unityBuildConfiguration.buildScenes = tl.getInput('buildScenes');
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

async function getUnityEditorVersion(): Promise<UnityProjectVersion> {
    const projectPath = tl.getPathInput('unityProjectPath') || '';
    console.log(`${tl.loc('ProjectPathInfo')} ${projectPath}`);

    const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
    if (unityVersion.error) {
        const error = `${tl.loc('FailGetUnityEditorVersion')} | ${unityVersion.error}`;
        console.error(error);
        throw new Error(error);
    }

    const successGetVersionLog = `${tl.loc('SuccessGetUnityEditorVersion')} ${unityVersion.version}, alpha=${unityVersion.isAlpha}, beta=${unityVersion.isBeta}`;
    console.log(successGetVersionLog);
    if (unityVersion.isAlpha || unityVersion.isBeta) {
        console.warn(tl.loc('WarningAlphaBetaVersion'));
    }

    return unityVersion;
}

run();