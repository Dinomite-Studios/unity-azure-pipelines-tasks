export interface UnityBuildConfiguration {

    /**
     * Unity Editor version to use for the build.
     */
    unityVersion: string;

    /**
     * The target build platform for the build output.
     */
    buildTarget: string;

    /**
     * Path to the Unity project to build, relative to repository root.
     * If empty or undefined, defaults to repository root.
     */
    projectPath: string | undefined;

    /**
     * Build output path. This can be relative to repository root or fully qualified.
     * If empty or undefined, defaults to repository root.
     */
    outputPath: string | undefined;

    /**
     * Output filename, used e.g as drop.exe, drop.app, drop.apk.
     */
    outputFileName: string;
}