# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.4]

### Changed

- After discussing with the community and and gathering use cases the deprecation of the UnityCMD task is reverted
- The output variable now points directly to the genereated lot file instead of the folder containing it. This is to avoid uploading log files from previous runs if there happen to be multiple log files in the log directory
- Optimized editor version selection UX. Instead of using the project's version if the version input variable is empty we use a dropdown element that offers two options. Either to use the project's Unity version or specify one, which will only then show a input textbox for entering a custom Unity version. This is aligned with the other tasks for a consistent user experience

## [1.2.3]

### Fixed

- Revert removing environment variable option to lookup editors install location

## [1.2.2]

### Fixed

- Revert removing environment variable option to lookup editors install location

## [1.2.1]

### Changed

- Task is deprecated
- Updated node vesion

## [1.2.0]

### Fixed

- This task uses Node 6 execution handler, which will be deprecated soon [GitHub Issue](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/190)

### Changed

- Upgrade task to Node 10
- Updated minimum required agent version to `2.144.0`
- Use new shared library `@dinomite-studios/unity-azure-pipelines-tasks-lib` for common task features

## [1.1.2]

Rerelease to fix broken build from previous release.

## [1.1.1]

### Fixed

- Fixed missing `node_modules` folder when task downloaded to agent

## [1.1.0]

### Changed

- Removed `buildTarget` input variable which was a leftover from the Unity Build task. For Unity CMD the user should be in full control to specify the buld target platform via command line arguments

## [1.0.1]

Initial release