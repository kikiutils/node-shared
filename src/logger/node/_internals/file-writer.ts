import { Buffer } from 'node:buffer';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import {
    basename,
    dirname,
} from 'node:path';
import type { Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { Path } from '../../../classes/path';
import type { LoggerDiagnostic } from '../../types';
import type {
    LoggerFileOptions,
    NodeLoggerStats,
} from '../types';

interface LoggerFileWriter {
    close: () => Promise<void>;
    getStats: () => NodeLoggerStats;
    write: (text: string) => Promise<void>;
}

// Constants/Variables
const defaultMaxPendingBytes = 8 * 1024 * 1024;

// Functions

/** A bounded admission layer over the stream's own ordered write buffer; not a second FIFO. */
export async function createFileWriter(
    options: LoggerFileOptions,
    report: (event: LoggerDiagnostic) => void,
): Promise<LoggerFileWriter> {
    const {
        maxPendingBytes,
        path,
        rotate,
    } = validateFileOptions(options);

    const createRotatingStream = rotate ? (await import('rotating-file-stream')).createStream : undefined;
    await mkdir(dirname(path), { recursive: true });
    const stream: Writable = rotate && createRotatingStream
        ? createRotatingStream(
            basename(path),
            {
                compress: rotate.compress === false ? false : 'gzip',
                ...rotate.interval === undefined ? {} : { interval: rotate.interval === 'hourly' ? '1h' : '1d' },
                intervalBoundary: true,
                intervalUTC: false,
                maxFiles: rotate.keepFiles ?? 30,
                ...rotate.maxTotalSize === undefined ? {} : { maxSize: rotate.maxTotalSize },
                path: dirname(path),
                ...rotate.maxSize === undefined ? {} : { size: rotate.maxSize },
            },
        )
        : createWriteStream(path, { flags: 'a' });

    let pendingBytes = 0;
    let droppedCount = 0;
    let writeErrorCount = 0;
    let failed = false;
    let closing = false;
    let closed = false;
    let closePromise: Promise<void> | undefined;
    let initializing = true;
    const unfinished = new Set<() => void>();
    let rejectInitialization: ((error: unknown) => void) | undefined;

    const settleAll = () => {
        for (const settle of unfinished) settle();
    };

    const fail = (error: unknown) => {
        rejectInitialization?.(error);
        if (!failed) {
            failed = true;
            if (!initializing) {
                writeErrorCount++;
                report({
                    error,
                    message: 'File output failed and has been disabled.',
                    type: 'file',
                });
            }
        }

        settleAll();
        if (!stream.destroyed) stream.destroy();
    };

    stream.on('error', fail);
    stream.on(
        'warning',
        (error: unknown) => {
            writeErrorCount++;
            report({
                error,
                message: 'File rotation cleanup failed.',
                type: 'file',
            });
        },
    );

    stream.on(
        'close',
        () => {
            closed = true;
            if (!closing && !failed) fail(new Error('File stream closed unexpectedly.'));
            settleAll();
        },
    );

    // A write callback also waits for RFS's asynchronous initialization and initial rotation.
    try {
        await new Promise<void>((resolveReady, rejectReady) => {
            rejectInitialization = rejectReady;
            stream.write(
                Buffer.alloc(0),
                (error) => {
                    if (error) rejectReady(error);
                    else resolveReady();
                },
            );
        });

        if (failed || closed) throw new Error('File output failed during initialization.');
    } catch (error) {
        if (!stream.destroyed) stream.destroy();
        if (!closed) {
            await new Promise<void>((resolveClosed) => {
                stream.once('close', resolveClosed);
            });
        }

        throw error;
    } finally {
        rejectInitialization = undefined;
        initializing = false;
    }

    return {
        close() {
            if (closePromise) return closePromise;
            closing = true;
            closePromise = new Promise<void>((resolveClosed) => {
                if (closed) {
                    resolveClosed();
                    return;
                }

                stream.once('close', resolveClosed);
                try {
                    if (!stream.destroyed) stream.end();
                } catch (error) {
                    fail(error);
                }
            });

            return closePromise;
        },
        getStats: () => ({
            droppedCount,
            pendingBytes,
            writeErrorCount,
        }),
        write(text) {
            if (closing || closed || failed) {
                report({
                    message: 'File output is closed or unavailable.',
                    type: 'closed',
                });

                return Promise.resolve();
            }

            const bytes = Buffer.byteLength(text);
            if (bytes > maxPendingBytes - pendingBytes) {
                droppedCount++;
                report({
                    droppedCount,
                    message: 'File output queue is full; the newest record was discarded.',
                    type: 'overflow',
                });

                return Promise.resolve();
            }

            pendingBytes += bytes;
            return new Promise<void>((resolveWritten) => {
                let settled = false;
                const settle = () => {
                    if (settled) return;
                    settled = true;
                    pendingBytes -= bytes;
                    unfinished.delete(settle);
                    resolveWritten();
                };

                unfinished.add(settle);
                try {
                    stream.write(
                        text,
                        (error) => {
                            if (error) fail(error);
                            settle();
                        },
                    );
                } catch (error) {
                    fail(error);
                }
            });
        },
    };
}

/** Validate before mkdir, stream creation, or other filesystem side effects. */
function validateFileOptions(options: LoggerFileOptions) {
    if (
        !options
        || typeof options !== 'object'
        || !(
            typeof options.path === 'string'
            || options.path instanceof Path
            || options.path instanceof URL
            || Buffer.isBuffer(options.path)
        )
    ) {
        throw new TypeError('file.path must be a string, Buffer, file URL, or Path');
    }

    const path = options.path instanceof URL
        ? fileURLToPath(options.path)
        : options.path.toString();

    if (Buffer.isBuffer(options.path) && !Buffer.from(path).equals(options.path)) {
        throw new TypeError('file.path Buffer must contain valid UTF-8');
    }

    if (!path.trim() || path.includes('\0')) {
        throw new TypeError('file.path must be a nonempty path without null bytes');
    }

    const maxPendingBytes = options.maxPendingBytes ?? defaultMaxPendingBytes;
    if (!Number.isSafeInteger(maxPendingBytes) || maxPendingBytes <= 0) {
        throw new RangeError('file.maxPendingBytes must be a positive safe integer');
    }

    const rotate = options.rotate;
    if (rotate !== undefined && rotate !== false) {
        if (!rotate || typeof rotate !== 'object') {
            throw new TypeError('file.rotate must be false or an options object');
        }

        if (rotate.interval !== undefined && rotate.interval !== 'hourly' && rotate.interval !== 'daily') {
            throw new TypeError('file.rotate.interval must be hourly or daily');
        }

        if (rotate.interval === undefined && rotate.maxSize === undefined) {
            throw new TypeError('file.rotate requires interval or maxSize');
        }

        const keepFiles = rotate.keepFiles ?? 30;
        if (!Number.isSafeInteger(keepFiles) || keepFiles <= 0) {
            throw new RangeError('file.rotate.keepFiles must be a positive safe integer');
        }

        if (rotate.compress !== undefined && typeof rotate.compress !== 'boolean') {
            throw new TypeError('file.rotate.compress must be a boolean');
        }

        validateSize(rotate.maxSize, 'file.rotate.maxSize');
        validateSize(rotate.maxTotalSize, 'file.rotate.maxTotalSize');
    }

    return {
        maxPendingBytes,
        path: Path.resolve(path).value,
        rotate,
    };
}

function validateSize(value: string | undefined, name: string) {
    if (value === undefined) return;
    if (typeof value !== 'string' || !/^[1-9]\d*[BKMG]$/.test(value)) {
        throw new TypeError(`${name} must be a positive integer followed by B, K, M, or G`);
    }

    const multiplier = {
        B: 1,
        G: 1024 ** 3,
        K: 1024,
        M: 1024 ** 2,
    }[value.at(-1) as 'B' | 'G' | 'K' | 'M'];

    if (!Number.isSafeInteger(Number(value.slice(0, -1)) * multiplier)) {
        throw new RangeError(`${name} exceeds the supported size range`);
    }
}
