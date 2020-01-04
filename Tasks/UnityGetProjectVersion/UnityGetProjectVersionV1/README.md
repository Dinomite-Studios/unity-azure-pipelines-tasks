# About

This Unity task will get the project's needed Unity editor version for use in subsequent tasks in your pipeline. It's part of the [Unity Tools for Azure DevOps](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension in the Visual Studio Marketplace.

## Compiling the task yourself

- Check out the repository
- Open a terminal in `Tasks\UnityGetProjectVersion\UnityGetProjectVersionV1` and execute `npm install` to install the required node packages
- Open a terminal in the repository's root folder and execute `tsc Tasks\UnityGetProjectVersion\UnityGetProjectVersionV1\unity-get-project-version.ts --lib es6`