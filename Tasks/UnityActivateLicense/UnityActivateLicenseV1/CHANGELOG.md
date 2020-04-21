# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.22]

### Added

- Added log output while running the task
- Added output variable `releaseLicenseLogFilePath` for license release log

### Changed

- Performance and optimization changes
- Removed find-process package dependency
- Renamed `logFilePath` output variable to `activateLicenseLogFilePath`

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