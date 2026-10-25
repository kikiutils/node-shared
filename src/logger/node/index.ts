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

interface ConsoleStreamState {
    onClose: () => void;
    onError: (error: Error) => void;
    owners: Set<object>;
    pending: Set<(error?: Error | null) => void>;
}

// Constants/Variables
const consoleStreams = new WeakMap<NodeJS.WriteStream, ConsoleStreamState>();

// Functions

/**
 * Creates a Node.js/Bun logger with optional bounded, append-only file output and rotation.
 *
 * Log calls never throw or reject. Awaiting them waits for processing, not proof of successful
 * persistence: overload drops the newest file record and failures are reported safely. Factory
 * validation/open failures reject. Call close explicitly; no process signal handlers are installed.
 */
export async function createNodeLogger(options: NodeLoggerOptions = {}): Promise<NodeLogger> {
    const report = createDiagnosticReporter(options.onError, (message) => writeSync(2, message));
    let writer: Awaited<ReturnType<typeof createFileWriter>> | undefined;
    let closed = false;
    let closePromise: Promise<void> | undefined;
    const consoleOwner = {};
    const consoleTargets = new Set<NodeJS.WriteStream>();
    const consoleWrites = new Set<Promise<void>>();
    const logger = createLoggerCore(
        options,
        {
            report,
            write(record) {
                if (closed) {
                    report({
                        message: 'Logger is closed.',
                        type: 'closed',
                    });

                    return;
                }

                if (!record.console && !writer) return;
                const target = process[getLoggerStreamName(record.type)];

                const text = formatNodeLoggerRecord(record, record.console && supportsLoggerColor(target));
                if (record.console) {
                    const line = `${text}\n`;
                    consoleTargets.add(target);
                    const completion = writeConsole(target, line, report, consoleOwner);
                    consoleWrites.add(completion);
                    void completion.then(() => consoleWrites.delete(completion));
                    const fileCompletion = writer?.write(`${stripVTControlCharacters(text)}\n`);
                    return fileCompletion
                        ? Promise.all([
                            completion,
                            fileCompletion,
                        ]).then(() => {})
                        : completion;
                }

                return writer?.write(`${stripVTControlCharacters(text)}\n`);
            },
        },
    );

    if (options.file !== undefined && options.file !== false) writer = await createFileWriter(options.file, report);

    return Object.assign(
        logger,
        {
            close() {
                if (closePromise) return closePromise;
                closed = true;
                closePromise = (async () => {
                    await Promise.all([
                        writer?.close(),
                        ...consoleWrites,
                    ]);

                    for (const target of consoleTargets) {
                        const state = consoleStreams.get(target);
                        if (!state) continue;
                        state.owners.delete(consoleOwner);
                        if (!state.owners.size) {
                            target.off('error', state.onError);
                            target.off('close', state.onClose);
                            consoleStreams.delete(target);
                        }
                    }

                    consoleTargets.clear();
                })();
                return closePromise;
            },
            getStats: () => writer?.getStats() ?? {
                droppedCount: 0,
                pendingBytes: 0,
                writeErrorCount: 0,
            },
        },
    );
}

/** One error listener per shared output stream; retained until its last owning logger calls close(). */
function writeConsole(
    target: NodeJS.WriteStream,
    text: string,
    report: (event: LoggerDiagnostic) => void,
    owner: object,
) {
    let state = consoleStreams.get(target);
    if (!state) {
        const pending = new Set<(error?: Error | null) => void>();
        const onError = (error: Error) => {
            for (const settle of pending) settle(error);
        };

        const onClose = () => onError(new Error('Console stream closed.'));
        state = {
            onClose,
            onError,
            owners: new Set(),
            pending,
        };

        consoleStreams.set(target, state);
        target.on('error', onError);
        target.on('close', onClose);
    }

    state.owners.add(owner);
    const current = state;
    return new Promise<void>((resolveWritten) => {
        let settled = false;
        const settle = (error?: Error | null) => {
            if (settled) return;
            settled = true;
            current.pending.delete(settle);
            if (error) {
                report({
                    error,
                    message: 'Console output failed.',
                    type: 'console',
                });
            }

            resolveWritten();
        };

        current.pending.add(settle);
        try {
            target.write(text, settle);
        } catch (error) {
            settle(error instanceof Error ? error : new Error('Console output failed.'));
        }
    });
}
