# About this task

This Unity task will get the project's needed Unity editor version for use in subsequent tasks in your pipeline.
It's part of the [Unity Build](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension in the Visual Studio Marketplace.

## Compiling the task yourself

- Check out the repository
- Open a terminal in the repository's root folder and execute `tsc Tasks\UnityGetProjectVersionV1\unity-get-project-version.ts --lib es6`

## Uploading the task to your organization

- Open a terminal in the repository's root folder and execute `tfx build tasks upload --task-path Tasks\UnityGetProjectVersionV1`

*Note*: You can't upload the same version twice. Either change the version or delete the task before uploading it using `tfx build tasks delete --task-id 38ec98bf-601a-4390-9f2e-23d43dd6dbba`.