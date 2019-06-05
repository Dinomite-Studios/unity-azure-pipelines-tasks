import { UnityBuildTarget } from "./unity-build-target.enum";

export class UnityBuildConfiguration {

    /**
     * Unity Editor version to use for the build.
     */
    public unityVersion: string = '';

    /**
     * Gets or sets the target build platform for the build output.
     */
    public buildTarget: UnityBuildTarget = UnityBuildTarget.standalone;

    /**
     * Gets or sets the full path to the Unity project to build.
     */
    public projectPath: string = '';

    /**
     * Gets or sets the output filename, which will be used when constructing
     * the appropriate platform's extension (i.e. drop.exe, drop.app, drop.apk).
     */
    public outputFileName: string = '';
}