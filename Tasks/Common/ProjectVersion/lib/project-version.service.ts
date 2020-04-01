import path = require('path');
import fs = require('fs-extra');
import { UnityProjectVersion } from './project-version.model';

export class ProjectVersionService {

    private static readonly projectSettingsFolder = 'ProjectSettings';
    private static readonly projectVersionFile = 'ProjectVersion.txt';

    /**
     * Gets a Unity project's Unity editor version by looking up the project version file in the project directory.
     * @param projectRootPath Relative path to the Unity project's root folder containing the assets folder, starting from the current working directory.
     */
    public static async determineProjectVersionFromFile(projectRootPath: string): Promise<UnityProjectVersion> {
        try {
            const projectVersionFilePath = path.join(projectRootPath, ProjectVersionService.projectSettingsFolder, ProjectVersionService.projectVersionFile);
            const projectVersionFileContent = await fs.readFile(projectVersionFilePath, { encoding: 'utf8' });
            const projectVersion = this.determineProjectVersionFromContent(projectVersionFileContent);

            return projectVersion;
        } catch (e) {
            let errorMessage = 'Unknown error while determining Unity project version.'

            if (e instanceof Error) {
                errorMessage = e.message;
            }

            return {
                version: '',
                versionWithRevision: '',
                isAlpha: false,
                isBeta: false,
                error: errorMessage
            };
        }
    }

    /**
     * Gets a Unity project's Unity editor version using the content of a project version description file.
     * @param content The ProjectVersion.txt content to use for determining the project version.
     */
    public static determineProjectVersionFromContent(content: string): UnityProjectVersion {
        if (content.includes('m_EditorVersion')) {
            const split = content.split(':');
            let projectVersion = split[1].trim();
            let projectVersionWithRevision = '';

            const revisionVersionIndex = projectVersion.indexOf('m_EditorVersionWithRevision');
            if (revisionVersionIndex > -1) {
                projectVersion = projectVersion.substr(0, revisionVersionIndex).trim();
                projectVersionWithRevision = split[split.length - 1].trim();
            }

            return {
                version: projectVersion,
                versionWithRevision: projectVersionWithRevision,
                isAlpha: projectVersion.includes('a'),
                isBeta: projectVersion.includes('b')
            }
        }

        return {
            version: '',
            versionWithRevision: '',
            isAlpha: false,
            isBeta: false,
            error: 'Unknown project version format encountered.'
        };
    }
}