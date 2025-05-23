import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { UnityTestMode } from './unity-test-mode.enum';
import {
    UnityToolRunner,
    UnityPathTools,
    UnityVersionInfoResult,
    Utilities
} from '@dinomite-studios/unity-azure-pipelines-tasks-lib';
import { getUnityEditorVersion } from './unity-build-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const testModeInputVariableName = 'testMode';
const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';
const unityProjectPathInputVariableName = 'unityProjectPath';
const unityVersionInputVariableName = 'unityVersion';
const testCategoryInputVariableName = 'testCategory';
const testFilterInputVariableName = 'testFilter';
const failOnTestFailInputVariableName = 'failOnTestFail';
const noGraphicsInputVariableName = 'noGraphics';
const batchModeInputVariableName = 'batchMode';
const acceptApiUpdateInputVariableName = 'acceptApiUpdate';
const noPackageManagerInputVariableName = 'noPackageManager';
const testResultsPathInputVariableName = 'testResultsPath';
const cleanBuildInputVariableName = 'Build.Repository.Clean';
const additionalCmdArgsInputVariableName = 'additionalCmdArgs';

// Constants
const editModeResultsFileName = 'EditMode.xml';
const playModeResultsFileName = 'PlayMode.xml';
const testSuccessNoTestsFailed = 0;
const testSuccessTestsFailed = 2;

// Output variables.
const editorLogFilePathOutputVariableName = 'editorLogFilePath';
const testResultsOutputPathAndFileNameOutputVariableName = 'testResultsOutputPathAndFileName';
const testsFailedOutputVariableName = 'testsFailed';

async function run() {
    try {
        // Setup and read inputs.
        const testMode: UnityTestMode = (<any>UnityTestMode)[tl.getInput(testModeInputVariableName, true)!];
        const projectPath = tl.getPathInput(unityProjectPathInputVariableName) ?? '';
        const testCategory = tl.getInput(testCategoryInputVariableName) ?? '';
        const testFilter = tl.getInput(testFilterInputVariableName) ?? '';
        const testResultsPath = tl.getInput(testResultsPathInputVariableName) ?? 'Test Results';
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));
        const unityVersionInput = tl.getInput(unityVersionInputVariableName);
        const unityVersion = unityVersionInput ? { info: { version: unityVersionInput } } as UnityVersionInfoResult : getUnityEditorVersion();
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion.info!);
        const cleanBuild = tl.getVariable(cleanBuildInputVariableName);
        const batchMode = tl.getBoolInput(batchModeInputVariableName);
        const failOnTestFail = tl.getBoolInput(failOnTestFailInputVariableName);
        const noGraphics = tl.getBoolInput(noGraphicsInputVariableName);
        const acceptApiUpdate = tl.getBoolInput(acceptApiUpdateInputVariableName);
        const noPackageManager = tl.getBoolInput(noPackageManagerInputVariableName);
        const additionalCmdArgs = tl.getInput(additionalCmdArgsInputVariableName) ?? '';
        const testResultsFileName = testMode === UnityTestMode.editMode ? editModeResultsFileName : playModeResultsFileName;
        const testResultsPathAndFileName = path.join(`${testResultsPath}`, `${testResultsFileName}`);

        // Set output variable values.
        tl.setVariable(testResultsOutputPathAndFileNameOutputVariableName, testResultsPathAndFileName);
        const logFilesDirectory = path.join(tl.getVariable('Agent.TempDirectory')!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityTestLog_${Utilities.getLogFileNameTimeStamp()}.log`);
        tl.setVariable(editorLogFilePathOutputVariableName, logFilePath);

        // If clean was specified by the user, delete the existing test results, if any exist.
        if (cleanBuild === 'true') {
            fs.removeSync(testResultsPath);
        }

        tl.mkdirP(testResultsPath);
        tl.checkPath(testResultsPath, 'Test Results Output Directory');

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-runTests')
            .arg('-testPlatform').arg(testMode === UnityTestMode.editMode ? 'EditMode' : 'PlayMode')
            .arg('-projectPath').arg(projectPath)
            .arg('-testResults').arg(testResultsPathAndFileName)
            .arg('-logfile').arg(logFilePath)
            .arg('-forgetProjectPath');

        if (noGraphics) {
            unityCmd.arg('-noGraphics');
        }

        if (batchMode) {
            unityCmd.arg('-batchmode');
        }

        if (noPackageManager) {
            unityCmd.arg('-noUpm');
        }

        if (acceptApiUpdate) {
            unityCmd.arg('-accept-apiupdate');
        }

        if (testCategory && testCategory.length > 0) {
            unityCmd.arg('-testCategory').arg(testCategory);
        }

        if (testFilter && testFilter.length > 0) {
            unityCmd.arg('-testFilter').arg(testFilter);
        }

        if (additionalCmdArgs !== '') {
            unityCmd.line(additionalCmdArgs);
        }

        const exitCode = await UnityToolRunner.run(unityCmd, logFilePath);

        // Unity process has finished. Set task result.
        tl.setVariable(testsFailedOutputVariableName, exitCode === testSuccessTestsFailed ? 'true' : 'false');
        if (exitCode === testSuccessNoTestsFailed || (exitCode === testSuccessTestsFailed && !failOnTestFail)) {
            const buildSuccessLog = tl.loc('testSuccess');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('testFailed')} ${exitCode}`;
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
