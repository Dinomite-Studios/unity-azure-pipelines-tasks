# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1]

### Changed

- Made `deactivateSeatOnComplete` a reuired parameter that defaults to `true`. Seat activation on the agent will be returned once the pipeline has completed. Set this value to `false`, to keep the seat activated on the agent

## [1.2.0]

### Added

- Add a setting to skip the seat deactivation once a pipeline has finished. This will keep the seat activated on the agent machine

### Fixed

- Revert project path set for activation command causing unnecessary long importing time when attemping to activate the seat on the agent

### Changed

- Update dependencies

## [1.1.0]

### Fixed

- UnityActivateLicenseV1 hangs at end of Unity batch mode [GitHub Issue](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/200)
- Post-job: UnityActivateLicenseTask [GitHub Issue](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/194)
- This task uses Node 6 execution handler, which will be deprecated soon [GitHub Issue](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/190)

### Changed

- Upgrade task to Node 10
- Updated minimum required agent version to `2.144.0`
- Use new shared library `@dinomite-studios/unity-azure-pipelines-tasks-lib` for common task features

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