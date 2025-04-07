import path = require("path");
import tl = require("azure-pipelines-task-lib/task");

function run() {
  try {
    // Configure localization.
    tl.setResourcePath(path.join(__dirname, "task.json"));

    // Set task result succeeded.
    tl.setResult(tl.TaskResult.Succeeded);
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
