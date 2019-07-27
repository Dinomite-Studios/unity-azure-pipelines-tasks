import { UnityBuildTarget } from "./unity-build-target.enum";

export interface UnityBuildConfiguration {

    /**
     * Unity Editor version to use for the build.
     */
    unityVersion: string;

    /**
     * The target build platform for the build output.
     */
    buildTarget: UnityBuildTarget;

    /**
     * Path to the Unity project to build, relative to repository root.
     */
    projectPath: string;

    /**
     * Build output path. This can be relative to repository root or fully qualified.
     */
    outputPath: string;

    /**
     * Output filename, used e.g as drop.exe, drop.app, drop.apk.
     */
    outputFileName: string;
}