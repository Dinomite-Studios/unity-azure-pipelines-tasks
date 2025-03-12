import tl = require('azure-pipelines-task-lib/task');
import { UnityPathTools, UnityVersionInfo, UnityVersionInfoResult, UnityVersionTools } from '@dinomite-studios/unity-azure-pipelines-tasks-lib/';
import { customUnityHubExecutableLocationVariableName, revisionInputVariableName, unityHubExecutableLocationVariableName, versionInputVariableName, versionSelectionModeVariableName } from './variables';

export function getProjectUnityVersion(): UnityVersionInfo | null | undefined {
    let editorVersion: UnityVersionInfo | null | undefined;

    const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
    if (versionSelectionMode === 'specify') {
        editorVersion = {
            version: tl.getInput(versionInputVariableName, true)!,
            revision: tl.getInput(revisionInputVariableName, true)!,
            isAlpha: false,
            isBeta: false
        };
    } else {
        const { info, error } = getProjectUnityEditorVersion();
        if (info) {
            editorVersion = info;
        } else {
            console.error(error);
        }
    }

    return editorVersion;
}

export function getProjectUnityEditorVersion(): UnityVersionInfoResult {
    const projectPath = tl.getPathInput('unityProjectPath') || '';
    const unityVersion = UnityVersionTools.determineProjectVersionFromFile(projectPath);

    if (unityVersion.error) {
        const error = `${tl.loc('failGetUnityEditorVersion')} | ${unityVersion.error}`;
        console.error(error);
        throw new Error(error);
    }

    return unityVersion;
}

export function getUnityHubExecutablePath(): string | undefined {
    // We either use the default installation location of the Unity Hub or if the user
    // decided to customize it, we use the user's specified location.
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
    }

    return unityHubExecutablePath;
}