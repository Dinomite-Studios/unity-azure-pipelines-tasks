# About

This is version 3 of the Unity build task. This Unity task will build a Unity project to the specified target platform and provides the generated export files. It's part of the [Unity Tools for Azure DevOps](https://marketplace.visualstudio.com/items?itemName=DinomiteStudios.64e90d50-a9c0-11e8-a356-d3eab7857116) extension in the Visual Studio Marketplace.

## How to build

- Check out the repository
- Open a terminal in `Tasks\UnityBuild\UnityBuildV3` and execute `npm install` to install the required node packages
- Open a terminal in the repository's root folder and execute `tsc Tasks\UnityBuild\UnityBuildV3\unity-build.ts --lib es6`