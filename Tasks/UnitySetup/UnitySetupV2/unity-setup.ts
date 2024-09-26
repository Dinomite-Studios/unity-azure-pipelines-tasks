import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { UnityEditorInstall } from './unity-editor-install';
import { UnityModulesInstall } from './unity-modules-install';
import { UnityEditorConfiguration } from './unity-editor-configuration';
import { UnityEditorActivation } from './unity-editor-activation';

// Input variables - General
export const versionSelectionModeVariableName = "versionSelectionMode";
export const versionInputVariableName = 'version';
export const revisionInputVariableName = 'revision';
export const unityHubExecutableLocationVariableName = 'unityHubExecutableLocation';
export const customUnityHubExecutableLocationVariableName = 'customUnityHubExecutableLocation';
export const macOSArchitectureVariableName = 'macOSArchitecture';

// Input variables - Modules (Platforms)
export const androidModuleInputVariableName = 'installAndroidModule';
export const androidChildModulesInputVariableName = 'installAndroidChildModules';
export const androidConfigureToolingInputVariableName = 'configureAndroidTooling';
export const iOSModuleInputVariableName = 'installIOSModule';
export const tvOSModuleInputVariableName = 'installTVOSModule';
export const visionOSModuleInputVariableName = 'installVisionOSModule';
export const linuxMonoModuleInputVariableName = 'installLinuxMonoModule';
export const linuxIL2CPPModuleInputVariableName = 'installLinuxIL2CPPModule';
export const macMonoModuleInputVariableName = 'installMacMonoModule';
export const macIL2CPPModuleInputVariableName = 'installMacIL2CPPModule';
export const windowsModuleInputVariableName = 'installWindowsIL2CPPModule';
export const uwpModuleInputVariableName = 'installUWPModule';
export const webGLModuleInputVariableName = 'installWebGLModule';

function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        // Step 1: Install the requested Unity editor.
        const installResult = UnityEditorInstall.run();
        if (installResult !== 0) {
            tl.setResult(tl.TaskResult.Failed, tl.loc('failUnityInstall'));
            return;
        }

        // Step 2: If any additional modules are requested, install those as well.
        const installModulesResult = UnityModulesInstall.run();
        if (installModulesResult !== 0) {
            tl.setResult(tl.TaskResult.Failed, tl.loc('failUnityInstall'));
            return;
        }

        // Step 3: If requested, activate a seat / license on the editor.
        const unityActivation = UnityEditorActivation.run();
        if (unityActivation !== 0) {
            tl.setResult(tl.TaskResult.Failed, tl.loc('failUnityInstall'));
            return;
        }

        // Step 4: If Android SDK & OpenJDK have been installed, we must
        // ensure the Unity editor settings are properly initalized with their paths.
        // Otherwise builds will fail since the modules, while installed, are not known
        // to the editor.
        const configurationResult = UnityEditorConfiguration.run();
        if (configurationResult !== 0) {
            tl.setResult(tl.TaskResult.Failed, tl.loc('failUnityInstall'));
            return;
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