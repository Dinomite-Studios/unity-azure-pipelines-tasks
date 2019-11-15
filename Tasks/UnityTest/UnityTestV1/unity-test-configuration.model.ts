import { UnityTestMode } from "./unity-test-mode.enum";

export class UnityTestConfiguration {

    /**
     * Unity Editor version to use for the tests.
     */
    public unityVersion: string = '';

    /**
     * Gets or sets the mode for the tests.
     */
    public testMode: UnityTestMode = UnityTestMode.EditMode;

    /**
     * Gets or sets the full path to the Unity project to build.
     */
    public projectPath: string = '';

    /**
     * Gets or sets the output results filename
     */
    public testResults: string = '';

    /**
     * Gets or sets the testCategory
     */
    public testCategory: string = '';

    /**
     * Gets or sets the testFilter
     */
    public testFilter: string = '';
}