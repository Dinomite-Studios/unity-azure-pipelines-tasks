import tl = require('azure-pipelines-task-lib/task');
import { UnityVersionInfo, UnityVersionInfoResult, UnityVersionTools } from '@dinomite-studios/unity-azure-pipelines-tasks-lib/';
import { versionInputVariableName, versionSelectionModeVariableName } from './unity-cmd';

export function getProjectUnityVersion(): UnityVersionInfo | null | undefined {
    let editorVersion: UnityVersionInfo | null | undefined;

    const versionSelectionMode = tl.getInput(versionSelectionModeVariableName, true)!
    if (versionSelectionMode === 'specify') {
        editorVersion = {
            version: tl.getInput(versionInputVariableName, true)!,
            revision: undefined,
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