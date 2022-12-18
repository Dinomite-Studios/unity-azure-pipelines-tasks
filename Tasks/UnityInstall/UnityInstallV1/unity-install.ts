import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { getUnityEditorVersion } from './unity-build.shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

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

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
function run() {
    try {
        // Setup and read inputs.
        const unityHubExecutablePath = 'C:\\Program Files\\Unity Hub\\Unity Hub.exe';
        const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
        const installAndroidModule = tl.getBoolInput(androidModuleInputVariableName, false) || false;
        const installIOSModule = tl.getBoolInput(iOSModuleInputVariableName, false) || false;
        const installTvOSModule = tl.getBoolInput(tvOSModuleInputVariableName, false) || false;
        const installMacMonoModule = tl.getBoolInput(macMonoModuleInputVariableName, false) || false;
        const installWindowsModule = tl.getBoolInput(windowsModuleInputVariableName, false) || false;
        const installUwpModule = tl.getBoolInput(uwpModuleInputVariableName, false) || false;
        const installWebGLModule = tl.getBoolInput(webGLModuleInputVariableName, false) || false;

        var version = '';
        var revision = '';

        if (versionSelectionMode === 'specify') {
            version = tl.getPathInput(versionInputVariableName, true)!;
            revision = tl.getPathInput(revisionInputVariableName, true)!;
        } else {
            const projectVersion = getUnityEditorVersion();
            version = projectVersion.info!.version;
            revision = projectVersion.info!.revision!;
        }

        console.log(`${tl.loc('installVersionInfo')} ${version} (${revision})`);

        // Step 1: Install the requested Unity editor.
        const installEditorCmd = tl.tool(unityHubExecutablePath)
            .arg('--')
            .arg('--headless')
            .arg('install')
            .arg('--version').arg(version)
            .arg('--changeset').arg(revision);
        installEditorCmd.exec();

        // Step 2: If any additional modules are requested, install those as well.
        if (installAndroidModule ||
            installIOSModule ||
            installTvOSModule ||
            installMacMonoModule ||
            installWindowsModule ||
            installUwpModule ||
            installWebGLModule) {
            const installModulesCmd = tl.tool(unityHubExecutablePath)
                .arg('--')
                .arg('--headless')
                .arg('install-modules')
                .arg('--version').arg(version)
                .arg('--childModules')
                .arg('--module');

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

            installModulesCmd.exec();
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