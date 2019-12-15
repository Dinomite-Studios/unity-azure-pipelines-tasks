## Unity Test Task

Use this task to run either EditMode or PlayMode tests for a Unity project and get the results output as NUnit compatible result files.

Unity allows you to define Edit Mode and Play Mode tests;

*Edit Mode* tests (also known as Editor tests) are only run in the Unity Editor and have access to the Editor code in addition to the game code.

*Play Mode* tests run standalone in a Player or inside the Editor. Play Mode tests allow you to exercise your game code, as the tests run as coroutines if marked with the UnityTest attribute.

More information on Edit/ Play Mode tests can be found in the [Unity Documentation](https://docs.unity3d.com/Packages/com.unity.test-framework@1.1/manual/edit-mode-vs-play-mode-tests.html).

The Unity Test Task allow you run those tests as part of the Azure DevOps pipeline.

Summary of steps:

1. Add the Unity Get Project Version task - this is needed to establish the correct Unity Editor version
2. Add the Unity Test task and configure
    * Choose Edit Play Mode
    * Expand output variables and name the reference (i.e. EditModeTests).  Make note of the variable name for the test results (i.e. EditModeTests.testResultsOutputPathAndFileName)
3. Add Publish Test Results
    * Set the Test result format to NUnit
    * Use the above variable in the Test results file input (i.e. ```$(EditModeTests.testResultsOutputPathAndFileName)```)
    * Enable "Fail if there are test failures" (if desired)
    * Set the Test run title as approriate (i.e. "Edit Mode Tests)
4. Repeat steps 2 & 3 for Play Mode tests (if desired)



