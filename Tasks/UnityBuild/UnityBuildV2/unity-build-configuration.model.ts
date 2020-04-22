import { UnityBuildTarget } from "./unity-build-target.enum";
import { isNullOrUndefined } from "util";

export class UnityBuildConfiguration {

    /**
     * Gets or sets whether a development build will be created.
     * A development build will include the DEBUG flag and include debugging symbols.
     */
    public developmentBuild: boolean = false;

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

    /**
     * Gets or sets scenes to include in the build. If nothing specified,
     * the scenes configured in the project will be used.
     * Input format: {path_to_scene_1_asset},{path_to_scene_2_asset}...
     */
    public buildScenes: string = '';

    /**
     * Gets whether the current build configuration will override project settings
     * for scenes to include in the build. See also buildScenes field.
     */
    public getShouldOverrideScenes(): boolean {
        return !isNullOrUndefined(this.buildScenes) && !(this.buildScenes === '');
    }
}