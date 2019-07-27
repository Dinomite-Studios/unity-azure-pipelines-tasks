/**
 * Valid Unity command line -buildTarget parameter values for convenience to avoid
 * strings. Enum names MUST be exactly written as the Unity documentation says, e.g.
 * standalone and NOT Standalone.
 * 
 * Documentation:
 * https://docs.unity3d.com/Manual/CommandLineArguments.html
 */
export enum UnityBuildTarget {
    standalone,
    Win,
    Win64,
    OSXUniversal,
    Linux,
    Linux64,
    LinuxUniversal,
    iOS,
    Android,
    Web,
    WebStreamed,
    WebGL,
    XboxOne,
    PS4,
    WindowsStoreApps,
    Switch,
    N3DS,
    tvOS
}