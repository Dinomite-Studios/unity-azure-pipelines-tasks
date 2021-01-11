# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.2]

### Fixed

- Fixed missing `node_modules` folder when task downloaded to agent

## [1.5.1]

### Added

- Added log output while running the task

### Changed

- Performance and optimization changes

## [1.4.2]

### Changed

- Fixed compiler warnings regarding deprecated build targets

## [1.4.1]

### Changed

- Fixed some typos in the helper texts and updated paths to new repository URL
- Fixed generated AzureDevOps C# scripts not building on Unity versions prior 2018.1

## [1.4.0]

### Changed

- Update instance name format to contain target platform
- Slightly improved validation and error messages
- Unity Hub Editors Folder Location is now expected to be an environent variable `UNITYHUB_EDITORS_FOLDER_LOCATION` on the agent. To create the variable create a `.env` file in the agent's root directory and specify the variable by entering e.g. `UNITYHUB_EDITORS_FOLDER_LOCATION=D:\Unity\Editor`. Restart the agent for the change to take effect. For detailed instructions please visit the project's [Wiki - Setup agent pool](https://github.com/Dinomite-Studios/unity-build-task/wiki)

### Removed

- Support for Microsoft Hosted Agents, since Unity Hub is not available there and the needed environment variable isn't set
- Preview flag

## [1.3.0]

### Added

- PC, Mac Standalone build target
- tvOS build target
- Android build target
- WebGL build target

### Changed

- Instead of building every platform into the build directory, a subfolder will be created to indicate the build target, e.g. Build\Android. Use the build output directory variable to get the path to the latest build output path
- Renamed the generated C# build script to AzureDevOps instead of VSTSBuildTask
- Build output directory from previous builds gets deleted before making a new build
- Improved checking for build result. Now monitoring whether Unity process is still running

## [1.0.0]

Initial release.
