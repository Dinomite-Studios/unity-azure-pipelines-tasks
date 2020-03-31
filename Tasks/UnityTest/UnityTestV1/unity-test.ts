import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { UnityTestMode } from './unity-test-mode.enum';
import { UnityTestConfiguration } from './unity-test-configuration.model';
import { UnityProcessMonitor } from './unity-process-monitor';

tl.setResourcePath(path.join(__dirname, 'task.json'));

async function run() {
    try {
        const unityTestConfiguration = getTestConfiguration();
        const unityEditorsPath = getUnityEditorsPath();

        // Make sure the selected editor exists.
        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityTestConfiguration.unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityTestConfiguration.unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        // Here we make sure the test results directory exists and we can export Unity artifacts
        // there. If the folder already exists, we'll delete it so we get a clean ouput.
        const cleanBuild = tl.getVariable('Build.Repository.Clean');
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath');

        const testResultsFileName = unityTestConfiguration.testMode === UnityTestMode.EditMode ? 'EditMode.xml' : 'PlayMode.xml';
        const testResultsPath = unityTestConfiguration.testResults;
        const testResultsPathAndFileName = path.join(`${testResultsPath}`, `${testResultsFileName}`);

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
        // -testResults tells Unity where to put the NUnit compatible results file
        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-runTests')
            .arg('-batchmode')
            .arg('-testPlatform').arg(UnityTestMode[unityTestConfiguration.testMode])
            .arg('-projectPath').arg(unityTestConfiguration.projectPath)
            .arg('-testResults').arg(testResultsPathAndFileName);

        if (tl.getInput('commandLineArgumentsMode', true) === 'default') {
            unityCmd.arg('-noGraphics')
                .arg('-forgetProjectPath');

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

            // Optionally add a logfile definition to the command and output the logfile to the build output directory.
            if (tl.getInput('specifyLogFile')) {
                const logFileName = tl.getInput('logFileName');
                if (isNullOrUndefined(logFileName) || logFileName === '') {
                    throw Error('Expected log file name to be set. Disable the Specify Log File setting or enter a logfile name.');
                }

                const logFilePath = path.join(repositoryLocalPath, logFileName);
                unityCmd.arg('-logfile');
                unityCmd.arg(logFilePath);
                tl.setVariable('editorLogFilePath', logFilePath);
            }
        } else {
            // The user has configured to use his own custom command line arguments.
            // In this case, just append them to the mandatory set of arguments and we're done.
            unityCmd.line(tl.getInput('customCommandLineArguments'));
        }

        // Now we are ready to execute the Unity command line.
        // Unfortuntely, the command line will return before the unity tests have actually finished, and eventually
        // give us a false positive. The solution is currently to observe whether the Unity process is still running,
        // and when done, check whether there are output files.
        unityCmd.execSync();

        // The tests are now running. Start observing the output directory.
        // Check every minute whether the Unity process is still running and if not,
        // whether there is build output.
        setTimeout(() => {
            waitForResult(testResultsPath);
        }, 30000);
    } catch (err) {
        setResultFailed(err.message);
    }
}

async function waitForResult(path: string): Promise<void> {
    console.log('Checking whether Unity process is still running...');
    const unityStillRunning = await UnityProcessMonitor.isUnityStillRunning();

    if (unityStillRunning) {
        console.log('Unity process still running. Will check again in 30 seconds...')

        // Check every minute whether the unity process is still running.
        setTimeout(() => {
            waitForResult(path);
        }, 30000);
    } else {
        console.log(`Unity process has finished. Checking for build output in ${path}`);
        if (isFolderNotEmpty(path)) {
            // If there is build output, the build succeeded.
            setResultSucceeded(`Unity Build task completed successfully.`);
        } else {
            // We don't know what happened at this point but the build failed most likely.
            setResultFailed('The Unity build task finished without results. Check editor logs for details.');
        }
    }
}

function getTestConfiguration(): UnityTestConfiguration {
    const unityTestConfiguration: UnityTestConfiguration = new UnityTestConfiguration();
    unityTestConfiguration.testMode = (<any>UnityTestMode)[tl.getInput('testMode', true)];
    unityTestConfiguration.projectPath = tl.getPathInput('unityProjectPath');
    unityTestConfiguration.testCategory = tl.getInput('testCategory');
    unityTestConfiguration.testFilter = tl.getInput('testFilter');
    unityTestConfiguration.testResults = tl.getInput('testResults') ? tl.getInput('testResults') : 'test-results';

    let unityVersion = fs.readFileSync(path.join(`${unityTestConfiguration.projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
        .toString()
        .split(':')[1]
        .trim();

    const revisionVersionIndex = unityVersion.indexOf('m_EditorVersionWithRevision');
    if (revisionVersionIndex > -1) {
        // The ProjectVersion.txt contains a revision version. We need to drop it.
        unityVersion = unityVersion.substr(0, revisionVersionIndex).trim();
    }

    unityTestConfiguration.unityVersion = unityVersion;

    if (isNullOrUndefined(unityTestConfiguration.unityVersion) || unityTestConfiguration.unityVersion === '') {
        throw Error('Failed to get project version from ProjectVersion.txt file.');
    }

    return unityTestConfiguration;
}

function getUnityEditorsPath(): string {
    const editorsPathMode = tl.getInput('unityEditorsPathMode', true);
    if (editorsPathMode === 'unityHub') {
        const unityHubPath = process.platform === 'win32' ?
            path.join('C:', 'Program Files', 'Unity', 'Hub', 'Editor')
            : path.join('/', 'Applications', 'Unity', 'Hub', 'Editor');

        return unityHubPath;
    } else if (editorsPathMode === 'environmentVariable') {
        const environmentVariablePath = process.env.UNITYHUB_EDITORS_FOLDER_LOCATION as string;
        if (isNullOrUndefined(environmentVariablePath) || environmentVariablePath === '') {
            throw Error('Expected UNITYHUB_EDITORS_FOLDER_LOCATION environment variable to be set!');
        }

        return environmentVariablePath;
    } else {
        const customPath = tl.getInput('customUnityEditorsPath');
        if (isNullOrUndefined(customPath) || customPath === '') {
            throw Error('Expected custom editors folder location to be set. Please the task configuration.');
        }

        return customPath;
    }
}

function isFolderNotEmpty(path: string): boolean {
    const files: string[] = fs.readdirSync(path);
    return !isNullOrUndefined(files) && files.length > 0;
}

function setResultFailed(msg: string): void {
    tl.setResult(tl.TaskResult.Failed, msg);
}

function setResultSucceeded(msg: string): void {
    tl.setResult(tl.TaskResult.Succeeded, msg);
}

run();