# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.3.0]

### Added

- Introduce new configuration option to build using build profiles. This feature is only available for Unity 6 and above

## [3.2.6]

### Added

- Add configuration option to build Android App Bundle (aab file) instead of APK

## [3.2.5]

### Added

- Add visionOS build target
- Add configuration options to sign an Android build using a keystore

### Changed

- Improved input variables grouping in visual editor
- The output variable now points directly to the genereated lot file instead of the folder containing it. This is to avoid uploading log files from previous runs if there happen to be multiple log files in the log directory
- Optimized editor version selection UX. Instead of using the project's version if the version input variable is empty we use a dropdown element that offers two options. Either to use the project's Unity version or specify one, which will only then show a input textbox for entering a custom Unity version. This is aligned with the other tasks for a consistent user experience

## [3.2.4]

### Fixed

- Revert removing environment variable option to lookup editors install location

## [3.2.3]

### Fixed

- Revert removing environment variable option to lookup editors install location

## [3.2.2]

### Changed

- Updated and cleaned up external dependencies

## [3.2.1]

### Fixed

- Fixed undefined path issue when specifying a custom unity editor version to build with

### Changed

- Updated dependencies

## [3.2.0]

### Fixed

- Unexpected token build fail issue [GitHub Issue](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/199)
- This task uses Node 6 execution handler, which will be deprecated soon [GitHub Issue](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/190)

### Changed

- Upgrade task to Node 10
- Updated minimum required agent version to `2.144.0`
- Use new shared library `@dinomite-studios/unity-azure-pipelines-tasks-lib` for common task features

## [3.1.12]

Rerelease to fix broken build from previous release.

## [3.1.11]

### Fixed

- Fixed missing `node_modules` folder when task downloaded to agent

## [3.1.10]

Maintenance release

## [3.1.1]

### Fixed

- Fixed custom unity editors path option

## [3.1.0]

### Added

- Added timestamp to generated log files
- Added log output while running the task
- Added output variable `logsOutputPath` pointing to the directory containing all generated logs

### Changed

- Performance and optimization changes

## [3.0.0]

### Added

- Support for inline build script definition
- Support for existing build script in repository
- Support for additional command line arguments
- Support to specify build output path
- Add build targets for Linux, Web, Xbox One, PS4, Nintendo Switch, Nintendo 3DS

### Changed

- Changed the way advanced arguments are specified. The checkbox inputs were removed. To specify e.g. no graphics just add -nographics to the additional arguments input
- Changed the way build progress is monitored. The previous way was error prone since e.g. a second Unity instance running would case the build to never finish
- Changed build output directory to default to binaries directory of build agent.

### Removed

- Removed build output path output variable. The build output path can now be set by the user as part of the build task configuration, hence output variable is not needed anymore
- Removed build log output variable. Whether to create a build log or not and where can be specified as part of the additional arguments setting