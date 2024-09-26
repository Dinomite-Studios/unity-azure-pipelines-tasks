# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.2]

### Added

- More info logs

### Changed

- Unified Unity Hub location specification option, so it's in line with how the setting works in other tasks. By default the task will assume the Unity Hub to be at the default installation location on the agent. It can be overriden using a custom value, if needed
- The `Install Child Modules` option is now within the `Platforms` options group instead of being the only option in its own group. This change has been made to reduce complexity and is non-breaking

## [1.0.1]

### Added

- [Allow custom Unity hub path setting for UnitySetup task](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/227)

### Fixed

- [UnitySetupTask does not have a "ProjectPath" configuration option](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/221)

## [1.0.0]

Initial release