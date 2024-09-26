import tl = require('azure-pipelines-task-lib/task');
import { UnityPathTools, UnityVersionInfo, UnityVersionInfoResult, UnityVersionTools } from '@dinomite-studios/unity-azure-pipelines-tasks-lib/';
import { customUnityHubExecutableLocationVariableName, revisionInputVariableName, unityHubExecutableLocationVariableName, versionInputVariableName, versionSelectionModeVariableName } from './unity-setup';

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
    console.log(`${tl.loc('projectPathInfo')} ${projectPath}`);

    const unityVersion = UnityVersionTools.determineProjectVersionFromFile(projectPath);
    if (unityVersion.error) {
        const error = `${tl.loc('failGetUnityEditorVersion')} | ${unityVersion.error}`;
        console.error(error);
        throw new Error(error);
    }

    const successGetVersionLog = `${tl.loc('successGetUnityEditorVersion')} ${unityVersion.info!.version}${unityVersion.info!.revision ? `, revision=${unityVersion.info!.revision}` : ''}, alpha=${unityVersion.info!.isAlpha}, beta=${unityVersion.info!.isBeta}`;
    console.log(successGetVersionLog);

    if (unityVersion.info!.isAlpha || unityVersion.info!.isBeta) {
        console.warn(tl.loc('warningAlphaBetaVersion'));
    }

    return unityVersion;
}

export function getUnityHubExecutablePath(): string | undefined {
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

    return unityHubExecutablePath;
}