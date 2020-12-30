# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.2]

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