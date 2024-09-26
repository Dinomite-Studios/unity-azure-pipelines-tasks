import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { OS, UnityPackageManagerTools, UnityPathTools, Utilities } from '@dinomite-studios/unity-azure-pipelines-tasks-lib/';
import { getUnityEditorVersion } from './unity-build-shared';

// Input variables - General.
const versionSelectionModeVariableName = "versionSelectionMode";
const versionInputVariableName = 'version';
const revisionInputVariableName = 'revision';
const unityHubExecutableLocationVariableName = 'unityHubExecutableLocation';
const customUnityHubExecutableLocationVariableName = 'customUnityHubExecutableLocation';
const macOSArchitectureVariableName = 'macOSArchitecture';

// Input variables - Modules (Platforms)
const androidModuleInputVariableName = 'installAndroidModule';
const androidChildModulesInputVariableName = 'installAndroidChildModules';
const androidConfigureToolingInputVariableName = 'configureAndroidTooling';
const iOSModuleInputVariableName = 'installIOSModule';
const tvOSModuleInputVariableName = 'installTVOSModule';
const visionOSModuleInputVariableName = 'installVisionOSModule';
const linuxMonoModuleInputVariableName = 'installLinuxMonoModule';
const linuxIL2CPPModuleInputVariableName = 'installLinuxIL2CPPModule';
const macMonoModuleInputVariableName = 'installMacMonoModule';
const macIL2CPPModuleInputVariableName = 'installMacIL2CPPModule';
const windowsModuleInputVariableName = 'installWindowsIL2CPPModule';
const uwpModuleInputVariableName = 'installUWPModule';
const webGLModuleInputVariableName = 'installWebGLModule';

function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // We either use the default installation location of the Unity Hub or if the user
        // decided to customize it, we use the user's specified location.
        console.log(tl.loc('unityHubLookUpInfo'));
        let unityHubExecutablePath: string | undefined = undefined;
        const unityHubLookupOption = tl.getInput(unityHubExecutableLocationVariableName, true)!
        if (unityHubLookupOption === 'specify') {
            unityHubExecutablePath = tl.getPathInput(customUnityHubExecutableLocationVariableName);
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
        var version = '';
        var revision = '';

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
        const installAndroidChildModules = tl.getBoolInput(androidChildModulesInputVariableName, false) || false;
        const configureAndroidTooling = tl.getBoolInput(androidConfigureToolingInputVariableName, false) || false;
        const installIOSModule = tl.getBoolInput(iOSModuleInputVariableName, false) || false;
        const installTvOSModule = tl.getBoolInput(tvOSModuleInputVariableName, false) || false;
        const installVisionOSModule = tl.getBoolInput(visionOSModuleInputVariableName, false) || false;
        const installLinuxMonoModule = tl.getBoolInput(linuxMonoModuleInputVariableName, false) || false;
        const installLinuxIL2CPPModule = tl.getBoolInput(linuxIL2CPPModuleInputVariableName, false) || false;
        const installMacMonoModule = tl.getBoolInput(macMonoModuleInputVariableName, false) || false;
        const installMacIL2CPPModule = tl.getBoolInput(macIL2CPPModuleInputVariableName, false) || false;
        const installWindowsModule = tl.getBoolInput(windowsModuleInputVariableName, false) || false;
        const installUwpModule = tl.getBoolInput(uwpModuleInputVariableName, false) || false;
        const installWebGLModule = tl.getBoolInput(webGLModuleInputVariableName, false) || false;

        // Step 1: Install the requested Unity editor.
        const installEditorCmd = tl.tool(unityHubExecutablePath!)
            .arg('--')
            .arg('--headless')
            .arg('install')
            .arg('--version').arg(version)
            .arg('--changeset').arg(revision);

        if (Utilities.getOS() === OS.MacOS) {
            const macOSArchitectureOption = tl.getInput(macOSArchitectureVariableName, true)!
            installEditorCmd.arg('--architecture').arg(macOSArchitectureOption);
        }

        installEditorCmd.execSync();

        // Step 2: If any additional modules are requested, install those as well.
        if (installAndroidModule ||
            installIOSModule ||
            installTvOSModule ||
            installVisionOSModule ||
            installLinuxMonoModule ||
            installLinuxIL2CPPModule ||
            installMacMonoModule ||
            installMacIL2CPPModule ||
            installWindowsModule ||
            installUwpModule ||
            installWebGLModule) {
            const installModulesCmd = tl.tool(unityHubExecutablePath!)
                .arg('--')
                .arg('--headless')
                .arg('install-modules')
                .arg('--version').arg(version);

            if (installAndroidModule && installAndroidChildModules) {
                installModulesCmd.arg('--childModules');
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

            if (installVisionOSModule) {
                installModulesCmd.arg('visionOS');
            }

            if (installLinuxMonoModule) {
                installModulesCmd.arg('linux-mono');
            }

            if (installLinuxIL2CPPModule) {
                installModulesCmd.arg('linux-il2cpp');
            }

            if (installMacMonoModule) {
                installModulesCmd.arg('mac-mono');
            }

            if (installMacIL2CPPModule) {
                installModulesCmd.arg('mac-il2cpp');
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

            installModulesCmd.execSync();
        }

        // Step 3: If Android SDK & OpenJDK have been installed, we must
        // ensure the Unity editor settings are properly initalized with their paths.
        // Otherwise builds will fail since the modules, while installed, are not known
        // to the editor.
        if (installAndroidModule && installAndroidChildModules && configureAndroidTooling) {
            console.log(tl.loc('configureAndroidToolingStart'));

            const editorInstallationsPath = UnityPathTools.getUnityEditorsPath('default');
            const installedExecutablePath = UnityPathTools.getUnityExecutableFullPath(editorInstallationsPath, {
                version: version,
                revision: revision,
                isAlpha: false,
                isBeta: false
            });

            // Step 3.1: Create the dummy project at a temporary path.
            const temporaryProjectPath = tl.getVariable('Agent.TempDirectory')!
            const createTemporaryProjectCmd = tl.tool(installedExecutablePath)
                .arg('-batchmode')
                .arg('-nographics')
                .arg('-createProject').arg(temporaryProjectPath)
                .arg('-quit');

            let result = createTemporaryProjectCmd.execSync();

            if (result.code === 0) {
                // Step 3.2: Add the build scripts package to the dummy project. It contains the required
                // C# scripts that will make sure to initialize editor Android settings.
                UnityPackageManagerTools.addPackageToProject(temporaryProjectPath, 'games.dinomite.azurepipelines', 'https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks-build-scripts.git');
                const editorPath = UnityPathTools.getUnityEditorDirectory(editorInstallationsPath, {
                    version: version,
                    revision: revision,
                    isAlpha: false,
                    isBeta: false
                });

                const androidJDKPath = path.join(editorPath, 'Data\PlaybackEngines\AndroidPlayer\OpenJDK');
                const androidSdkPath = path.join(editorPath, 'Data\PlaybackEngines\AndroidPlayer\SDK');
                const androidNdkPath = path.join(editorPath, 'Data\PlaybackEngines\AndroidPlayer\NDK');
                const androidGradlePath = path.join(editorPath, 'Data\PlaybackEngines\AndroidPlayer\Tools\gradle');

                // Step 3.3: Open the project briefly and then quit again. The editor will initiaize Android settings upon opening the project.
                const openAndCloseProjectCmd = tl.tool(installedExecutablePath)
                    .arg('-batchmode')
                    .arg('-nographics')
                    .arg('-projectPath').arg(temporaryProjectPath)
                    .arg('-quit')
                    .arg('-overrideAndroidJdkPath').arg(androidJDKPath)
                    .arg('-overrideAndroidSdkPath').arg(androidSdkPath)
                    .arg('-overrideAndroidNdkPath').arg(androidNdkPath)
                    .arg('-overrideAndroidGradlePath').arg(androidGradlePath);

                result = openAndCloseProjectCmd.execSync();

                if (result.code === 0) {
                    console.log(tl.loc('configureAndroidToolingSuccess'));
                } else {
                    console.log(tl.loc('configureAndroidToolingFailed'));
                }
            } else {
                console.log(tl.loc('configureAndroidToolingFailed'));
            }
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

run();