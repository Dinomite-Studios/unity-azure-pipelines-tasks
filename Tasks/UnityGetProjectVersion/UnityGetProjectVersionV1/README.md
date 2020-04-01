# About

This Unity task will get the project's needed Unity editor version for use in subsequent tasks in your pipeline. It's part of the [Unity Tools for Azure DevOps](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension at the Azure DevOps Marketplace.

## How to use

### Inputs

**Unity Project Path**

Optionally specify the path to the Unity project root directory. That is the directory containing the assets folder of your project.
Path is relative to the repository root. If not specified, the Unity project is assumed to be at the repository root.

### Outputs

**projectVersion**

Output variable with the found Unity editor version for the project, e.g. 2019.3.7f1.