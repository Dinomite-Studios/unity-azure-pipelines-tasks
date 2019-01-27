# About this task

This unity task will activate a seat / license for the editor instance used to build a project in following tasks.
It's part of the [Unity Tools for Azure DevOps](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension in the Visual Studio Marketplace.

## Compiling the task yourself

- Check out the repository
- Open a terminal in `Tasks\UnityActivateLicense\UnityActivateLicenseV1` and execute `npm install` to install the required node packages
- Open a terminal in the repository's root folder and execute `tsc Tasks\UnityActivateLicense\UnityActivateLicenseV1\post-unity-activate-license.ts --lib es6`
- Open a terminal in the repository's root folder and execute `tsc Tasks\UnityActivateLicense\UnityActivateLicenseV1\unity-activate-license.ts --lib es6`

## Uploading the task to your organization

- Open a terminal in the repository's root folder and execute `tfx build tasks upload --task-path Tasks\UnityActivateLicense\UnityActivateLicenseV1`

*Note*: You can't upload the same version twice. Either change the version or delete the task before uploading it using `tfx build tasks delete --task-id 13159b9a-b7ba-4977-922c-2b5cb63c90df`.