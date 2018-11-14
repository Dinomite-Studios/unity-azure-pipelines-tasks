using System;
using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public class AzureDevOps : MonoBehaviour
{
    private static string outputFileName = "drop";
    private static bool developmentBuild = false;
    private static string locationPathName = @"Build";
    private static string[] includedScenes = null;

    [MenuItem("Dinomite Studios/Azure DevOps/Perform Build")]
    public static void PerformBuild()
    {
        try
        {
            if (includedScenes == null || includedScenes.Length == 0)
            {
                EditorBuildSettingsScene[] editorConfiguredBuildScenes = EditorBuildSettings.scenes;
                includedScenes = new string[editorConfiguredBuildScenes.Length];

                for (int i = 0; i < editorConfiguredBuildScenes.Length; i++)
                {
                    includedScenes[i] = editorConfiguredBuildScenes[i].path;
                }
            }

            BuildReport buildReport = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = includedScenes,
                target = EditorUserBuildSettings.activeBuildTarget,
                locationPathName = Path.Combine(locationPathName, GetBuildTargetOutputFileNameAndExtension()),
                targetGroup = EditorUserBuildSettings.selectedBuildTargetGroup,
                options = developmentBuild ? BuildOptions.Development : BuildOptions.None
            });

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
            case BuildTarget.StandaloneOSX:
            case BuildTarget.StandaloneOSXIntel:
            case BuildTarget.StandaloneOSXIntel64:
                return string.Format("{0}.app", outputFileName);
            case BuildTarget.iOS:
            case BuildTarget.tvOS:
            case BuildTarget.StandaloneLinux:
            case BuildTarget.WebGL:
            case BuildTarget.WSAPlayer:
            case BuildTarget.StandaloneLinux64:
            case BuildTarget.StandaloneLinuxUniversal:
            case BuildTarget.PSP2:
            case BuildTarget.PS4:
            case BuildTarget.XboxOne:
            case BuildTarget.SamsungTV:
            case BuildTarget.N3DS:
            case BuildTarget.WiiU:
            case BuildTarget.Switch:
            case BuildTarget.NoTarget:
            default:
                return string.Empty;
        }
    }
}