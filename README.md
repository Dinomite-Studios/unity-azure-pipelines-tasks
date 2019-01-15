# About this Azure DevOps extension

Unity Build is an extension that adds a Unity build task to be used in Azure Pipelines to build Unity projects and configure CI.

## Supported Target Platforms

- PC & Mac Standalone
- iOS
- tvOS
- Android
- Universal Windows Platform
- WebGL

## Test Builds

While each and every project has its own complexity and requirements, these test builds indicate whether the task is successfully building a sample Unity project targeting the configured platform. These pipelines always use the latest publicly available Unity editor version (that is not a beta or alpha version).

|      Unity 2018.3.0f2     |                                                                        Windows Agent                                                                       |                                                                       Mac Agent                                                                      |
|:--------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------------------------------------------------------:|
|           Android          |   ![Build status](https://dinomite.visualstudio.com/Unity%20Build%20Task/_apis/build/status/Test%20Builds/Unity%20Build%20Task%20-%20Test%20-%20WIN%20-%20Android)  |   ![Build status](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Mac%20Agent/Build%20Test%20-%20CI%20-%20MAC%20-%20Android)  |
| Universal Windows Platform |     ![Build status ](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Windows%20Agent/Build%20Test%20-%20CI%20-%20WIN%20-%20UWP )    |                                                                           -                                                                          |
|            WebGL           |    ![Build status ](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Windows%20Agent/Build%20Test%20-%20CI%20-%20WIN%20-%20WebGL )   |    ![Build status](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Mac%20Agent/Build%20Test%20-%20CI%20-%20MAC%20-%20WebGL)   |
|             iOS            |                                                                              -                                                                             |     ![Build status](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Mac%20Agent/Build%20Test%20-%20CI%20-%20MAC%20-%20iOS)    |
|            tvOS            |                                                                              -                                                                             |    ![Build status](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Mac%20Agent/Build%20Test%20-%20CI%20-%20MAC%20-%20tvOS)    |
|         Standalone         | ![Build status ](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Windows%20Agent/Build%20Test%20-%20CI%20-%20WIN%20-%20Standalone ) | ![Build status](https://medialesson.visualstudio.com/HoloPlayground/_apis/build/status/Mac%20Agent/Build%20Test%20-%20CI%20-%20MAC%20-%20Standalone) |

## How to use

Visit the [Wiki](https://github.com/Dinomite-Studios/unity-build-task/wiki) for detailed instructions on how to setup your Unity pipelines and configure your agents.

### Requirements

- The Unity version to be used for the build needs to be installed on the agent machine
- Please refer to the official Unity docs on required software and SDKs to successfully build for your target platform.

### Install published extension

The extension is published at the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) and can be installed from there. This is the most straightforward way to get started.

### Custom installation

You can build the extension yourself and upload it to your Azure DevOps organization. please make sure [Node.js®](https://nodejs.org/en/) is installed on your development
machine. Also you'll need the [Node CLI for Azure DevOps](https://www.npmjs.com/package/tfx-cli) as well as [TypeScript](https://www.npmjs.com/package/typescript).

1. Download or clone the source
2. Run `tsc Tasks\UnityBuildV1\unity-build.ts --lib es6` to compile to JavaScript code
3. Run `tfx build tasks upload --task-path Tasks\UnityBuildV1` to upload the task to your orgnaization

**Note:**
You can not upload the same version number twice. If you made changes to the code and need to upload a new version make sure to change the version value in the `task.json` file. You can alternatively uninstall the extension before uploading again to avoid this using `tfx build tasks delete --task-id 64e90d50-a9c0-11e8-a356-d3eab7857116`.
