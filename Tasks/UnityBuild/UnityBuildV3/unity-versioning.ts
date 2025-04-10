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
  public static runPreBuild(): number {
    const projectPath =
      tl.getPathInput(unityProjectPathInputVariableName) ?? "";
    const buildPlatform = tl.getInput(buildTargetInputVariableName, true)!;

    const bundleVersionMode = tl.getInput(
      projectVersioningBundleVersionModeVariableName,
      true
    )!;

    // Does the user want to modify the bundle version?
    if (bundleVersionMode !== VersioningMode.None) {
      let bundleVersion: SemanticVersion = {
        major: 0,
        minor: 0,
        patch: 0,
      };

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

      if (
        buildPlatform !== BuildPlatform.VisionOS &&
        buildPlatform !== BuildPlatform.TVOS
      ) {
        bundleVersion = UnityVersioningTools.updateBundleVersion(
          projectPath,
          bundleVersionMode === VersioningMode.Increment,
          bundleVersion
        );
      } else if (buildPlatform === BuildPlatform.VisionOS) {
        bundleVersion = UnityVersioningTools.updateVisionOSBundleVersion(
          projectPath,
          bundleVersionMode === VersioningMode.Increment,
          bundleVersion
        );
      } else if (buildPlatform === BuildPlatform.TVOS) {
        bundleVersion = UnityVersioningTools.updateTvOSBundleVersion(
          projectPath,
          bundleVersionMode === VersioningMode.Increment,
          bundleVersion
        );
      } else {
        throw new Error(`Invalid build platform: ${buildPlatform}`);
      }
    }

    const buildNumberMode = tl.getInput(
      projectVersioningBuildNumberModeVariableName,
      true
    )!;

    // Does the user want to modify the build number?
    if (buildNumberMode !== VersioningMode.None) {
      // The build number input is either an increment or a value to set.
      const buildNumber = parseInt(
        tl.getInput(projectVersioningBuildNumberVariableName, true)!,
        10
      );

      if (
        buildPlatform !== BuildPlatform.VisionOS &&
        buildPlatform !== BuildPlatform.IOS &&
        buildPlatform !== BuildPlatform.TVOS &&
        buildPlatform !== BuildPlatform.Android
      ) {
        UnityVersioningTools.updateBuildNumber(
          projectPath,
          buildNumberMode === VersioningMode.Increment,
          {
            Standalone: buildNumber,
          }
        ).Standalone;
      } else if (buildPlatform === BuildPlatform.Android) {
        UnityVersioningTools.updateAndroidBundleVersionCode(
          projectPath,
          buildNumberMode === VersioningMode.Increment,
          buildNumber
        );
      } else if (buildPlatform === BuildPlatform.VisionOS) {
        UnityVersioningTools.updateBuildNumber(
          projectPath,
          buildNumberMode === VersioningMode.Increment,
          {
            VisionOS: buildNumber,
          }
        ).VisionOS;
      } else if (buildPlatform === BuildPlatform.IOS) {
        UnityVersioningTools.updateBuildNumber(
          projectPath,
          buildNumberMode === VersioningMode.Increment,
          {
            iPhone: buildNumber,
          }
        ).iPhone;
      } else if (buildPlatform === BuildPlatform.TVOS) {
        UnityVersioningTools.updateBuildNumber(
          projectPath,
          buildNumberMode === VersioningMode.Increment,
          {
            tvOS: buildNumber,
          }
        ).tvOS;
      } else {
        throw new Error(`Invalid build platform: ${buildPlatform}`);
      }
    }

    return 0;
  }

  public static runPostBuild(): number {
    const projectPath =
      tl.getPathInput(unityProjectPathInputVariableName) ?? "";
    const buildPlatform = tl.getInput(buildTargetInputVariableName, true)!;

    const bundleVersionMode = tl.getInput(
      projectVersioningBundleVersionModeVariableName,
      true
    )!;

    const buildNumberMode = tl.getInput(
      projectVersioningBuildNumberModeVariableName,
      true
    )!;

    // We did neither update the bundle version nor the build number in this run,
    // so we can stop here and consider things a success.
    if (
      bundleVersionMode === VersioningMode.None &&
      buildNumberMode === VersioningMode.None
    ) {
      return 0;
    }

    let bundleVersion: SemanticVersion = {
      major: 0,
      minor: 0,
      patch: 0,
    };

    // By passing 0 increment, we'll essentially just read the current version.
    if (
      buildPlatform !== BuildPlatform.VisionOS &&
      buildPlatform !== BuildPlatform.TVOS
    ) {
      bundleVersion = UnityVersioningTools.updateBundleVersion(
        projectPath,
        true,
        bundleVersion
      );
    } else if (buildPlatform === BuildPlatform.VisionOS) {
      bundleVersion = UnityVersioningTools.updateVisionOSBundleVersion(
        projectPath,
        true,
        bundleVersion
      );
    } else if (buildPlatform === BuildPlatform.TVOS) {
      bundleVersion = UnityVersioningTools.updateTvOSBundleVersion(
        projectPath,
        true,
        bundleVersion
      );
    } else {
      throw new Error(`Invalid build platform: ${buildPlatform}`);
    }

    let buildCode: number = 0;

    // By passing 0 increment, we'll essentially just read the current build number.
    if (
      buildPlatform !== BuildPlatform.VisionOS &&
      buildPlatform !== BuildPlatform.IOS &&
      buildPlatform !== BuildPlatform.TVOS &&
      buildPlatform !== BuildPlatform.Android
    ) {
      buildCode = UnityVersioningTools.updateBuildNumber(projectPath, true, {
        Standalone: 0,
      }).Standalone;
    } else if (buildPlatform === BuildPlatform.Android) {
      buildCode = UnityVersioningTools.updateAndroidBundleVersionCode(
        projectPath,
        true,
        0
      );
    } else if (buildPlatform === BuildPlatform.VisionOS) {
      buildCode = UnityVersioningTools.updateBuildNumber(projectPath, true, {
        VisionOS: 0,
      }).VisionOS;
    } else if (buildPlatform === BuildPlatform.IOS) {
      buildCode = UnityVersioningTools.updateBuildNumber(projectPath, true, {
        iPhone: 0,
      }).iPhone;
    } else if (buildPlatform === BuildPlatform.TVOS) {
      buildCode = UnityVersioningTools.updateBuildNumber(projectPath, true, {
        tvOS: 0,
      }).tvOS;
    } else {
      throw new Error(`Invalid build platform: ${buildPlatform}`);
    }

    const commitChanges = tl.getBoolInput(
      projectVersioningCommitChangesVariableName,
      true
    )!;

    let gitTag: string | "" = "";

    // Does the user want to commit changes to the repository?
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

      commitMessage = this.replacePlaceholders(
        commitMessage,
        bundleVersion,
        buildCode
      );

      // Since Azure Pipelines will by default do a shallow clone
      // we must first explicitly switch to the source branch prior to commiting
      // changes and pushing.
      const sourceBranchName = tl.getVariable("Build.SourceBranchName")!;
      tl.execSync("git", ["switch", sourceBranchName]);

      // Now we can commit the changes.
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

        gitTag = this.replacePlaceholders(
          createTagPattern,
          bundleVersion,
          buildCode
        );

        tl.execSync("git", ["tag", gitTag]);
      }

      // Finally push the changeset and tag, if created.
      tl.execSync("git", ["push", "origin", sourceBranchName]);
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

  private static replacePlaceholders(
    input: string,
    bundleVersion: SemanticVersion,
    buildCode: number
  ): string {
    return input
      .replace(
        /{{bundleVersion}}/g,
        `${bundleVersion.major}.${bundleVersion.minor}.${bundleVersion.patch}`
      )
      .replace(/{{buildNumber}}/g, buildCode.toString());
  }
}
