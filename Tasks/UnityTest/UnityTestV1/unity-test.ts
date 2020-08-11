import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { UnityTestMode } from './unity-test-mode.enum';
import { UnityTestConfiguration } from './unity-test-configuration.model';
import { UnityToolRunner, UnityPathTools, UnityLogTools } from '@dinomite-studios/unity-utilities';
import { getUnityEditorVersion } from './unity-build-shared';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityTestConfiguration = getTestConfiguration();
        const unityEditorsPath = UnityPathTools.getUnityEditorsPath(tl.getInput('unityEditorsPathMode', true)!, tl.getInput('customUnityEditorsPath'))
        const unityVersion = await getUnityEditorVersion();
        const unityExecutablePath = UnityPathTools.getUnityExecutableFullPath(unityEditorsPath, unityVersion);
        const cleanBuild = tl.getVariable('Build.Repository.Clean');
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath')!;
        const testResultsFileName = unityTestConfiguration.testMode === UnityTestMode.EditMode ? 'EditMode.xml' : 'PlayMode.xml';
        const testResultsPath = unityTestConfiguration.testResults;
        const testResultsPathAndFileName = path.join(`${testResultsPath}`, `${testResultsFileName}`);

        const logFilesDirectory = path.join(repositoryLocalPath!, 'Logs');
        const logFilePath = path.join(logFilesDirectory, `UnityTestLog_${UnityLogTools.getLogFileNameTimeStamp()}.log`);
        tl.setVariable('logsOutputPath', logFilesDirectory);

        if (cleanBuild === 'true') {
            fs.removeSync(testResultsPath);
        }

        tl.mkdirP(testResultsPath);
        tl.checkPath(testResultsPath, 'Test Results Output Directory');
        tl.setVariable('testResultsOutputPathAndFileName', testResultsPathAndFileName);

        // Mandatory set of command line arguments for Unity.
        // -runTests will run the tests based on the test mode (testPlatform)
        // -batchmode will open Unity without UI
        // -testPlatform sets the mode - EditMode or PlayMode
        // -projectPath tell Unity which project to load
        // -logfile tells Unity where to put the operation log
        // -testResults tells Unity where to put the NUnit compatible results file
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-runTests')
            .arg('-testPlatform').arg(UnityTestMode[unityTestConfiguration.testMode])
            .arg('-projectPath').arg(unityTestConfiguration.projectPath)
            .arg('-testResults').arg(testResultsPathAndFileName)
            .arg('-logfile').arg(logFilePath);

        unityCmd.arg('-noGraphics')
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

        if (unityTestConfiguration.testCategory && unityTestConfiguration.testCategory.length > 0) {
            unityCmd.arg('-testCategory').arg(unityTestConfiguration.testCategory);
        }

        if (unityTestConfiguration.testFilter && unityTestConfiguration.testFilter.length > 0) {
            unityCmd.arg('-testFilter').arg(unityTestConfiguration.testFilter);
        }

        const result = await UnityToolRunner.run(unityCmd, logFilePath);

        if (result === 0) {
            const buildSuccessLog = tl.loc('TestSuccess');
            console.log(buildSuccessLog);
            tl.setResult(tl.TaskResult.Succeeded, buildSuccessLog);
        } else {
            const buildFailLog = `${tl.loc('TestFailed')} ${result}`;
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

function getTestConfiguration(): UnityTestConfiguration {
    const unityTestConfiguration: UnityTestConfiguration = new UnityTestConfiguration();
    unityTestConfiguration.testMode = (<any>UnityTestMode)[tl.getInput('testMode', true)!];

    const projectPath = tl.getPathInput('unityProjectPath');
    unityTestConfiguration.projectPath = projectPath ? projectPath : '';

    const testCategory = tl.getInput('testCategory');
    unityTestConfiguration.testCategory = testCategory ? testCategory : '';

    const testFilter = tl.getInput('testFilter');
    unityTestConfiguration.testFilter = testFilter ? testFilter : '';

    const testResultsPath = tl.getInput('testResultsPath');
    unityTestConfiguration.testResults = testResultsPath ? testResultsPath : 'test-results';

    return unityTestConfiguration;
}

run();
