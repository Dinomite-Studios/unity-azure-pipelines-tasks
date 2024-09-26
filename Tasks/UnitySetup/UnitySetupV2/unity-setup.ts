import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import { UnityEditorInstall } from './unity-editor-install';
import { UnityModulesInstall } from './unity-modules-install';
import { UnityEditorConfiguration } from './unity-editor-configuration';
import { UnityEditorActivation } from './unity-editor-activation';

// Input variables
export const versionSelectionModeVariableName = "versionSelectionMode";
export const versionInputVariableName = 'version';
export const revisionInputVariableName = 'revision';
export const usernameInputVariableName = 'username';
export const passwordInputVariableName = 'password';
export const serialInputVariableName = 'serial';
export const unityHubExecutableLocationVariableName = 'unityHubExecutableLocation';
export const customUnityHubExecutableLocationVariableName = 'customUnityHubExecutableLocation';
export const macOSArchitectureVariableName = 'macOSArchitecture';
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
export const deactivateSeatOnCompleteInputVariableName = 'deactivateSeatOnComplete';

function run() {
    try {
        // Configure localization.
        tl.setResourcePath(path.join(__dirname, 'task.json'));

        const installResult = UnityEditorInstall.run();
        if (installResult !== 0) {
            const log = `${tl.loc('taskResultFailedEditorInstall')} ${installResult}`
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        const installModulesResult = UnityModulesInstall.run();
        if (installModulesResult !== 0) {
            const log = `${tl.loc('taskResultFailedModulesInstall')} ${installResult}`
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        const unityActivationResult = UnityEditorActivation.run();
        if (unityActivationResult !== 0) {
            const log = `${tl.loc('taskResultFailedEditorActivation')} ${installResult}`
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        const configurationResult = UnityEditorConfiguration.run();
        if (configurationResult !== 0) {
            const log = `${tl.loc('taskResultFailedEditorConfig')} ${installResult}`
            console.error(log);
            tl.setResult(tl.TaskResult.Failed, log);
            return;
        }

        // Set task result succeeded.
        const log = tl.loc('taskResultSuccessUnitySetup');
        console.log(log);
        tl.setResult(tl.TaskResult.Succeeded, tl.loc('taskResultSuccessUnitySetup'));
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