import { Buffer } from 'node:buffer';
import type { Writable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { Path } from '../../../classes/path';
import type { LoggerDiagnostic } from '../../types';
import type {
    LoggerFileOptions,
    LoggerRotationOptions,
    NodeLoggerStats,
} from '../types';

interface LoggerFileWriter {
    /**
     * Called once, by the memoized `NodeLogger.close()`.
     */
    close: () => Promise<void>;
    getStats: () => Readonly<NodeLoggerStats>;
    write: (text: string) => Promise<void>;
}

// Constants/Variables
const defaultMaxPendingBytes = 8 * 1024 * 1024;

// Functions

/**
 * A bounded admission layer over the stream's own ordered write buffer; not a second FIFO.
 */
export async function createFileWriter(
    options: LoggerFileOptions,
    report: (event: LoggerDiagnostic) => void,
): Promise<Readonly<LoggerFileWriter>> {
    const {
        maxPendingBytes,
        path,
        rotate,
    } = validateFileOptions(options);

    const createRotatingStream = rotate ? await importRotatingFileStream() : undefined;
    await path.parent.mkdir({ recursive: true });
    const stream: Writable = rotate && createRotatingStream
        ? createRotatingStream(
            path.basename(),
            {
                compress: rotate.compress === false ? false : 'gzip',
                // Without `initialRotation`, records left in the active file by a process that stopped before a
                // boundary are archived with the next period after a restart.
                ...rotate.interval === undefined
                    ? {}
                    : {
                        initialRotation: true,
                        interval: rotate.interval === 'hourly' ? '1h' : '1d',
                    },
                intervalBoundary: true,
                intervalUTC: false,
                maxFiles: rotate.maxFiles ?? 30,
                ...rotate.maxTotalSize === undefined ? {} : { maxSize: rotate.maxTotalSize },
                path: path.parent.value,
                ...rotate.maxFileSize === undefined ? {} : { size: rotate.maxFileSize },
            },
        )
        : path.createWriteStream({ flags: 'a' });

    let pendingBytes = 0;
    let overflowCount = 0;
    let failedCount = 0;
    let errorEventCount = 0;
    let failed = false;
    let closing = false;
    let closed = false;
    let initializing = true;
    const unfinished = new Set<(written: boolean) => void>();
    let rejectInitialization: ((error: unknown) => void) | undefined;

    const settleAll = () => {
        for (const settle of unfinished) settle(false);
    };

    const fail = (error: unknown) => {
        rejectInitialization?.(error);
        if (!failed) {
            failed = true;
            if (!initializing) {
                errorEventCount++;
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
            errorEventCount++;
            report({
                error,
                message: 'File rotation cleanup failed.',
                type: 'rotation',
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

    return Object.freeze({
        async close() {
            closing = true;
            await new Promise<void>((resolveClosed) => {
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
        },
        getStats: () => Object.freeze({
            errorEventCount,
            failedCount,
            overflowCount,
            pendingBytes,
        }),
        async write(text: string) {
            // The failure itself was reported once; later records are only counted.
            if (failed) {
                failedCount++;
                return;
            }

            const bytes = Buffer.byteLength(text);
            if (bytes > maxPendingBytes - pendingBytes) {
                overflowCount++;
                report({
                    message: 'File output queue is full; the newest record was discarded.',
                    overflowCount,
                    type: 'overflow',
                });

                return;
            }

            pendingBytes += bytes;
            return await new Promise<void>((resolveWritten) => {
                let settled = false;
                const settle = (written: boolean) => {
                    if (settled) return;
                    settled = true;
                    pendingBytes -= bytes;
                    if (!written) failedCount++;
                    unfinished.delete(settle);
                    resolveWritten();
                };

                unfinished.add(settle);
                try {
                    stream.write(
                        text,
                        (error) => {
                            if (error) fail(error);
                            settle(!error);
                        },
                    );
                } catch (error) {
                    fail(error);
                }
            });
        },
    });
}

async function importRotatingFileStream() {
    try {
        return (await import('rotating-file-stream')).createStream;
    } catch (error) {
        throw new Error('file.rotate requires the optional rotating-file-stream peer dependency', { cause: error });
    }
}

/**
 * Validate before mkdir, stream creation, or other filesystem side effects.
 */
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

    let rotate: LoggerRotationOptions | undefined;
    if (options.rotate !== undefined && options.rotate !== false) {
        if (!options.rotate || typeof options.rotate !== 'object') {
            throw new TypeError('file.rotate must be false or an options object');
        }

        // Validate and use one snapshot so later caller mutations or accessor results cannot diverge from it.
        rotate = {
            compress: options.rotate.compress,
            interval: options.rotate.interval,
            maxFiles: options.rotate.maxFiles,
            maxFileSize: options.rotate.maxFileSize,
            maxTotalSize: options.rotate.maxTotalSize,
        } as LoggerRotationOptions;

        if (rotate.interval !== undefined && rotate.interval !== 'hourly' && rotate.interval !== 'daily') {
            throw new TypeError('file.rotate.interval must be hourly or daily');
        }

        if (rotate.interval === undefined && rotate.maxFileSize === undefined) {
            throw new TypeError('file.rotate requires interval or maxFileSize');
        }

        const maxFiles = rotate.maxFiles ?? 30;
        if (!Number.isSafeInteger(maxFiles) || maxFiles <= 0) {
            throw new RangeError('file.rotate.maxFiles must be a positive safe integer');
        }

        if (rotate.compress !== undefined && typeof rotate.compress !== 'boolean') {
            throw new TypeError('file.rotate.compress must be a boolean');
        }

        validateSize(rotate.maxFileSize, 'file.rotate.maxFileSize');
        validateSize(rotate.maxTotalSize, 'file.rotate.maxTotalSize');
    }

    return {
        maxPendingBytes,
        path: Path.resolve(path),
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
