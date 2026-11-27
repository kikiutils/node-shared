import { writeSync } from 'node:fs';
import { stripVTControlCharacters } from 'node:util';

import { supportsLoggerColor } from '../_internals/formatter';
import { getLoggerStreamName } from '../_internals/levels';
import {
    createDiagnosticReporter,
    createLoggerCore,
} from '../_internals/logger';
import type { LoggerDiagnostic } from '../types';

import { createFileWriter } from './_internals/file-writer';
import { formatNodeLoggerRecord } from './_internals/formatter';
import type {
    NodeLogger,
    NodeLoggerOptions,
} from './types';

// Constants/Variables

/**
 * Unsettled console writes, stored on each output stream so every loaded copy of this module shares them. Each stream
 * gets one permanent `error`/`close` listener on first use: a failed stream can emit `error` after its write
 * callback, so removing the listener could surface it as an uncaught exception.
 */
const pendingConsoleWritesKey = Symbol.for('@kikiutils/shared/logger/node/pending-console-writes');

// Functions

/**
 * Creates a Node.js/Bun logger with optional bounded, append-only file output and rotation.
 *
 * Log calls never throw or reject for recoverable failures. Awaiting them waits for processing, not proof of
 * successful persistence: overload drops the newest file record and failures are reported safely. Factory
 * validation/open failures reject. Call close explicitly; no process signal handlers are installed.
 *
 * Console output installs one permanent `error`/`close` listener per stdio stream, so stdio stream errors such as
 * EPIPE no longer become uncaught exceptions once a logger has written to that stream.
 */
export async function createNodeLogger(options: NodeLoggerOptions = {}): Promise<Readonly<NodeLogger>> {
    const report = createDiagnosticReporter(options.onError, (message) => writeSync(2, message));
    let writer: Awaited<ReturnType<typeof createFileWriter>> | undefined;
    let closePromise: Promise<void> | undefined;
    const consoleWrites = new Set<Promise<void>>();
    const logger = createLoggerCore(
        options,
        {
            report,
            async write(record) {
                if (closePromise) {
                    report({
                        message: 'Logger is closed.',
                        type: 'closed',
                    });

                    return;
                }

                if (!record.console && !writer) return;
                const target = process[getLoggerStreamName(record.type)];
                const text = formatNodeLoggerRecord(
                    record,
                    record.console && supportsLoggerColor(target),
                    (error) => report({
                        error,
                        message: 'Logger could not inspect an argument.',
                        type: 'format',
                    }),
                );

                const consoleCompletion = record.console ? writeConsole(target, `${text}\n`, report) : undefined;
                if (consoleCompletion) {
                    consoleWrites.add(consoleCompletion);
                    void consoleCompletion.then(() => consoleWrites.delete(consoleCompletion));
                }

                await Promise.all([
                    consoleCompletion,
                    writer?.write(`${stripVTControlCharacters(text)}\n`),
                ]);
            },
        },
    );

    if (options.file !== undefined && options.file !== false) writer = await createFileWriter(options.file, report);

    return Object.freeze({
        ...logger,
        async close() {
            if (closePromise) return await closePromise;
            closePromise = Promise.all([
                writer?.close(),
                ...consoleWrites,
            ]).then(() => {});

            return await closePromise;
        },
        getStats: () => writer?.getStats() ?? Object.freeze({
            droppedCount: 0,
            failedCount: 0,
            pendingBytes: 0,
            writeErrorCount: 0,
        }),
    });
}

async function writeConsole(target: NodeJS.WriteStream, text: string, report: (event: LoggerDiagnostic) => void) {
    const stream = target as NodeJS.WriteStream & { [pendingConsoleWritesKey]?: Set<(error?: Error | null) => void> };
    let pending = stream[pendingConsoleWritesKey];
    if (!pending) {
        const created = new Set<(error?: Error | null) => void>();
        const settleAll = (error: Error) => {
            for (const settle of created) settle(error);
        };

        target.on('error', settleAll);
        target.on('close', () => settleAll(new Error('Console stream closed.')));
        stream[pendingConsoleWritesKey] = created;
        pending = created;
    }

    const current = pending;
    return await new Promise<void>((resolveWritten) => {
        let settled = false;
        const settle = (error?: Error | null) => {
            if (settled) return;
            settled = true;
            current.delete(settle);
            if (error) {
                report({
                    error,
                    message: 'Console output failed.',
                    type: 'console',
                });
            }

            resolveWritten();
        };

        current.add(settle);
        try {
            target.write(text, settle);
        } catch (error) {
            settle(error instanceof Error ? error : new Error('Console output failed.'));
        }
    });
}
