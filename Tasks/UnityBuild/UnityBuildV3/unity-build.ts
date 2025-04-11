import path = require("path");
import tl = require("azure-pipelines-task-lib/task");
import { UnityVersioning } from "./unity-versioning";
import { UnityBuildProject } from "./unity-build-project";

async function run() {
  try {
    // Configure localization.
    tl.setResourcePath(path.join(__dirname, "task.json"));

    const versioningPreBuildResult = UnityVersioning.runPreBuild();
    if (versioningPreBuildResult !== 0) {
      const log = `${tl.loc(
        "taskResultFailedVersioning"
      )} ${versioningPreBuildResult}`;
      console.error(log);
      tl.setResult(tl.TaskResult.Failed, log);
      return;
    }

    const buildProjectResult = await UnityBuildProject.run();

    // Only if the project was built successfully, run the post build
    // steps of the versioning tool.
    if (buildProjectResult === 0) {
      const versioningPostBuildResult = UnityVersioning.runPostBuild();
      if (versioningPostBuildResult !== 0) {
        const log = `${tl.loc(
          "taskResultFailedVersioning"
        )} ${versioningPostBuildResult}`;
        console.error(log);
        tl.setResult(tl.TaskResult.Failed, log);
        return;
      }
    }

    // Unity process has finished. Set task result.
    if (buildProjectResult === 0) {
      const buildSuccessLog = tl.loc("buildSuccess");
      console.log(buildSuccessLog);
      tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
    } else {
      const buildFailLog = `${tl.loc("buildFailed")} ${buildProjectResult}`;
      console.log(buildFailLog);
      tl.setResult(tl.TaskResult.Failed, buildFailLog);
    }
  } catch (e) {
    if (e instanceof Error) {
      console.error(e.message);
      tl.setResult(tl.TaskResult.Failed, e.message);
    } else {
      console.error(e);
      tl.setResult(tl.TaskResult.Failed, `${e}`);
    }
  }
}

run();
