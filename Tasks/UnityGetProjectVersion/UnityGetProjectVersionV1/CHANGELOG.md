# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1]

### Changed

- Updated shared library (https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks-lib) dependency

## [1.1.0]

### Fixed

- This task uses Node 6 execution handler, which will be deprecated soon [GitHub Issue](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/190)

### Changed

- Upgrade task to Node 10
- Updated minimum required agent version to `2.144.0`
- Use new shared library `@dinomite-studios/unity-azure-pipelines-tasks-lib` for common task features

## [1.0.32]

Rerelease to fix broken build from previous release.

## [1.0.31]

### Fixed

- Fixed missing `node_modules` folder when task downloaded to agent

## [1.0.30]

### Changed

- Code cleanup, no changes affecting functionality

## [1.0.22]

### Added

- Added log output while running the task

### Changed

- Performance and optimization changes

## [1.0.4]

### Added

- Added debugging messages (set debug flag to see in log)

### Changed

- Changed project version detection code
- Updated node packages

## [1.0.1]

### Fixed

- Fixed issue where project version would not correctly be determined if the ProjectVersion.txt contains a revision editor version

## [1.0.0]

Initial release