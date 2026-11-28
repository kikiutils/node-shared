import { formatLoggerConsoleArgs } from './_internals/formatter';
import { loggerMethods } from './_internals/levels';
import {
    createDiagnosticReporter,
    createLoggerCore,
} from './_internals/logger';
import type {
    Logger,
    LoggerOptions,
} from './types';

/** Awaiting a log call waits for the console invocation, not display. */
export function createLogger(options: LoggerOptions = {}): Readonly<Logger> {
    const target = globalThis.console;
    // Looked up per diagnostic so console wrappers installed after creation (error trackers, test spies) see it.
    const report = createDiagnosticReporter(options.onError, (message) => target?.error?.(message.trimEnd()));
    const reportConsoleFailure = (error: unknown) => report({
        error,
        message: 'Console output failed.',
        type: 'console',
    });

    return createLoggerCore(
        options,
        {
            report,
            write(record) {
                if (!record.console) return;
                try {
                    const result: unknown = target?.[loggerMethods[record.type].consoleMethod](
                        ...formatLoggerConsoleArgs(record),
                    );

                    // Console methods replaced by async functions are not awaited, so a slow one cannot stall log
                    // calls, but their rejections are still contained.
                    if (typeof (result as PromiseLike<unknown> | undefined)?.then === 'function') {
                        Promise.resolve(result).catch(reportConsoleFailure);
                    }
                } catch (error) {
                    reportConsoleFailure(error);
                }
            },
        },
    );
}
