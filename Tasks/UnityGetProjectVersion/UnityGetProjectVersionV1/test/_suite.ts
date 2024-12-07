import assert from 'assert';
import * as mocktest from 'azure-pipelines-task-lib/mock-test';
import * as path from 'path';

describe("Unity Get Project Version", async () => {
    it("Error determining the project version from file", async () => {
        let testPath = path.join(__dirname, 'errorDeterminingTheProjectVersionFromFile.js');

        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        await runner.runAsync();

        assert.strictEqual(runner.failed, true);
        assert.strictEqual(runner.invokedToolCount, 0);
        assert(runner.stdOutContained('loc_mock_failGetUnityEditorVersion | Unknown project version format encountered'));
    })

    it("Success (alpha) determining the project version from file", async () => {
        let testPath = path.join(__dirname, 'successAlphaDeterminingTheProjectVersionFromFile.js');

        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        await runner.runAsync();

        assert.strictEqual(runner.succeeded, true);
        assert.strictEqual(runner.invokedToolCount, 0);
        assert(runner.stdOutContained('loc_mock_successGetUnityEditorVersion 2022.3.49a1, revision=4dae1bb8668d, alpha=true, beta=false'));
        assert(runner.stdOutContained('##vso[task.setvariable variable=projectVersion;isOutput=false;issecret=false;]2022.3.49a1'));
        assert(runner.stdOutContained('##vso[task.setvariable variable=projectVersionRevision;isOutput=false;issecret=false;]4dae1bb8668d'));
    })

    it("Success (beta) determining the project version from file", async () => {
        let testPath = path.join(__dirname, 'successBetaDeterminingTheProjectVersionFromFile.js');

        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        await runner.runAsync();

        assert.strictEqual(runner.succeeded, true);
        assert.strictEqual(runner.invokedToolCount, 0);
        assert(runner.stdOutContained('loc_mock_successGetUnityEditorVersion 2022.3.49b1, revision=4dae1bb8668d, alpha=false, beta=true'));
        assert(runner.stdOutContained('##vso[task.setvariable variable=projectVersion;isOutput=false;issecret=false;]2022.3.49b1'));
        assert(runner.stdOutContained('##vso[task.setvariable variable=projectVersionRevision;isOutput=false;issecret=false;]4dae1bb8668d'));
    })

    it("Success (stable) determining the project version from file", async () => {
        let testPath = path.join(__dirname, 'successStableDeterminingTheProjectVersionFromFile.js');

        let runner: mocktest.MockTestRunner = new mocktest.MockTestRunner(testPath);

        await runner.runAsync();

        assert.strictEqual(runner.succeeded, true);
        assert.strictEqual(runner.invokedToolCount, 0);
        assert(runner.stdOutContained('loc_mock_successGetUnityEditorVersion 2022.3.49f1, revision=4dae1bb8668d, alpha=false, beta=false'));
        assert(runner.stdOutContained('##vso[task.setvariable variable=projectVersion;isOutput=false;issecret=false;]2022.3.49f1'));
        assert(runner.stdOutContained('##vso[task.setvariable variable=projectVersionRevision;isOutput=false;issecret=false;]4dae1bb8668d'));
    })
})