import { ToolRunner } from "azure-pipelines-task-lib/toolrunner";
import fs = require('fs-extra');
import { UnityLogStreamer } from './unity-log-streamer';

export class UnityToolRunner {

    public static async run(tool: ToolRunner, logFilePath: string): Promise<number> {
        let execResult = tool.exec();
        while (execResult.isPending && !fs.existsSync(logFilePath)) {
            UnityLogStreamer.sleep(1000);
        }

        UnityLogStreamer.printOpen();
        const result = await UnityLogStreamer.stream(logFilePath, execResult);
        UnityLogStreamer.printClose();

        return result;
    }
}