import { UnityBuildConfiguration } from "./unity-build-configuration.model";

/**
 * Helper class which will generate the C# code script that is played in the Unity Project's Editor asset folder and
 * will trigger the actual build. It generates different C# code depending on the user's input confgiguration for the task.
 */
export class UnityBuildScriptHelper {

    /**
     * Generates a C# script to start a Unity build with the specified options.
     * @param config Build configuration values.
     */
    public static getUnityEditorBuildScriptContent(config: UnityBuildConfiguration): string {

        // Finally put it all together.
        return `
        using System;
        using System.IO;
        using UnityEditor;
        using UnityEngine;

        #if UNITY_2018_1_OR_NEWER
        using UnityEditor.Build.Reporting;
        #endif
        
        public class AzureDevOps
        {
            private static string outputFileName = @"${config.outputFileName}";
            private static string locationPathName = @"${config.outputPath}";

            [MenuItem("Dinomite Studios/Azure DevOps Tools/Perform Build")]
            public static void PerformBuild()
            {
                try
                {
                    EditorBuildSettingsScene[] editorConfiguredBuildScenes = EditorBuildSettings.scenes;
                    string[] includedScenes = new string[editorConfiguredBuildScenes.Length];
                
                    for (int i = 0; i < editorConfiguredBuildScenes.Length; i++)
                    {
                        includedScenes[i] = editorConfiguredBuildScenes[i].path;
                    }

        #if UNITY_2018_1_OR_NEWER
                    BuildReport buildReport = default(BuildReport);
        #else
                    string buildReport = "ERROR";
        #endif

                    buildReport = BuildPipeline.BuildPlayer(new BuildPlayerOptions
                    {
                        scenes = includedScenes,
                        target = EditorUserBuildSettings.activeBuildTarget,
                        locationPathName = Path.Combine(locationPathName, GetBuildTargetOutputFileNameAndExtension()),
                        targetGroup = EditorUserBuildSettings.selectedBuildTargetGroup,
                        options = BuildOptions.None
                    });
                
        #if UNITY_2018_1_OR_NEWER
                    switch (buildReport.summary.result)
                    {
                        case BuildResult.Succeeded:
                            EditorApplication.Exit(0);
                            break;
                        case BuildResult.Unknown:
                        case BuildResult.Failed:
                        case BuildResult.Cancelled:
                        default:
                            EditorApplication.Exit(1);
                            break;
                    }
        #else
                    if (buildReport.StartsWith("Error"))
                    {
                        EditorApplication.Exit(1);
                    }
                    else
                    {
                        EditorApplication.Exit(0);
                    }
        #endif
                }
                catch (Exception ex)
                {
                    Debug.Log("BUILD FAILED: " + ex.Message);
                    EditorApplication.Exit(1);
                }
            }
            
            private static string GetBuildTargetOutputFileNameAndExtension()
            {
                switch (EditorUserBuildSettings.activeBuildTarget)
                {
                    case BuildTarget.Android:
                        return string.Format("{0}.apk", outputFileName);
                    case BuildTarget.StandaloneWindows64:
                    case BuildTarget.StandaloneWindows:
                        return string.Format("{0}.exe", outputFileName);
        #if UNITY_2018_1_OR_NEWER
                    case BuildTarget.StandaloneOSX:
        #endif
        #if !UNITY_2017_3_OR_NEWER
                    case BuildTarget.StandaloneOSXIntel:
                    case BuildTarget.StandaloneOSXIntel64:
        #endif
                        return string.Format("{0}.app", outputFileName);
                    case BuildTarget.iOS:
                    case BuildTarget.tvOS:
                    case BuildTarget.StandaloneLinux:
                    case BuildTarget.WebGL:
                    case BuildTarget.WSAPlayer:
                    case BuildTarget.StandaloneLinux64:
                    case BuildTarget.StandaloneLinuxUniversal:
        #if !UNITY_2018_3_OR_NEWER
                    case BuildTarget.PSP2:    
        #endif
                    case BuildTarget.PS4:
                    case BuildTarget.XboxOne:
        #if !UNITY_2017_3_OR_NEWER
                    case BuildTarget.SamsungTV:
        #endif
        #if !UNITY_2018_1_OR_NEWER
                    case BuildTarget.N3DS:
                    case BuildTarget.WiiU:
        #endif
                    case BuildTarget.Switch:
                    case BuildTarget.NoTarget:
                    default:
                        return string.Empty;
                }
            }
        }`;
    }
}