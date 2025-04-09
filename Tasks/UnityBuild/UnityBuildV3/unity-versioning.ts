import tl = require("azure-pipelines-task-lib/task");
import {
  buildTargetInputVariableName,
  projectVersioningBuildNumberModeVariableName,
  projectVersioningBuildNumberVariableName,
  projectVersioningBundleVersionMajorVariableName,
  projectVersioningBundleVersionMinorVariableName,
  projectVersioningBundleVersionModeVariableName,
  projectVersioningBundleVersionPatchVariableName,
  projectVersioningCommitChangesUserMailVariableName,
  projectVersioningCommitChangesUserNameVariableName,
  projectVersioningCommitChangesVariableName,
  projectVersioningCreateTagPatternVariableName,
  projectVersioningCreateTagVariableName,
  unityProjectPathInputVariableName,
} from "./variables";
import {
  SemanticVersion,
  UnityVersioningTools,
} from "@dinomite-studios/unity-azure-pipelines-tasks-lib";
import { BuildPlatform } from "./build-platform";

enum VersioningMode {
  None = "none",
  Increment = "increment",
  Set = "set",
}

export class UnityVersioning {
  public static run(): number {
    const projectPath =
      tl.getPathInput(unityProjectPathInputVariableName) ?? "";
    const buildPlatform = tl.getInput(buildTargetInputVariableName, true)!;

    const bundleVersionMode = tl.getInput(
      projectVersioningBundleVersionModeVariableName,
      true
    )!;

    let bundleVersion: SemanticVersion = {
      major: 0,
      minor: 0,
      patch: 0,
    };

    // Does the user want to modify the bundle version?
    if (bundleVersionMode !== VersioningMode.None) {
      // Read increments / values from the task inputs.
      // The bundle version input is either an increment or a value to set.
      bundleVersion.major = parseInt(
        tl.getInput(projectVersioningBundleVersionMajorVariableName, true)!,
        10
      );
      bundleVersion.minor = parseInt(
        tl.getInput(projectVersioningBundleVersionMinorVariableName, true)!,
        10
      );
      bundleVersion.patch = parseInt(
        tl.getInput(projectVersioningBundleVersionPatchVariableName, true)!,
        10
      );

      if (bundleVersionMode === VersioningMode.Increment) {
        bundleVersion = UnityVersioningTools.incrementBundleVersion(
          projectPath,
          bundleVersion
        );
      } else if (bundleVersionMode === VersioningMode.Set) {
        throw new Error(
          "Bundle version mode set is not implemented yet. Please use increment mode."
        );
      } else {
        throw new Error(`Invalid bundle version mode: ${bundleVersionMode}`);
      }
    } else {
      // By passing 0 increments, we'll essentially just read the current version.
      bundleVersion = UnityVersioningTools.incrementBundleVersion(
        projectPath,
        bundleVersion
      );
    }

    const buildNumberMode = tl.getInput(
      projectVersioningBuildNumberModeVariableName,
      true
    )!;

    let buildCode: number = 0;

    // Does the user want to modify the build number?
    if (buildNumberMode !== VersioningMode.None) {
      // The build number input is either an increment or a value to set.
      const buildNumber = parseInt(
        tl.getInput(projectVersioningBuildNumberVariableName, true)!,
        10
      );

      if (buildNumberMode === VersioningMode.Increment) {
        if (
          buildPlatform !== BuildPlatform.VisionOS &&
          buildPlatform !== BuildPlatform.IOS &&
          buildPlatform !== BuildPlatform.TVOS &&
          buildPlatform !== BuildPlatform.Android
        ) {
          buildCode = UnityVersioningTools.incrementBuildNumber(projectPath, {
            Standalone: buildNumber,
          }).Standalone;
        } else if (buildPlatform === BuildPlatform.Android) {
          buildCode = UnityVersioningTools.incrementAndroidBundleVersionCode(
            projectPath,
            buildNumber
          );
        } else if (buildPlatform === BuildPlatform.VisionOS) {
          buildCode = UnityVersioningTools.incrementBuildNumber(projectPath, {
            VisionOS: buildNumber,
          }).VisionOS;
        } else if (buildPlatform === BuildPlatform.IOS) {
          buildCode = UnityVersioningTools.incrementBuildNumber(projectPath, {
            iPhone: buildNumber,
          }).iPhone;
        } else if (buildPlatform === BuildPlatform.TVOS) {
          buildCode = UnityVersioningTools.incrementBuildNumber(projectPath, {
            tvOS: buildNumber,
          }).tvOS;
        } else {
          throw new Error(`Invalid build platform: ${buildPlatform}`);
        }
      } else if (buildNumberMode === VersioningMode.Set) {
        throw new Error(
          "Build number mode set is not implemented yet. Please use increment mode."
        );
      } else {
        throw new Error(`Invalid build number mode: ${buildNumberMode}`);
      }
    } else {
      // By passing 0 increments, we'll essentially just read the current version.
      if (
        buildPlatform !== BuildPlatform.VisionOS &&
        buildPlatform !== BuildPlatform.IOS &&
        buildPlatform !== BuildPlatform.TVOS &&
        buildPlatform !== BuildPlatform.Android
      ) {
        buildCode = UnityVersioningTools.incrementBuildNumber(
          projectPath,
          {}
        ).Standalone;
      } else if (buildPlatform === BuildPlatform.Android) {
        buildCode = UnityVersioningTools.incrementAndroidBundleVersionCode(
          projectPath,
          0
        );
      } else if (buildPlatform === BuildPlatform.VisionOS) {
        buildCode = UnityVersioningTools.incrementBuildNumber(
          projectPath,
          {}
        ).VisionOS;
      } else if (buildPlatform === BuildPlatform.IOS) {
        buildCode = UnityVersioningTools.incrementBuildNumber(
          projectPath,
          {}
        ).iPhone;
      } else if (buildPlatform === BuildPlatform.TVOS) {
        buildCode = UnityVersioningTools.incrementBuildNumber(
          projectPath,
          {}
        ).tvOS;
      } else {
        throw new Error(`Invalid build platform: ${buildPlatform}`);
      }
    }

    const commitChanges = tl.getBoolInput(
      projectVersioningCommitChangesVariableName,
      true
    )!;

    if (commitChanges) {
      const commitChangesUserName = tl.getInput(
        projectVersioningCommitChangesUserNameVariableName,
        true
      )!;
      const commitChangesUserMail = tl.getInput(
        projectVersioningCommitChangesUserMailVariableName,
        true
      )!;
    }

    const createTag = tl.getBoolInput(
      projectVersioningCreateTagVariableName,
      true
    )!;

    if (createTag) {
      const createTagPattern = tl.getInput(
        projectVersioningCreateTagPatternVariableName,
        true
      )!;
    }

    return 0;
  }
}
