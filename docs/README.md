Before you can start building your Unity project using Azure Pipelines, there is some initial setup required. This Wiki will guide you through setting up your custom agent and offers some example pipelines you can use as a template to get started.

## 1. Install the Unity Build extension
Please install the extension ["Unity Build"](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) for use in your Azure DevOps organization. It adds the required Unity build task for use in Pipelines.

## 2. Setup agents
If you are going to build projects targeting iOS, tvOS or macOS, you'll need a macOS agent. For all other platforms, you can use a Windows agent to build your projects. Depending on what your requirements are, please follow these instructions to setup a custom build agent:

* [Setup Windows Agent](https://github.com/Dinomite-Studios/unity-build-task/wiki/Setup-Windows-Agent)
* [Setup macOS Agent](https://github.com/Dinomite-Studios/unity-build-task/wiki/Setup-macOS-Agent)

## 3. Define build pipelines

If you are unsure how to setup your pipeline. You can use one of the following examples as a template for your own pipeline:

* PC & Mac Standalone (coming soon)
* [iOS](ios-pipeline.md)
* tvOS (coming soon)
* Android (coming soon)
* Universal Windows Platform (coming soon)
* WebGL (coming soon)
