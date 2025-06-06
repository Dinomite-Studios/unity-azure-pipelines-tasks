# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.2]

### Fixed

- Even if "install editor" was unchecked, the task would still attempt installation
- Minor maintenance improvemnts and fixes (https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/292)

## [2.0.1]

### Fixed

- Revert removing environment variable option to lookup editors install location

## [2.0.0]

### Added

- Added installation options to install Linux build modules for the Unity editor
- Added visionOS build module installation option
- Added macOS IL2CPP build module installation option
- Added option to install Apple Silicon Unity editor instead of Intel (macOS only)
- Added support for Linux agents

### Changed

- Task is no more in preview
- Reorganized configuration option grouping in visual pipeline editor for more clarity
- Updated and cleaned up external dependencies