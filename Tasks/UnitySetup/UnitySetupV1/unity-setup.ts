import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { UnityPathTools, UnityVersionInfoResult, UnityVersionTools } from '@dinomite-studios/unity-azure-pipelines-tasks-lib/';

// Input variables.
const versionSelectionModeVariableName = "versionSelectionMode";
const versionInputVariableName = 'version';
const revisionInputVariableName = 'revision';
const androidModuleInputVariableName = 'installAndroidModule';
const iOSModuleInputVariableName = 'installIOSModule';
const tvOSModuleInputVariableName = 'installTVOSModule';
const macMonoModuleInputVariableName = 'installMacMonoModule';
const windowsModuleInputVariableName = 'installWindowsIL2CPPModule';
const uwpModuleInputVariableName = 'installUWPModule';
const webGLModuleInputVariableName = 'installWebGLModule';
const installChildModulesInputVariableName = 'installChildModules';
const unityHubExecutableLocationVariableName = 'unityHubExecutableLocation';
const customUnityHubExecutableLocation = 'customUnityHubExecutableLocation';

async function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // We either use the default installation location of the Unity Hub or if the user
        // decided to customize it, we use the user's specified location.
        console.log(tl.loc('unityHubLookUpInfo'));
        let unityHubExecutablePath: string | undefined = undefined;
        const unityHubLookupOption = tl.getInput(unityHubExecutableLocationVariableName, true)!
        if (unityHubLookupOption === 'specify') {
            unityHubExecutablePath = tl.getPathInput(customUnityHubExecutableLocation);
        } else {
            unityHubExecutablePath = UnityPathTools.getUnityHubPath();
        }

        if (!unityHubExecutablePath) {
            console.error(tl.loc('unityHubLocationNotSpecified'));
            tl.setResult(tl.TaskResult.Failed, tl.loc('unityHubLocationNotSpecified'));
        } else {
            console.log(`${tl.loc('unityHubLocationInfo')} ${unityHubExecutablePath})`)
        }

        // Next up we need to know what version of the Unity editor to install.
        // This can either be the version found in the project's settings or it can be a
        // user specified version.
        let version = '';
        let revision = '';

        const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
        if (versionSelectionMode === 'specify') {
            version = tl.getInput(versionInputVariableName, true)!;
            revision = tl.getInput(revisionInputVariableName, true)!;
        } else {
            const projectVersion = getUnityEditorVersion();
            version = projectVersion.info!.version;
            revision = projectVersion.info!.revision!;
        }

        console.log(`${tl.loc('installVersionInfo')} ${version} (${revision})`);

        const installAndroidModule = tl.getBoolInput(androidModuleInputVariableName, false) || false;
        const installIOSModule = tl.getBoolInput(iOSModuleInputVariableName, false) || false;
        const installTvOSModule = tl.getBoolInput(tvOSModuleInputVariableName, false) || false;
        const installMacMonoModule = tl.getBoolInput(macMonoModuleInputVariableName, false) || false;
        const installWindowsModule = tl.getBoolInput(windowsModuleInputVariableName, false) || false;
        const installUwpModule = tl.getBoolInput(uwpModuleInputVariableName, false) || false;
        const installWebGLModule = tl.getBoolInput(webGLModuleInputVariableName, false) || false;
        const installChildModules = tl.getBoolInput(installChildModulesInputVariableName, false) || true;

        // Step 1: Install the requested Unity editor.
        const installEditorCmd = tl.tool(unityHubExecutablePath!)
            .arg('--')
            .arg('--headless')
            .arg('install')
            .arg('--version').arg(version)
            .arg('--changeset').arg(revision);
        installEditorCmd.execSync();

        // Step 2: If any additional modules are requested, install those as well.
        if (installAndroidModule ||
            installIOSModule ||
            installTvOSModule ||
            installMacMonoModule ||
            installWindowsModule ||
            installUwpModule ||
            installWebGLModule) {
            const installModulesCmd = tl.tool(unityHubExecutablePath!)
                .arg('--')
                .arg('--headless')
                .arg('install-modules')
                .arg('--version').arg(version);

            if (installChildModules) {
                installModulesCmd.arg('--childModules')
            }

            installModulesCmd.arg('--module');

            if (installAndroidModule) {
                installModulesCmd.arg('android');
            }

            if (installIOSModule) {
                installModulesCmd.arg('ios');
            }

            if (installTvOSModule) {
                installModulesCmd.arg('appletv');
            }

            if (installMacMonoModule) {
                installModulesCmd.arg('mac-mono');
            }

            if (installWindowsModule) {
                installModulesCmd.arg('windows-il2cpp');
            }

            if (installUwpModule) {
                installModulesCmd.arg('universal-windows-platform');
            }

            if (installWebGLModule) {
                installModulesCmd.arg('webgl');
            }

            await installModulesCmd.execAsync();
        }

        // Set task result succeeded.
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('successUnityInstall'));
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
    const projectPath = tl.getPathInput('unityProjectPath') || '';
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