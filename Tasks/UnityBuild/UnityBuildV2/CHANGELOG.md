# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New feature to specify a logfile name. The logfile will be in the build output directory after the build

### Changed

- Fixed compiler warnings regarding deprecated build targets

## [2.1.0]

### Added

- It is now possible to specify a 32-bit or 64-bit Windows Standalone build.
- Advanced options: Custom "drop" output filename.
- Added ability to build Mac standalones on Windows agents (requires the Mac Mono Scripting Backend component.)

## [2.0.0]

### Added

- Editors location path mode selection to task configuration. You can now choose between looking for editos at the default Unity Hub installation path, define an environment variable on the agent or specify a custom path right in the task configuration
- Custom command line args: Advanced feature that lets you specify your own Unity command line arguments. Use this only if you know what you are doing
- Support for hosted agents. When using hosted agents, make sure to set up the pipeline properly to install the required Unity editor first. Check the Wiki for more information

### Removed

- Unity version input in task configuration. The task will read the required version from the project files and use it for building
