import tail = require('tail');
import path = require('path');
import tl = require('azure-pipelines-task-lib/task');
import fs = require('fs-extra');
import { isNullOrUndefined } from 'util';
import { UnityBuildTarget } from './unity-build-target.enum';
import { UnityBuildScriptHelper } from './unity-build-script.helper';
import { UnityBuildConfiguration } from './unity-build-configuration.model';
import { UnityProcessMonitor } from './unity-process-monitor';

tl.setResourcePath(path.join(__dirname, 'task.json'));

function getTailPos(t:any) : number {
    return t.pos;
}
function getTailQueueLength(t:any) : number {
    return t.queue.length;
}

function sleep(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    var logTail = null

    try {
        const unityBuildConfiguration = getBuildConfiguration();
        const unityEditorsPath = getUnityEditorsPath();

        // Make sure the selected editor exists.
        const unityEditorDirectory = process.platform === 'win32' ?
            path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`, 'Editor')
            : path.join(`${unityEditorsPath}`, `${unityBuildConfiguration.unityVersion}`);
        tl.checkPath(unityEditorDirectory, 'Unity Editor Directory');

        // Here we make sure the build output directory exists and we can export Unity artifacts
        // there. If the folder already exists, we'll delete it so we get a clean build.
        const cleanBuild = tl.getVariable('Build.Repository.Clean');
        const repositoryLocalPath = tl.getVariable('Build.Repository.LocalPath');
        const buildOutputDir = UnityBuildScriptHelper.getBuildOutputDirectory(unityBuildConfiguration.buildTarget);
        const fullBuildOutputPath = path.join(`${unityBuildConfiguration.projectPath}`, `${buildOutputDir}`)

        if (cleanBuild === 'true') {
            fs.removeSync(fullBuildOutputPath);
        }

        tl.mkdirP(fullBuildOutputPath);
        tl.checkPath(fullBuildOutputPath, 'Build Output Directory');
        console.log("Building command" + fullBuildOutputPath);
        tl.setVariable('buildOutputPath', fullBuildOutputPath.substr(repositoryLocalPath.length + 1));
        // Mandatory set of command line arguments for Unity.
        // -batchmode will open Unity without UI
        // -buildTarget sets the configured target platform
        // -projectPath tell Unity which project to load
        const unityExecutablePath = process.platform === 'win32' ? path.join(`${unityEditorDirectory}`, 'Unity.exe')
            : path.join(`${unityEditorDirectory}`, 'Unity.app', 'Contents', 'MacOS', 'Unity');
        const unityCmd = tl.tool(unityExecutablePath)
            .arg('-batchmode')
            .arg('-buildTarget').arg(UnityBuildTarget[unityBuildConfiguration.buildTarget])
            .arg('-projectPath').arg(unityBuildConfiguration.projectPath);

        
        var logFilePath = "";
        

        if (tl.getInput('commandLineArgumentsMode', true) === 'default') {
            if (tl.getBoolInput('noPackageManager')) {
                unityCmd.arg('-noUpm');
            }

            if (tl.getBoolInput('acceptApiUpdate')) {
                unityCmd.arg('-accept-apiupdate');
            }

            if (tl.getBoolInput('noGraphics')) {
                unityCmd.arg('-nographics');
            }

            // When using the default command line arguments set, we rely on having a C# script
            // in the Unity project to trigger the build. This C# script is generated here based on the
            // tasks configuration and then "injected" into the project before Unity launches. This way it will
            // be available to us and we can Invoke it using the command line.
            const projectAssetsEditorFolderPath = path.join(`${unityBuildConfiguration.projectPath}`, 'Assets', 'Editor');
            tl.mkdirP(projectAssetsEditorFolderPath);
            tl.cd(projectAssetsEditorFolderPath);
            tl.writeFile('AzureDevOps.cs', UnityBuildScriptHelper.getUnityEditorBuildScriptContent(unityBuildConfiguration));
            tl.cd(unityBuildConfiguration.projectPath);
            unityCmd.arg('-executeMethod');
            unityCmd.arg('AzureDevOps.PerformBuild');

            // Optionally add a logfile definition to the command and output the logfile to the build output directory.
            if (tl.getInput('specifyLogFile')) {
                const logFileName = tl.getInput('logFileName');
                if (isNullOrUndefined(logFileName) || logFileName === '') {
                    throw Error('Expected log file name to be set. Disable the Specify Log File setting or enter a logfile name.');
                }

                logFilePath = path.join(repositoryLocalPath, logFileName);
                unityCmd.arg('-logfile');
                unityCmd.arg(logFilePath);
                tl.setVariable('editorLogFilePath', logFilePath);
            }
        } else {
            // The user has configured to use his own custom command line arguments.
            // In this case, just append them to the mandatory set of arguments and we're done.
            unityCmd.line(tl.getInput('customCommandLineArguments'));
        }



        var execResult = unityCmd.exec();

        // wait for log file to be created
        while (execResult.isPending && !fs.existsSync(logFilePath)) {
            await sleep(1000);
        }
    
        console.log("========= UNITY BUILD LOG ==========")
    
        logTail = new tail.Tail(logFilePath, { fromBeginning: true, follow: true,
                    logger: console, useWatchFile: true,
                    fsWatchOptions: { interval: 1009 } });
    
        logTail.on("line", function(data) { console.log(data); });
        logTail.on("error", function(error) { console.log('ERROR: ', error); });
    
        console.log("========= WAIT FOR FINISH ==========")
        var result = await execResult;
        
        var size = 0;
        
        if(fs.existsSync(logFilePath))
        {
            console.log("========= GET FILE SIZE ==========")
            size = fs.statSync(logFilePath).size;
        }
        else
        {
            console.log("========= LOG FILE HAS BEEN DELETED ==========")
        }
    
        console.log("========= MAKE SURE THE TAIL HAS FINISHED ==========")
        while (size > getTailPos(logTail) || getTailQueueLength(logTail) > 0) {
            await sleep(2089);
        }
    
        console.log("========= UNWATCH ==========")
        logTail.unwatch();
    
        console.log("======== UNITY BUILD LOG END ========");

        if (result === 0) {
            tl.setResult(tl.TaskResult.Succeeded, `Unity Build finished successfully with exit code ${result}`);
        } else {
            tl.setResult(tl.TaskResult.Failed, `Unity Build failed with exit code ${result}`)
        }
    } catch (err) {

        // Clean up tail.
        if(logTail != null)
        {
            console.log("Unwatching tail");
            logTail.unwatch();
        }

        console.log("========= FAILING BUILD =================")
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

function getBuildConfiguration(): UnityBuildConfiguration {
    const unityBuildConfiguration: UnityBuildConfiguration = new UnityBuildConfiguration();
    unityBuildConfiguration.outputFileName = tl.getInput('outputFileName');
    unityBuildConfiguration.developmentBuild = tl.getBoolInput('developmentBuild');
    unityBuildConfiguration.buildScenes = tl.getInput('buildScenes');
    unityBuildConfiguration.buildTarget = (<any>UnityBuildTarget)[tl.getInput('buildTarget', true)];
    unityBuildConfiguration.projectPath = tl.getPathInput('unityProjectPath');

    let unityVersion = fs.readFileSync(path.join(`${unityBuildConfiguration.projectPath}`, 'ProjectSettings', 'ProjectVersion.txt'), 'utf8')
        .toString()
        .split(':')[1]
        .trim();

    const revisionVersionIndex = unityVersion.indexOf('m_EditorVersionWithRevision');
    if (revisionVersionIndex > -1) {
        // The ProjectVersion.txt contains a revision version. We need to drop it.
        unityVersion = unityVersion.substr(0, revisionVersionIndex).trim();
    }

    unityBuildConfiguration.unityVersion = unityVersion;

    if (isNullOrUndefined(unityBuildConfiguration.unityVersion) || unityBuildConfiguration.unityVersion === '') {
        throw Error('Failed to get project version from ProjectVersion.txt file.');
    }

    if (process.platform !== 'win32' && unityBuildConfiguration.buildTarget === UnityBuildTarget.WindowsStoreApps) {
        throw Error('Cannot build an UWP project on a Mac.');
    }

    return unityBuildConfiguration;
}

function getUnityEditorsPath(): string {
    const editorsPathMode = tl.getInput('unityEditorsPathMode', true);
    console.log(editorsPathMode);
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