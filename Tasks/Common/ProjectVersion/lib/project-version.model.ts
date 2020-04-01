/**
 * Unity project version information.
 */
export interface UnityProjectVersion {

    /**
     * Project version identifier, e.g. 2019.3.5f1.
     */
    version: string;

    /**
     * Project version identifier with revision, e.g. 2019.3.5f1 (d691e07d38ef).
     */
    versionWithRevision: string;

    /**
     * Is the project using a beta version of Unity?
     */
    isBeta: boolean;

    /**
     * Is the project using an alpha version of Unity?
     */
    isAlpha: boolean;

    /**
     * Optional error description in case an error occured while determining the project version.
     */
    error?: string;
}