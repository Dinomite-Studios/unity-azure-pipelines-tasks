import tl = require('azure-pipelines-task-lib/task');
import path = require('path');
import { OS, Utilities } from '@dinomite-studios/unity-azure-pipelines-tasks-lib/';
import { getProjectUnityVersion, getUnityHubExecutablePath } from './utilities';
import { macOSArchitectureVariableName } from './unity-setup';

export class UnityEditorInstall {
    public static run(): number {
        const unityHubExecutablePath = getUnityHubExecutablePath();
        const editorVersion = getProjectUnityVersion();

        if (!editorVersion) {
            return -1;
        }

        const installEditorCmd = tl.tool(unityHubExecutablePath!)
            .arg('--')
            .arg('--headless')
            .arg('install')
            .arg('--version').arg(editorVersion!.version)
            .arg('--changeset').arg(editorVersion!.revision!);

        if (Utilities.getOS() === OS.MacOS) {
            const macOSArchitectureOption = tl.getInput(macOSArchitectureVariableName, true)!
            installEditorCmd.arg('--architecture').arg(macOSArchitectureOption);
        }

        const result = installEditorCmd.execSync();

        // The Unity Hub CLI returns 1 instead of 0 even in case of success,
        // This seems to be by design for whatever reason.
        // See https://issuetracker.unity3d.com/issues/hub-errorlevel-value-is-set-to-1-when-executing-hub-cli-commands
        if (result.code !== 1) {
            return result.code;
        }

        return 0;
    }
}