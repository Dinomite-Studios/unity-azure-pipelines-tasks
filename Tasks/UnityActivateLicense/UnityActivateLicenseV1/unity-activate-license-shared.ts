import tl = require('azure-pipelines-task-lib/task');
import { ProjectVersionService, UnityProjectVersion } from '@dinomite-studios/unity-project-version';
import path = require('path');

export async function getUnityEditorVersion(): Promise<UnityProjectVersion> {
    const projectPath = tl.getPathInput('unityProjectPath') || '';
    console.log(`${tl.loc('ProjectPathInfo')} ${projectPath}`);

    const unityVersion = await ProjectVersionService.determineProjectVersionFromFile(projectPath);
    if (unityVersion.error) {
        const error = `${tl.loc('FailGetUnityEditorVersion')} | ${unityVersion.error}`;
        console.error(error);
        throw new Error(error);
    }

    const successGetVersionLog = `${tl.loc('SuccessGetUnityEditorVersion')} ${unityVersion.version}, alpha=${unityVersion.isAlpha}, beta=${unityVersion.isBeta}`;
    console.log(successGetVersionLog);
    if (unityVersion.isAlpha || unityVersion.isBeta) {
        console.warn(tl.loc('WarningAlphaBetaVersion'));
    }

    return unityVersion;
}

export function getUnityEditorsPath(): string {
    const editorsPathMode = tl.getInput('unityEditorsPathMode', true);
    if (editorsPathMode === 'unityHub') {
        const unityHubPath = process.platform === 'win32' ?
            path.join('C:', 'Program Files', 'Unity', 'Hub', 'Editor')
            : path.join('/', 'Applications', 'Unity', 'Hub', 'Editor');

        console.log(`${tl.loc('UsedEditorsPathInfo')} ${unityHubPath}`)
        return unityHubPath;
    } else if (editorsPathMode === 'environmentVariable') {
        const environmentVariablePath = process.env.UNITYHUB_EDITORS_FOLDER_LOCATION as string;
        if (!environmentVariablePath) {
            const error = tl.loc('EditorsPathEnvironmentVariableNotSet');
            console.error(error);
            throw Error(error);
        }

        console.log(`${tl.loc('UsedEditorsPathInfo')} ${environmentVariablePath}`)
        return environmentVariablePath;
    } else {
        const customPath = tl.getInput('customUnityEditorsPath');
        if (!customPath) {
            const error = tl.loc('EditorsPathCustomPathNotSet');
            console.error(error);
            throw Error(error);
        }

        console.log(`${tl.loc('UsedEditorsPathInfo')} ${customPath}`)
        return customPath;
    }
}

export function getUnityExecutableFullPath(unityEditorsPath: string, unityVersion: UnityProjectVersion): string {
    const unityEditorDirectory = process.platform === 'win32' ?
        path.join(`${unityEditorsPath}`, `${unityVersion.version}`, 'Editor')
        : path.join(`${unityEditorsPath}`, `${unityVersion.version}`);
    tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

    const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
        : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');

    console.log(`${tl.loc('UsedEditorExecutablePathInfo')} ${unityExecutablePath}`);
    return unityExecutablePath;
}