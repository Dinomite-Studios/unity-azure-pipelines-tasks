# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.37]

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