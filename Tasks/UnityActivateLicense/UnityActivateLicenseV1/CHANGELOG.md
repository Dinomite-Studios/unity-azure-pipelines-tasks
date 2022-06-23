# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0]

### Fixed

- UnityActivateLicenseV1 hangs at end of Unity batch mode (https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/200)
- Post-job: UnityActivateLicenseTask (https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/194)

### Changed

- Use new shared library for common task features

## [1.0.42]

Rerelease to fix broken build from previous release.

## [1.0.41]

### Fixed

- Fixed missing `node_modules` folder when task downloaded to agent

## [1.0.40]

Maintenance release

## [1.0.27]

### Changed

- Updated dependencies

## [1.0.26]

### Added

- Added timestamp to generated log files
- Added log output while running the task
- Added output variable `logsOutputPath` pointing to the directory containing all generated logs

### Changed

- Performance and optimization changes
- Removed find-process package dependency
- Renamed `logFilePath` output variable in favor of `logsOutputPath`

## [1.0.4]

### Added

- Added debugging messages (set debug flag to see in log)

### Changed

- Changed project version detection code
- Updated node packages

## [1.0.2]

### Fixed

- Applied same fix as in v1.0.1 to the post activation task

## [1.0.1]

### Fixed

- Fixed issue where project version would not correctly be determined if the ProjectVersion.txt contains a revision editor version

## [1.0.0]

Initial release