import tl = require('azure-pipelines-task-lib/task');
import {
    UnityVersionTools,
    UnityVersionInfo
} from '@dinomite-studios/unity-azure-pipelines-tasks-lib';

export function getUnityEditorVersion(): UnityVersionInfo {
    const projectPath = tl.getPathInput('unityProjectPath') || '';
    console.log(`${tl.loc('projectPathInfo')} ${projectPath}`);

    const unityVersionResult = UnityVersionTools.determineProjectVersionFromFile(projectPath);
    if (unityVersionResult.error || !unityVersionResult.info) {
        const error = `${tl.loc('failGetUnityEditorVersion')} | ${unityVersionResult.error}`;
        console.error(error);
        throw new Error(error);
    }

    const successGetVersionLog = `${tl.loc('successGetUnityEditorVersion')} ${unityVersionResult.info!.version}${unityVersionResult.info!.revision ? `, revision=${unityVersionResult.info!.revision}` : ''}, alpha=${unityVersionResult.info!.isAlpha}, beta=${unityVersionResult.info!.isBeta}`;
    console.log(successGetVersionLog);
    if (unityVersionResult.info!.isAlpha || unityVersionResult.info!.isBeta) {
        console.warn(tl.loc('warningAlphaBetaVersion'));
    }

    return unityVersionResult.info!;
}