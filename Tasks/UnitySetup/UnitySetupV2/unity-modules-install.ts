import { androidChildModulesInputVariableName, androidModuleInputVariableName, iOSModuleInputVariableName, linuxIL2CPPModuleInputVariableName, linuxMonoModuleInputVariableName, macIL2CPPModuleInputVariableName, macMonoModuleInputVariableName, tvOSModuleInputVariableName, uwpModuleInputVariableName, visionOSModuleInputVariableName, webGLModuleInputVariableName, windowsModuleInputVariableName } from "./unity-setup";
import tl = require('azure-pipelines-task-lib/task');
import { getProjectUnityVersion, getUnityHubExecutablePath } from "./utilities";

export class UnityModulesInstall {

    public static run(): number {
        const unityHubExecutablePath = getUnityHubExecutablePath();
        const editorVersion = getProjectUnityVersion();

        const installAndroidModule = tl.getBoolInput(androidModuleInputVariableName, false) || false;
        const installAndroidChildModules = tl.getBoolInput(androidChildModulesInputVariableName, false) || false;
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
                .arg('--version').arg(editorVersion!.version);

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

            const result = installModulesCmd.execSync();
            if (result.code !== 0) {
                return result.code;
            }
        }

        return 0;
    }
}