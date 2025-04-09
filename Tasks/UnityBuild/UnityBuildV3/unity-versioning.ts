import tl = require("azure-pipelines-task-lib/task");
import {
  buildNumberOutputVariableName,
  buildTargetInputVariableName,
  bundleVersionOutputVariableName,
  gitTagOutputVariableName,
  projectVersioningBuildNumberModeVariableName,
  projectVersioningBuildNumberVariableName,
  projectVersioningBundleVersionMajorVariableName,
  projectVersioningBundleVersionMinorVariableName,
  projectVersioningBundleVersionModeVariableName,
  projectVersioningBundleVersionPatchVariableName,
  projectVersioningCommitChangesMessageVariableName,
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
        if (
          buildPlatform !== BuildPlatform.VisionOS &&
          buildPlatform !== BuildPlatform.TVOS
        ) {
          bundleVersion = UnityVersioningTools.incrementBundleVersion(
            projectPath,
            bundleVersion
          );
        } else if (buildPlatform === BuildPlatform.VisionOS) {
          bundleVersion = UnityVersioningTools.incrementVisionOSBundleVersion(
            projectPath,
            bundleVersion
          );
        } else if (buildPlatform === BuildPlatform.TVOS) {
          bundleVersion = UnityVersioningTools.incrementTvOSBundleVersion(
            projectPath,
            bundleVersion
          );
        } else {
          throw new Error(`Invalid build platform: ${buildPlatform}`);
        }
      } else if (bundleVersionMode === VersioningMode.Set) {
        if (
          buildPlatform !== BuildPlatform.VisionOS &&
          buildPlatform !== BuildPlatform.TVOS
        ) {
          bundleVersion = UnityVersioningTools.setBundleVersion(
            projectPath,
            bundleVersion
          );
        } else if (buildPlatform === BuildPlatform.VisionOS) {
          bundleVersion = UnityVersioningTools.setVisionOSBundleVersion(
            projectPath,
            bundleVersion
          );
        } else if (buildPlatform === BuildPlatform.TVOS) {
          bundleVersion = UnityVersioningTools.setTvOSBundleVersion(
            projectPath,
            bundleVersion
          );
        } else {
          throw new Error(`Invalid build platform: ${buildPlatform}`);
        }
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
        if (
          buildPlatform !== BuildPlatform.VisionOS &&
          buildPlatform !== BuildPlatform.IOS &&
          buildPlatform !== BuildPlatform.TVOS &&
          buildPlatform !== BuildPlatform.Android
        ) {
          buildCode = UnityVersioningTools.setBuildNumber(projectPath, {
            Standalone: buildNumber,
          }).Standalone;
        } else if (buildPlatform === BuildPlatform.Android) {
          buildCode = UnityVersioningTools.setAndroidBundleVersionCode(
            projectPath,
            buildNumber
          );
        } else if (buildPlatform === BuildPlatform.VisionOS) {
          buildCode = UnityVersioningTools.setBuildNumber(projectPath, {
            VisionOS: buildNumber,
          }).VisionOS;
        } else if (buildPlatform === BuildPlatform.IOS) {
          buildCode = UnityVersioningTools.setBuildNumber(projectPath, {
            iPhone: buildNumber,
          }).iPhone;
        } else if (buildPlatform === BuildPlatform.TVOS) {
          buildCode = UnityVersioningTools.setBuildNumber(projectPath, {
            tvOS: buildNumber,
          }).tvOS;
        } else {
          throw new Error(`Invalid build platform: ${buildPlatform}`);
        }
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

    let gitTag: string | "" = "";

    // Does the user want to commit changes to the repositoryß
    if (commitChanges) {
      const commitChangesUserName = tl.getInput(
        projectVersioningCommitChangesUserNameVariableName,
        true
      )!;
      const commitChangesUserMail = tl.getInput(
        projectVersioningCommitChangesUserMailVariableName,
        true
      )!;

      const createTag = tl.getBoolInput(
        projectVersioningCreateTagVariableName,
        true
      )!;

      let commitMessage = tl.getInput(
        projectVersioningCommitChangesMessageVariableName
      )!;

      commitMessage = commitMessage
        .replace(
          /{{bundleVersion}}/g,
          `${bundleVersion.major}.${bundleVersion.minor}.${bundleVersion.patch}`
        )
        .replace(/{{buildNumber}}/g, buildCode.toString());

      tl.execSync("git", ["config", "user.name", commitChangesUserName]);
      tl.execSync("git", ["config", "user.email", commitChangesUserMail]);
      tl.execSync("git", ["add", "."]);
      tl.execSync("git", ["commit", `-m ${commitMessage}`]);

      // Since we pushed to the repository, does the user also want to create a tag?
      if (createTag) {
        const createTagPattern = tl.getInput(
          projectVersioningCreateTagPatternVariableName,
          true
        )!;

        gitTag = createTagPattern
          .replace(
            /{{bundleVersion}}/g,
            `${bundleVersion.major}.${bundleVersion.minor}.${bundleVersion.patch}`
          )
          .replace(/{{buildNumber}}/g, buildCode.toString());

        tl.execSync("git", ["tag", gitTag]);
      }

      tl.execSync("git", ["push", "origin HEAD"]);
      if (createTag) {
        tl.execSync("git", ["push", "origin", gitTag]);
      }
    }

    tl.setVariable(
      bundleVersionOutputVariableName,
      `${bundleVersion.major}.${bundleVersion.minor}.${bundleVersion.patch}`,
      false,
      true
    );
    tl.setVariable(
      buildNumberOutputVariableName,
      buildCode.toString(),
      false,
      true
    );
    tl.setVariable(gitTagOutputVariableName, gitTag, false, true);

    return 0;
  }
}
