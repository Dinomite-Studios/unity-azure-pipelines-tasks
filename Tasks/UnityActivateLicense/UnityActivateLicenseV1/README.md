# About Unity Activate License V1

This unity task will activate a seat / license for the editor instance specified. It's part of the [Unity Tools for Azure DevOps](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension.

## How to use

### Inputs

**Username**

Unity account username to use for activation.

**Password**

Unity account password for the user specified in *Username*.

**Serial**

Unity license serial key that belongs to a seat of the user specified in *Username*.
The license must have at least one free activation available. The task will
release the activation again once the pipeline job has completed.

**Unity Editors Location**

Specify where to look for the Unity editor installations on the build machine.

**Unity Project Path**

Optionally specify the path to the Unity project root directory. That is the directory containing the assets folder of your project.
Path is relative to the repository root. If not specified, the Unity project is assumed to be at the repository root.

### Outputs

**logsOutputPath**

The location of the log output files. The task will generate two log files,
one of the license activation and one for releasing the license when the pipeline job is done.