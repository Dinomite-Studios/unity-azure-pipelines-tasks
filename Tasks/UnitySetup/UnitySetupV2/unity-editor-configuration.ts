import { UnityPathTools, UnityPackageManagerTools } from '@dinomite-studios/unity-azure-pipelines-tasks-lib';
import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import { androidChildModulesInputVariableName, androidConfigureToolingInputVariableName, androidModuleInputVariableName } from './unity-setup';
import { getProjectUnityVersion } from './utilities';

export class UnityEditorConfiguration {
    public static run(): number {
        const installAndroidModule = tl.getBoolInput(androidModuleInputVariableName, false) || false;
        const installAndroidChildModules = tl.getBoolInput(androidChildModulesInputVariableName, false) || false;
        const configureAndroidTooling = tl.getBoolInput(androidConfigureToolingInputVariableName, false) || false;

        if (installAndroidModule && installAndroidChildModules && configureAndroidTooling) {
            const editorVersion = getProjectUnityVersion();
            const editorInstallationsPath = UnityPathTools.getUnityEditorsPath('default');
            const installedExecutablePath = UnityPathTools.getUnityExecutableFullPath(editorInstallationsPath, editorVersion!);

            // Create the dummy project at a temporary path.
            const temporaryProjectPath = tl.getVariable('Agent.TempDirectory')!
            const createTemporaryProjectCmd = tl.tool(installedExecutablePath)
                .arg('-batchmode')
                .arg('-nographics')
                .arg('-createProject').arg(temporaryProjectPath)
                .arg('-quit');

            let result = createTemporaryProjectCmd.execSync();
            if (result.code !== 0) {
                return result.code;
            }

            // Add the build scripts package to the dummy project. It contains the required
            // C# scripts that will make sure to initialize editor Android settings.
            UnityPackageManagerTools.addPackageToProject(temporaryProjectPath, 'games.dinomite.azurepipelines', 'https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks-build-scripts.git');
            const editorPath = UnityPathTools.getUnityEditorDirectory(editorInstallationsPath, editorVersion!);

            const androidJDKPath = path.join(editorPath, 'Data', 'PlaybackEngines', 'AndroidPlayer', 'OpenJDK');
            const androidSdkPath = path.join(editorPath, 'Data', 'PlaybackEngines', 'AndroidPlayer', 'SDK');
            const androidNdkPath = path.join(editorPath, 'Data', 'PlaybackEngines', 'AndroidPlayer', 'NDK');
            const androidGradlePath = path.join(editorPath, 'Data', 'PlaybackEngines', 'AndroidPlayer', 'Tools', 'gradle');

            // Open the project briefly and then quit again. The editor will initiaize Android settings upon opening the project.
            const openAndCloseProjectCmd = tl.tool(installedExecutablePath)
                .arg('-batchmode')
                .arg('-nographics')
                .arg('-projectPath').arg(temporaryProjectPath)
                .arg('-executeMethod').arg('InitializeAndroidTools.SetupAndroidToolsFromCmd')
                .arg('-overrideAndroidJdkPath').arg(androidJDKPath)
                .arg('-overrideAndroidSdkPath').arg(androidSdkPath)
                .arg('-overrideAndroidNdkPath').arg(androidNdkPath)
                .arg('-overrideAndroidGradlePath').arg(androidGradlePath);

            result = openAndCloseProjectCmd.execSync();
            if (result.code !== 0) {
                return result.code;
            }
        }

        return 0;
    }
}