# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.5]

### Changed

- Now using the build variable `Build.Repository.Clean` to determine whether to perform a clean build. Only if the clean setting is set to true in the pipeline config a clean build is performed. Previously the build task would always do a clean build.
- Fixed issue where project version would not correctly be determined if the ProjectVersion.txt contains a revision editor version.

## [2.4.0]

### Added

- Optional -nographics parameter setting to advanced options. From the Unity documentation "When running in batch mode, do not initialize the graphics device at all. This makes it possible to run your automated workflows on machines that don’t even have a GPU (automated workflows only work when you have a window in focus, otherwise you can’t send simulated input commands). Note that -nographics does not allow you to bake GI, because Enlighten requires GPU acceleration." (#60)

### Changed

- Fix backslashes in scene path causing generated C# build script to not compile (#64)

## [2.3.0]

### Changed

- You can now build Unity iOS / tvOS / macOS projects on a windows agent. This was added to support scenarios where one agent will build the Unity project and then output data is built by a mac agent in a following pipeline step. Please keep in mind this not mean you can get and build an iOS app package on a Windows agent

## [2.2.0]

### Added

- New feature to specify a logfile name. The logfile will be in the build output directory after the build

### Changed

- Fixed compiler warnings regarding deprecated build targets
- Fixed output file name input visible when custom command lines arguments set

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
