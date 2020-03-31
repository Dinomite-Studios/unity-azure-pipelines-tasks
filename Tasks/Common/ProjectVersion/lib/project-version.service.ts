import path = require('path');
import fs = require('fs-extra');
import { UnityProjectVersion } from '..';

export class ProjectVersionService {

    /**
     * Gets a Unity project's last used Unity editor version.
     * @param projectRootPath Full path to the Unity project's root folder.
     */
    public static async determineProjectVersion(projectRootPath: string): Promise<UnityProjectVersion | null | undefined> {
        const projectVersionFilePath = path.join(projectRootPath, 'ProjectSettings', 'ProjectVersion.txt');
        const projectVersionFileContent = await fs.readFile(projectVersionFilePath, { encoding: 'utf8' });

        let projectVersion = projectVersionFileContent.split(':')[1].trim();
        const revisionVersionIndex = projectVersion.indexOf('m_EditorVersionWithRevision');

        if (revisionVersionIndex > -1) {
            projectVersion = projectVersion.substr(0, revisionVersionIndex).trim();
        }

        if (projectVersion) {
            return {
                version: projectVersion,
                isAlpha: projectVersion.includes('a'),
                isBeta: projectVersion.includes('b')
            }
        }

        // Failed to determine project version. Most likely
        // Unity changed the version specification syntax in ProjectVersion.txt,
        // or the file does not exist for some reason.
        // Requires update.
        return null;
    }
}