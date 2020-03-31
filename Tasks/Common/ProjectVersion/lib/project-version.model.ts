/**
 * Unity project version information.
 */
export interface UnityProjectVersion {

    /**
     * Project version identifier.
     */
    version: string;

    /**
     * Is the project using a beta version of Unity?
     */
    isBeta: boolean;

    /**
     * Is the project using an alpha version of Unity?
     */
    isAlpha: boolean;
}