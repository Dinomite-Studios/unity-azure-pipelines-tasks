# About this Azure DevOps extension

Unity Build is an extension that adds a Unity build task to be used in Azure Pipelines to build Unity projects and configure CI.

## Supported Target Platforms

- PC & Mac Standalone
- iOS
- tvOS
- Android
- Universal Windows Platform
- WebGL

## How to use

### Supported Agents

**Hosted Agents**
Hosted agents are supported by the extension. But keep in mind that there might not be the Unity version installed
your project requires. You can find more information about pre-installed software on Microsoft hosted agents [here](https://docs.microsoft.com/en-us/vsts/pipelines/agents/hosted?view=vsts).

**Custom Agents**
We recommend hosting your own build agent for Unity pipelines, which is an easy one-time configuration. This gives you full control over installed Unity versions. You can find more information about hosting your own agent [here](https://docs.microsoft.com/en-us/vsts/pipelines/agents/agents?view=vsts).

### Requirements

- The Unity version to be used for the build needs to be installed on the agent machine
- When building e.g. for UWP, Visual Studio 2017 must be installed on the agent machine. When targeting iOS, you'll need Xcode to be installed etc.

Please refer to the official Unity docs on required software to successfully build for your target platform.

### Install published extension

The extension is published at the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) and can be installed from there. This is the most straightforward way to get started.

### Custom installation

TODO
