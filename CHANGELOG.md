# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.7]

### Added

- [Introduce new configuration option to build using build profiles](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/276)
- [Add option to produce .aab file instead of .apk for Android builds](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/270)
- [Add Android signing option to build task](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/269)
- [Add UnityGetProjectVersionTask tests](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/278)
- [Add new task UnityCreateProjectV1](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/283)

### Changed

- [Revert UnityCMD deprecation and align input options with other tasks](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/268)
- [Update UnityGetProjectVersionV1 shared library dependency](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/281)

## [2.9.6]

### Fixed

- Revert removing environment variable option to lookup editors install location

## [2.9.5]

### Fixed

- Revert removing environment variable option to lookup editors install location

## [2.9.4]

### Fixed

- UnityCMD / UnityTest Task would fail when looking up Unity editors installation location

## [2.9.3]

### Added

- Unity Setup Task V2

### Changed

- Deprecated Unity Setup Task V1 in favor of Unity Setup V2
- Deprecated Unity Activate License Task in favor of Unity Setup V2
- Updated and cleaned up external dependencies for tasks
- [Updated all tasks to run on Node 20 runners](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/pull/259) (thank you bdovaz!)

## [2.9.2]

### Added

#### UnitySetupTask

- [Allow custom Unity hub path setting for UnitySetup task](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/227)

### Changed

#### UnityActivateLicenseTask

- Made `deactivateSeatOnComplete` a reuired parameter that defaults to `true`. Seat activation on the agent will be returned once the pipeline has completed. Set this value to `false`, to keep the seat activated on the agent

### Fixed

#### UnitySetupTask

- [UnitySetupTask does not have a "ProjectPath" configuration option](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/221)

#### UnityActivateLicenseTask

- [Respect unityProjectPath in unity activate license tasks](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/issues/225)

## [2.9.1]

### Added

- New `Unity Setup` task (preview). Use this task to install a Unity editor and required modules before running your build

### Changed

- Updated `UnityActivateLicense` task to v1.2.0. Please see the task [CHANGELOG](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/blob/master/Tasks/UnityActivateLicense/UnityActivateLicenseV1/CHANGELOG.md) for mroe info
- Updated `UnityBuild` to v3.2.1. Please seethe task [CHANGELOG](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/blob/master/Tasks/UnityBuild/UnityBuildV3/CHANGELOG.md) for more info

## [2.9.0]

### Changed

- Upgrade all tasks to Node 10
- Updated minimum required agent version to `2.144.0`
- Updated UnityTest Task to v1.5.0 [Changelog](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/blob/main/Tasks/UnityTest/UnityTestV1/CHANGELOG.md)
- Updated UnityGetProjectVersion Task to v1.1.0 [Changelog](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/blob/main/Tasks/UnityGetProjectVersion/UnityGetProjectVersionV1/CHANGELOG.md)
- Updated UnityCMD Task to v1.2.0 [Changelog](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/blob/main/Tasks/UnityCMD/UnityCMDV1/CHANGELOG.md)
- Updated UnityActivateLicense Task to v1.1.0 [Changelog](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/blob/main/Tasks/UnityActivateLicense/UnityActivateLicenseV1/CHANGELOG.md)
- Updated UnityBuild Task to v3.2.0 [Changelog](https://github.com/Dinomite-Studios/unity-azure-pipelines-tasks/blob/main/Tasks/UnityBuild/UnityBuildV3/CHANGELOG.md)

### Removed

- Legacy Unity Build Task V1 is no longer shipped with the extension. Please use Unity Build V3
- Legacy Unity Build Task V2 is no longer shipped with the extension. Please use Unity Build V3

## [2.8.6]

### Changed

- Updated UnityActivateLicenseTaskV1 to 1.0.43
- Updated UnityBuildTaskV3 to 3.1.13

## [2.8.5]

### Changed

- Updated UnityTestV1 to 1.4.17

## [2.8.4]

### Changed

- Updated UnityTestV1 to 1.4.2

## [2.8.3]

### Changed

- Updated UnityTestV1 to 1.4.0

## [2.8.2]

Rerelease to fix broken build from previous release.

## [2.8.1]

### Fixed

- Fixed missing `node_modules` folder in task folder on agent

## [2.8.0]

### Changed

- Updated tasks with new documentation links
- Maintenance and clean up of code base

## [2.7.3]

### Changed

- Unity Test Task updated to v1.3.0. Check task changelog for changes

## [2.7.2]

### Changed

- Updated Unity Test Task to v1.2.0. Please check task changelog for changes

## [2.7.1]

### Fixed

- Fixed custom unity editors path option in Build task V2 and V3

## [2.7.0]

*Please refer to the task changelogs for details in changes to specific tasks*

### Added

- Added Unity CMD task to run Unity via command line and specify own arguments

### Changed

- All the tasks will now stream Unity log output to the DevOps console for better debugging
- Optimized all the tasks and did some housekeeping

## [2.6.1]

### Changed

- Added missing files for Test task.

## [2.6.0]

### Added

- Added Unity Test Task to run Unity Unit Tests.

## [2.5.2]

### Changed

- Added debugging messages to get project version tasks.

## [2.5.1]

### Added

- Added Unity Build task verion 3 is now available in preview. Looking for feedback.

## [2.4.3]

### Changed

- See Untiy Activate License task changelog for changes.

## [2.4.2]

### Changed

- See Untiy Activate License task changelog for changes.

## [2.4.1]

### Changed

- See build task V2 changelog for changes.
- See get project version task V1 for changes.

## [2.4.0]

### Changed

- Updated Build Task to 2.4.0. Check the task's changelog for more information.

## [2.3.2]

### Changed

- Updated Build Task to 2.3.0. Check the task's changelog for more information.

## [2.3.1]

### Changed

- Updated extension readme in marketplace.

## [2.3.0]

### Added

- Added Unity Activation task to activate editor license.

## [2.2.0]

### Changed

- Updated Unity Build task to v2.2.0. See the changelog for changes.

## 2.1.0

### Changed

- Updated Unity Build to v2.1.0.

## [2.0.1]

### Added

- Unity Build task V2 with hosted agent support.
- Unity Get Project Version task to get a Projects Unity version.

### Changed

- Renamed extension from Unity Build to Unity Tools for Azure DevOps since it now has multiple tasks bundled.

## [1.0.0]

### Added

- Initial release.
