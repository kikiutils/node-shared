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

// Functions

/**
 * Creates an independent, browser-safe console logger.
 *
 * Log calls never throw or reject for recoverable output failures. Awaiting a call
 * waits for the console invocation, not display or durable delivery. Unspecified
 * levels follow LOG_LEVEL when a process environment is available, otherwise info.
 */
export function createLogger(options: LoggerOptions = {}): Readonly<Logger> {
    const target = globalThis.console;
    const fallback = target?.error?.bind(target);
    return createLoggerCore(
        options,
        {
            report: createDiagnosticReporter(options.onError, (message) => fallback?.(message.trimEnd())),
            write(record) {
                if (!record.console) return;
                target?.[loggerMethods[record.type].consoleMethod](...formatLoggerConsoleArgs(record));
            },
        },
    );
}
