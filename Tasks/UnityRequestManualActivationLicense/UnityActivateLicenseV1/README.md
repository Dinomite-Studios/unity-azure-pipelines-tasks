# About

This unity task will request a manual activation file for Unity Personal to upload as an artifact. It's part of the [Unity Tools for Azure DevOps](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension in the Visual Studio Marketplace.

## How to use

### Inputs

**Unity Editors Location**

Specify where to look for the Unity editor installations on the build machine.

**Unity Project Path**

Optionally specify the path to the Unity project root directory. That is the directory containing the assets folder of your project.
Path is relative to the repository root. If not specified, the Unity project is assumed to be at the repository root.

### Outputs

**logFilePath**

The location of the log output file.