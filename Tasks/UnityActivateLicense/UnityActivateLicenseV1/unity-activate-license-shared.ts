import tl = require('azure-pipelines-task-lib/task');
import {
    ProjectVersionService,
    UnityProjectVersion
} from '@dinomite-studios/unity-project-version';

export async function getUnityEditorVersion(): Promise<UnityProjectVersion> {
    const projectPath = tl.getPathInput('unityProjectPath') || '';
    console.log(`${tl.loc('projectPathInfo')} ${projectPath}`);

    const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
    if (unityVersion.error) {
        const error = `${tl.loc('failGetUnityEditorVersion')} | ${unityVersion.error}`;
        console.error(error);
        throw new Error(error);
    }

    const successGetVersionLog = `${tl.loc('successGetUnityEditorVersion')} ${unityVersion.version}, alpha=${unityVersion.isAlpha}, beta=${unityVersion.isBeta}`;
    console.log(successGetVersionLog);
    if (unityVersion.isAlpha || unityVersion.isBeta) {
        console.warn(tl.loc('warningAlphaBetaVersion'));
    }

    return unityVersion;
}