# About this task

This is version 1.0 of the Unity test task. This Unity task will test a Unity project in the specified mode (Edit or Play) and produce NUnit compatible results for upload into Azure DevOps. It's part of the [Unity Tools for Azure DevOps](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension in the Visual Studio Marketplace.

## Compiling the task yourself

- Check out the repository
- Open a terminal in `Tasks\UnityTest\UnityTestV1` and execute `npm install` to install the required node packages
- Open a terminal in the repository's root folder and execute `tsc Tasks\UnityTest\UnityTestV1\unity-test.ts --lib es6`

## Uploading the task to your organization

- Open a terminal in the repository's root folder and execute `tfx login`, entering the following url: https://dev.azure.com/{accountname}

- Open a terminal in the repository's root folder and execute `tfx build tasks upload --task-path Tasks\UnityTest\UnityTestV1`

*Note*: You can't upload the same version twice. Either change the version or delete the task before uploading it using `tfx build tasks delete --task-id 85e57e6f-cb59-4d1d-979f-dd830b51f2fa`.