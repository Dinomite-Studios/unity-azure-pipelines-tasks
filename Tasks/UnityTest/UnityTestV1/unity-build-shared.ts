import tl = require('azure-pipelines-task-lib/task');
import { UnityVersionInfoResult, UnityVersionTools } from '@dinomite-studios/unity-azure-pipelines-tasks-lib/';

export function getUnityEditorVersion(): UnityVersionInfoResult {
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