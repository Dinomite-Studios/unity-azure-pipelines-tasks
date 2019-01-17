# About this task

This Unity task will build a Unity project to the specified target platform and provides the generated export files.
It's part of the [Unity Build](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension in the Visual Studio Marketplace.

## Compiling the task yourself

- Check out the repository
- Open a terminal in the repository's root folder and execute `tsc Tasks\UnityBuildV1\unity-build.ts --lib es6`

## Uploading the task to your organization

- Open a terminal in the repository's root folder and execute `tfx build tasks upload --task-path Tasks\UnityBuildV1`

*Note*: You can't upload the same version twice. Either change the version or delete the task before uploading it using `tfx build tasks delete --task-id 64e90d50-a9c0-11e8-a356-d3eab7857116`.