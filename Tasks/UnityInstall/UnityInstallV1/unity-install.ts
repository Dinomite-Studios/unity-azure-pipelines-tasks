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

        const installEditorCmd = tl.tool(unityHubExecutablePath)
            .arg('--')
            .arg('--headless')
            .arg('install')
            .arg('--version').arg(version)
            .arg('--changeset').arg(revision);
        installEditorCmd.exec();

        const installModulesCmd = tl.tool(unityHubExecutablePath)
            .arg('--')
            .arg('--headless')
            .arg('install-modules')
            .arg('--version').arg(version)
            .arg('--childModules')
            .arg('--module');
        installModulesCmd.exec();

        //  Android Build Support: android
        //           Android SDK & NDK Tools: android-sdk-ndk-tools
        //           OpenJDK: android-open-jdk
        //           Microsoft Visual Studio Community 2017/2019: visualstudio
        //           iOS Build Support: ios
        //           tvOS Build Support: appletv
        //           Linux Build Support: linux
        //           Linux Build Support (Mono): linux-mono
        //           Linux Build Support (IL2CPP): linux-il2cpp
        //           Mac Build Support (Mono): mac-mono
        //           Windows Build Support (IL2CPP): windows-il2cpp
        //           Universal Windows Platform Build Support: universal-windows-platform
        //           UWP Build Support (IL2CPP): uwp-il2cpp
        //           UWP Build Support (.NET): uwp-.net
        //           WebGL Build Support: webgl
        //           Lumin OS (Magic Leap) Build Support: lumin
        //           Facebook Gameroom: facebookgameroom
        //           Facebook Gameroom Build Support: facebook-games
        //           Vuforia Augmented Reality Support: vuforia-ar

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