# Unity Tools for Azure DevOps

This extension adds tools for use in Azure Pipelines with Unity 3D. Use these tools to build a Unity project and configure
CI / CD for your projects.

![Build Status](https://dev.azure.com/dinomite/Unity%20Tools%20for%20Azure%20DevOps/_apis/build/status/Dinomite-Studios.unity-azure-pipelines-tasks?branchName=master)

## Included Tasks

### Unity Get Project Version

Use this task to easily find out the Unity version a project was last opened
with.

### Unity Activate License

Use this task to activate a Unity Pro/Plus license on the executing agent. The task will make sure to release the seat activation once the pipeline has finished.

### Unity Build

Use this task to build a Unity project and get access to output files.

### Unity Test

Use this task to run tests on a Unity project.

### Unity CMD

This task is intended for advanced use cases and users. You have full control over command line arguments passed to the Unity CLI.

## How to use

1. Install the extension to your organization. You can find it in the [Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116)
2. Visit the [documentation](https://dinomite-studios.github.io/unity-azure-pipelines-tasks/) for instructions on how to setup your Unity pipelines and configure your agents

## Contributions

Contributions to the project are welcome. Please target your Pull Requests against the `master` branch.
