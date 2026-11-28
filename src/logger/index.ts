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

/**
 * Returns an independent, browser-safe console logger. Awaiting a log call waits for the console invocation, not
 * display. Unspecified levels follow `LOG_LEVEL` when a process environment is available, otherwise `info`.
 */
export function createLogger(options: LoggerOptions = {}): Readonly<Logger> {
    const target = globalThis.console;
    const fallback = target?.error?.bind(target);
    const report = createDiagnosticReporter(options.onError, (message) => fallback?.(message.trimEnd()));
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
