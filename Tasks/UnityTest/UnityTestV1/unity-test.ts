import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { UnityTestMode } from './unity-test-mode.enum';
import {
    UnityToolRunner,
    UnityPathTools,
    UnityLogTools
} from '@dinomite-studios/unity-utilities';
import { getUnityEditorVersion } from './unity-build-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

// Input variables.
const outputFileNameInputVariableName = 'outputFileName';
const buildTargetInputVariableName = 'buildTarget';
const outputPathInputVariableName = 'outputPath';
const testModeInputVariableName = 'testMode';
const testCategoryInputVariableName = 'testCategory';
const testFilterInputVariableName = 'testFilter';
const testResultsPathInputVariableName = 'testResultsPath';
const unityProjectPathInputVariableName = 'unityProjectPath';
const unityEditorsPathModeInputVariableName = 'unityEditorsPathMode';
const customUnityEditorsPathInputVariableName = 'customUnityEditorsPath';
const localPathInputVariableName = 'Build.Repository.LocalPath';
const cleanBuildInputVariableName = 'Build.Repository.Clean';

// Constants
const editModeResultsFileName = 'EditMode.xml';
const playModeResultsFileName = 'PlayMode.xml';

// Output variables.
const logsOutputPathOutputVariableName = 'logsOutputPath';
const testResultsOutputPathAndFileNameOutputVariableName = 'testResultsOutputPathAndFileName';

/**
 * Main task runner. Executes the task and sets the result status for the task.
 */
async function run() {
    try {
        // Setup and read inputs.
        const testMode = (<any>UnityTestMode)[tl.getInput(testModeInputVariableName, true)!];
        const projectPath = tl.getPathInput(unityProjectPathInputVariableName) || '';
        const testCategory = tl.getInput(testCategoryInputVariableName) || '';
        const testFilter = tl.getInput(testFilterInputVariableName) || '';
        const testResultsPath = tl.getInput(testResultsPathInputVariableName) || 'Test Results';
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(
            tl.getInput(unityEditorsPathModeInputVariableName, true)!,
            tl.getInput(customUnityEditorsPathInputVariableName));
        const unityVersion = getUnityEditorVersion();
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);
        const cleanBuild = tl.getVariable(cleanBuildInputVariableName);
        const repositoryLocalPath = tl.getVariable(localPathInputVariableName)!;
        const testResultsFileName = testMode === UnityTestMode.EditMode ? editModeResultsFileName : playModeResultsFileName;
        const testResultsPathAndFileName = path.join(`${testResultsPath}`, `${testResultsFileName}`);
        const logFilesDirectory = path.join(repositoryLocalPath!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityTestLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);

        // Set output variable values.
        tl.setVariable(logsOutputPathOutputVariableName, logFilesDirectory);
        tl.setVariable(testResultsOutputPathAndFileNameOutputVariableName, testResultsPathAndFileName);

        // If clean was specified by the user, delete the existing test results, if any exist.
        if (cleanBuild === 'true') {
            fs.removeSync(testResultsPath);
        }

        tl.mkdirP(testResultsPath);
        tl.checkPath(testResultsPath, 'Test Results Output Directory');

        // Execute Unity command line.
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-runTests')
            .arg('-testPlatform').arg(UnityTestMode[testMode])
            .arg('-projectPath').arg(projectPath)
            .arg('-testResults').arg(testResultsPathAndFileName)
            .arg('-logfile').arg(logFilePath)
            .arg('-noGraphics')
            .arg('-forgetProjectPath');

        if (tl.getBoolInput('batchMode')) {
            unityCmd.arg('-batchmode');
        }

        if (tl.getBoolInput('noPackageManager')) {
            unityCmd.arg('-noUpm');
        }

        if (tl.getBoolInput('acceptApiUpdate')) {
            unityCmd.arg('-accept-apiupdate');
        }

        if (testCategory && testCategory.length > 0) {
            unityCmd.arg('-testCategory').arg(testCategory);
        }

        if (testFilter && testFilter.length > 0) {
            unityCmd.arg('-testFilter').arg(testFilter);
        }

        const additionalArgs = tl.getInput('additionalCmdArgs') || '';
        if (additionalArgs !== '') {
            unityCmd.line(additionalArgs);
        }

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        // Unity process has finished. Set task result.
        if (result === 0) {
            const buildSuccessLog = tl.loc('testSuccess');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('testFailed')} ${result}`;
            console.log(buildFailLog);
            tl.setResult(tl.TaskResult.Failed, buildFailLog);
        }
    } catch (e) {
        if (e instanceof Error) {
            console.error(e.message);
            tl.setResult(tl.TaskResult.Failed, e.message);
        } else {
            console.error(e);
            tl.setResult(tl.TaskResult.Failed, e);
        }
    }
}

run();
