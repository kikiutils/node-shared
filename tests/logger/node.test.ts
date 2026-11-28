import { Buffer } from 'node:buffer';
import {
    existsSync,
    writeSync,
} from 'node:fs';
import {
    mkdtemp,
    readdir,
    readFile,
    rm,
    stat,
    utimes,
    writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Writable } from 'node:stream';
import { setTimeout as sleep } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { gunzipSync } from 'node:zlib';

import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import { Path } from '../../src/classes/path';
import { PrecisionNumber } from '../../src/classes/precision-number';
import { createNodeLogger } from '../../src/logger/node';
import type {
    NodeLogger,
    NodeLoggerOptions,
} from '../../src/logger/node/types';
import type { LoggerMethod } from '../../src/logger/types';

vi.mock(
    'node:fs',
    async (importOriginal) => ({
        ...await importOriginal<typeof import('node:fs')>(),
        writeSync: vi.fn(),
    }),
);

const ansiPrefix = '\u001B[';
let directory: string;
let loggers: NodeLogger[] = [];

async function createTrackedLogger(options: NodeLoggerOptions = {}) {
    const logger = await createNodeLogger(options);
    loggers.push(logger);
    return logger;
}

const originalColorDescriptors = new Map<NodeJS.WriteStream, PropertyDescriptor | undefined>();

function forceStreamColors(stream: NodeJS.WriteStream, enabled: boolean) {
    if (!originalColorDescriptors.has(stream)) {
        originalColorDescriptors.set(stream, Object.getOwnPropertyDescriptor(stream, 'hasColors'));
    }

    Object.defineProperty(
        stream,
        'hasColors',
        {
            configurable: true,
            value: () => enabled,
        },
    );
}

function mockStreams(onWrite?: (callback?: (error?: Error | null) => void) => void) {
    const implementation = (...args: unknown[]) => {
        const callback = args.find((arg) => typeof arg === 'function') as ((error?: Error | null) => void) | undefined;
        if (onWrite) onWrite(callback);
        else callback?.();

        return true;
    };

    return {
        stderr: vi.spyOn(process.stderr, 'write').mockImplementation(implementation),
        stdout: vi.spyOn(process.stdout, 'write').mockImplementation(implementation),
    };
}

function restoreStreamColors() {
    for (const [stream, descriptor] of originalColorDescriptors) {
        if (descriptor) Object.defineProperty(stream, 'hasColors', descriptor);
        else delete (stream as Partial<NodeJS.WriteStream>).hasColors;
    }

    originalColorDescriptors.clear();
}

function stubProcessStreams() {
    const create = () => new Writable({
        write(_chunk, _encoding, callback) {
            callback();
        },
    }) as unknown as NodeJS.WriteStream;

    const streams = {
        stderr: create(),
        stdout: create(),
    };

    // Fresh streams carry no listeners from earlier tests, so exact listener counts are meaningful.
    vi.stubGlobal(
        'process',
        {
            ...process,
            ...streams,
        },
    );

    return streams;
}

function writtenText(spy: { mock: { calls: unknown[][] } }) {
    return spy.mock.calls.map(([chunk]) => String(chunk)).join('');
}

beforeEach(async () => {
    vi.stubEnv('LOG_LEVEL', '');
    directory = await mkdtemp(join(tmpdir(), 'node-logger-test-'));
    vi.mocked(writeSync).mockImplementation(() => 0);
});

afterEach(async () => {
    try {
        await Promise.allSettled(loggers.map(async (logger) => await logger.close()));
    } finally {
        loggers = [];
        restoreStreamColors();
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        vi.unstubAllEnvs();
        vi.useRealTimers();
        vi.doUnmock('rotating-file-stream');
        vi.resetModules();
        await rm(
            directory,
            {
                force: true,
                recursive: true,
            },
        );
    }
});

describe('createNodeLogger', () => {
    describe('file output', () => {
        it('should inspect non-string arguments in the file', async ({ expect }) => {
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                console: false,
                file: { path },
                icons: false,
                timestamp: false,
            });

            await logger.info(
                'data',
                {
                    a: 1,
                    b: ['x'],
                },
                42,
                null,
                undefined,
            );

            await logger.close();

            await expect(readFile(path, 'utf8')).resolves.toBe('data { a: 1, b: [ \'x\' ] } 42 null undefined\n');
        });

        it('should strip ANSI sequences from the file while keeping them on a color-capable console', async ({ expect }) => {
            const streams = mockStreams();
            forceStreamColors(process.stdout, true);
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                file: { path },
                timestamp: false,
            });

            await logger.success('\u001B[31mred\u001B[0m');
            await logger.close();

            expect(writtenText(streams.stdout)).toContain('\u001B[31mred\u001B[0m');

            const content = await readFile(path, 'utf8');

            expect(content).not.toContain(ansiPrefix);
            expect(content).toBe('✔ red\n');
        });

        it('should still write the file when console output is disabled', async ({ expect }) => {
            const streams = mockStreams();
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                console: false,
                file: { path },
                icons: false,
                timestamp: false,
            });

            await logger.warn('only in file');
            await logger.close();

            expect(streams.stdout).not.toHaveBeenCalled();
            expect(streams.stderr).not.toHaveBeenCalled();
            await expect(readFile(path, 'utf8')).resolves.toBe('only in file\n');
        });

        it('should append to an existing file', async ({ expect }) => {
            const path = join(directory, 'app.log');
            const options: NodeLoggerOptions = {
                console: false,
                file: { path },
                icons: false,
                timestamp: false,
            };

            const first = await createTrackedLogger(options);
            await first.info('one');
            await first.close();

            const second = await createTrackedLogger(options);
            await second.info('two');
            await second.close();

            await expect(readFile(path, 'utf8')).resolves.toBe('one\ntwo\n');
        });

        it('should not create a file when file is omitted or false', async ({ expect }) => {
            mockStreams();
            const logger = await createTrackedLogger({ file: false });

            await logger.info('console only');
            await logger.close();

            await expect(readdir(directory)).resolves.toEqual([]);
        });

        it.for<[string, (path: string) => NodeLoggerOptions['file']]>([
            [
                'a string',
                (path) => ({ path }),
            ],
            [
                'a file URL',
                (path) => ({ path: pathToFileURL(path) }),
            ],
            [
                'a Path instance',
                (path) => ({ path: new Path(path) }),
            ],
            [
                'a Buffer',
                (path) => ({ path: Buffer.from(path) }),
            ],
        ])(
            'should accept the file path as %s and create parent directories',
            async ([, createFile], { expect }) => {
                const path = join(directory, 'nested', 'deeper', 'app.log');
                const logger = await createTrackedLogger({
                    console: false,
                    file: createFile(path),
                    icons: false,
                    timestamp: false,
                });

                await logger.info('hello');
                await logger.close();

                await expect(readFile(path, 'utf8')).resolves.toBe('hello\n');
            },
        );
    });

    describe('file option validation', () => {
        it.for<[string, (path: string) => unknown, ErrorConstructor]>([
            [
                'a number path',
                () => ({ path: 123 }),
                TypeError,
            ],
            [
                'a missing path',
                () => ({}),
                TypeError,
            ],
            [
                'a null file option',
                () => null,
                TypeError,
            ],
            [
                'an empty path',
                () => ({ path: '' }),
                TypeError,
            ],
            [
                'a whitespace-only path',
                () => ({ path: '   ' }),
                TypeError,
            ],
            [
                'a path containing a null byte',
                (path) => ({ path: `${path}\0x` }),
                TypeError,
            ],
            [
                'a Buffer that is not valid UTF-8',
                () => ({
                    path: Buffer.from([
                        0xFF,
                        0xFE,
                        0xFD,
                    ]),
                }),
                TypeError,
            ],
            [
                'a zero maxPendingBytes',
                (path) => ({
                    maxPendingBytes: 0,
                    path,
                }),
                RangeError,
            ],
            [
                'a fractional maxPendingBytes',
                (path) => ({
                    maxPendingBytes: 1.5,
                    path,
                }),
                RangeError,
            ],
            [
                'rotate without interval or maxFileSize',
                (path) => ({
                    path,
                    rotate: {},
                }),
                TypeError,
            ],
            [
                'a null rotate',
                (path) => ({
                    path,
                    rotate: null,
                }),
                TypeError,
            ],
            [
                'a bad interval',
                (path) => ({
                    path,
                    rotate: { interval: 'weekly' },
                }),
                TypeError,
            ],
            [
                'a zero maxFiles',
                (path) => ({
                    path,
                    rotate: {
                        maxFiles: 0,
                        maxFileSize: '1K',
                    },
                }),
                RangeError,
            ],
            [
                'a fractional maxFiles',
                (path) => ({
                    path,
                    rotate: {
                        maxFiles: 1.5,
                        maxFileSize: '1K',
                    },
                }),
                RangeError,
            ],
            [
                'a non-boolean compress',
                (path) => ({
                    path,
                    rotate: {
                        compress: 'gzip',
                        maxFileSize: '1K',
                    },
                }),
                TypeError,
            ],
            [
                'a maxFileSize without a unit',
                (path) => ({
                    path,
                    rotate: { maxFileSize: '10' },
                }),
                TypeError,
            ],
            [
                'a zero maxFileSize',
                (path) => ({
                    path,
                    rotate: { maxFileSize: '0K' },
                }),
                TypeError,
            ],
            [
                'a bad maxTotalSize',
                (path) => ({
                    path,
                    rotate: {
                        maxFileSize: '1K',
                        maxTotalSize: '1T',
                    },
                }),
                TypeError,
            ],
            [
                'a maxFileSize beyond the safe integer range',
                (path) => ({
                    path,
                    rotate: { maxFileSize: '9007199254740992B' },
                }),
                RangeError,
            ],
        ])(
            'should reject the factory for %s without creating the target directory',
            async (
                [
                    , createFile,
                    errorType,
                ],
                { expect },
            ) => {
                const path = join(directory, 'nested', 'app.log');

                await expect(createNodeLogger({ file: createFile(path) as never })).rejects.toBeInstanceOf(errorType);

                expect(existsSync(join(directory, 'nested'))).toBe(false);
            },
        );

        it('should reject invalid shared options from the factory', async ({ expect }) => {
            await expect(createNodeLogger({ level: 'bogus' as never })).rejects.toBeInstanceOf(TypeError);
        });
    });

    describe('argument inspection', () => {
        it('should run custom inspect callbacks like console.log', async ({ expect }) => {
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                console: false,
                file: { path },
                icons: false,
                timestamp: false,
            });

            const filePath = new Path('/tmp/a');
            await logger.info(filePath, new PrecisionNumber('1.5'));

            await logger.close();

            // Path normalizes separators per platform, so the expected text comes from the instance.
            await expect(readFile(path, 'utf8')).resolves.toBe(`${filePath.value} 1.50\n`);
        });

        it('should write [uninspectable value] for a throwing custom inspect, keep other arguments, and report a format diagnostic', async ({ expect }) => {
            const streams = mockStreams();
            const path = join(directory, 'app.log');
            const onError = vi.fn();
            const logger = await createTrackedLogger({
                file: { path },
                icons: false,
                onError,
                timestamp: false,
            });

            const uninspectable = {
                [Symbol.for('nodejs.util.inspect.custom')]() {
                    throw new Error('inspect broke');
                },
            };

            await expect(logger.info('before', uninspectable, { ok: 1 }, 'after')).resolves.toBeUndefined();
            await logger.close();

            const expected = 'before [uninspectable value] { ok: 1 } after\n';

            expect(writtenText(streams.stdout)).toBe(expected);
            await expect(readFile(path, 'utf8')).resolves.toBe(expected);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'format' }));
        });
    });

    describe('file stream failure', () => {
        it('should disable file output, report a file diagnostic, and keep console output working', async ({ expect }) => {
            vi.spyOn(Path.prototype, 'createWriteStream').mockImplementation(() => new Writable({
                write(chunk: Buffer, _encoding, callback) {
                    callback(chunk.length ? new Error('disk full') : null);
                },
            }) as never);

            const streams = mockStreams();
            const onError = vi.fn();
            const logger = await createTrackedLogger({
                file: { path: join(directory, 'app.log') },
                icons: false,
                onError,
                timestamp: false,
            });

            await expect(logger.info('first')).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'file' }));
            expect(logger.getStats()).toEqual({
                errorEventCount: 1,
                failedCount: 1,
                overflowCount: 0,
                pendingBytes: 0,
            });

            await expect(logger.info('second')).resolves.toBeUndefined();
            await expect(logger.info('third')).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(logger.getStats()).toEqual({
                errorEventCount: 1,
                failedCount: 3,
                overflowCount: 0,
                pendingBytes: 0,
            });

            expect(writtenText(streams.stdout)).toBe('first\nsecond\nthird\n');
            await expect(logger.close()).resolves.toBeUndefined();
        });

        it('should count every in-flight record of a burst as failed when the stream fails', async ({ expect }) => {
            vi.spyOn(Path.prototype, 'createWriteStream').mockImplementation(() => new Writable({
                write(chunk: Buffer, _encoding, callback) {
                    callback(chunk.length ? new Error('disk full') : null);
                },
            }) as never);

            const onError = vi.fn();
            const logger = await createTrackedLogger({
                console: false,
                file: { path: join(directory, 'app.log') },
                icons: false,
                onError,
                timestamp: false,
            });

            await Promise.all(Array.from({ length: 5 }, async () => await logger.info('record')));

            expect(logger.getStats()).toEqual({
                errorEventCount: 1,
                failedCount: 5,
                overflowCount: 0,
                pendingBytes: 0,
            });

            expect(onError).toHaveBeenCalledTimes(1);

            await logger.info('later');

            expect(logger.getStats().failedCount).toBe(6);
        });
    });

    describe('file open failure', () => {
        it('should reject the factory without reporting a diagnostic when the path is a directory', async ({ expect }) => {
            const onError = vi.fn();

            await expect(createNodeLogger({
                console: false,
                file: { path: directory },
                onError,
            })).rejects.toMatchObject({ code: 'EISDIR' });

            expect(onError).not.toHaveBeenCalled();
        });

        it('should resolve close() and report one file diagnostic when the stream fails while closing', async ({ expect }) => {
            const failure = new Error('flush failed');
            const stream = new Writable({
                final(callback) {
                    callback(failure);
                },
                write(_chunk, _encoding, callback) {
                    callback();
                },
            });

            vi.resetModules();
            vi.doMock('rotating-file-stream', () => ({ createStream: () => stream }));
            const { createNodeLogger: createIsolatedLogger } = await import('../../src/logger/node');
            const onError = vi.fn();
            const logger = await createIsolatedLogger({
                console: false,
                file: {
                    path: join(directory, 'app.log'),
                    rotate: { maxFileSize: '1K' },
                },
                onError,
            });

            loggers.push(logger);
            await logger.info('record');

            await expect(logger.close()).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                error: failure,
                type: 'file',
            }));

            expect(logger.getStats().pendingBytes).toBe(0);
        });
    });

    describe('backpressure', () => {
        it('should accept a record whose multibyte line exactly fills maxPendingBytes', async ({ expect }) => {
            const line = 'ℹ 日本語\n';
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                console: false,
                file: {
                    maxPendingBytes: Buffer.byteLength(line),
                    path,
                },
                onError: vi.fn(),
                timestamp: false,
            });

            await logger.info('日本語');

            expect(logger.getStats().overflowCount).toBe(0);

            await logger.close();

            await expect(readFile(path, 'utf8')).resolves.toBe(line);
        });

        it('should drop a record larger than maxPendingBytes, report overflow, and still resolve', async ({ expect }) => {
            vi.useFakeTimers({
                toFake: [
                    'Date',
                    'performance',
                ],
            });

            const path = join(directory, 'app.log');
            const onError = vi.fn();
            const logger = await createTrackedLogger({
                console: false,
                file: {
                    maxPendingBytes: 16,
                    path,
                },
                icons: false,
                onError,
                timestamp: false,
            });

            await expect(logger.info('x'.repeat(100))).resolves.toBeUndefined();

            expect(logger.getStats()).toEqual({
                errorEventCount: 0,
                failedCount: 0,
                overflowCount: 1,
                pendingBytes: 0,
            });

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                overflowCount: 1,
                type: 'overflow',
            }));

            await logger.info('y'.repeat(100));

            expect(onError).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(1500);
            await logger.info('z'.repeat(100));

            expect(logger.getStats().overflowCount).toBe(3);
            expect(onError).toHaveBeenCalledTimes(2);
            expect(onError.mock.calls[1]![0]).toMatchObject({
                overflowCount: 3,
                suppressedCount: 1,
                type: 'overflow',
            });

            await logger.info('ok');
            await logger.close();

            await expect(readFile(path, 'utf8')).resolves.toBe('ok\n');
        });

        it('should drop records that do not fit alongside still-pending writes', async ({ expect }) => {
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                console: false,
                file: {
                    maxPendingBytes: 20,
                    path,
                },
                icons: false,
                onError: vi.fn(),
                timestamp: false,
            });

            const first = logger.info('aaaaaaaaaaaa');
            const second = logger.info('bbbbbbbbbbbb');

            expect(logger.getStats().pendingBytes).toBe(13);

            await Promise.all([
                first,
                second,
            ]);

            expect(logger.getStats()).toEqual({
                errorEventCount: 0,
                failedCount: 0,
                overflowCount: 1,
                pendingBytes: 0,
            });

            await logger.close();

            await expect(readFile(path, 'utf8')).resolves.toBe('aaaaaaaaaaaa\n');
        });
    });

    describe('api shape', () => {
        it('should return a frozen stats snapshot', async ({ expect }) => {
            const withFile = await createTrackedLogger({
                console: false,
                file: { path: join(directory, 'app.log') },
            });

            const snapshot = withFile.getStats();

            expect(Object.isFrozen(snapshot)).toBe(true);
            expect(snapshot).toEqual({
                errorEventCount: 0,
                failedCount: 0,
                overflowCount: 0,
                pendingBytes: 0,
            });

            expect(withFile.getStats()).not.toBe(snapshot);

            const withoutFile = await createTrackedLogger({ console: false });

            expect(Object.isFrozen(withoutFile.getStats())).toBe(true);
            expect(withoutFile.getStats()).toEqual({
                errorEventCount: 0,
                failedCount: 0,
                overflowCount: 0,
                pendingBytes: 0,
            });
        });

        it('should return a frozen logger object', async ({ expect }) => {
            const logger = await createTrackedLogger({ console: false });

            expect(Object.isFrozen(logger)).toBe(true);
        });
    });

    describe('close', () => {
        it('should keep close() pending until an accepted console write completes', async ({ expect }) => {
            const callbacks: Array<(error?: Error | null) => void> = [];
            mockStreams((callback) => {
                if (callback) callbacks.push(callback);
            });

            const logger = await createTrackedLogger({
                icons: false,
                timestamp: false,
            });

            const write = logger.info('pending');
            let closed = false;
            const closing = logger.close().then(() => {
                closed = true;
            });

            await sleep(20);

            expect(callbacks).toHaveLength(1);
            expect(closed).toBe(false);

            callbacks[0]!();
            await closing;

            expect(closed).toBe(true);
            await expect(write).resolves.toBeUndefined();
        });

        it('should flush every accepted file write before resolving', async ({ expect }) => {
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                console: false,
                file: { path },
                icons: false,
                timestamp: false,
            });

            const writes = Array.from({ length: 50 }, async (_, index) => await logger.info(`line ${index}`));
            await logger.close();

            expect(logger.getStats().pendingBytes).toBe(0);

            const lines = (await readFile(path, 'utf8')).trimEnd().split('\n');

            expect(lines).toEqual(Array.from({ length: 50 }, (_, index) => `line ${index}`));
            await Promise.all(writes);
        });

        it('should be idempotent', async ({ expect }) => {
            const logger = await createTrackedLogger({
                console: false,
                file: { path: join(directory, 'app.log') },
            });

            const first = logger.close();
            const second = logger.close();

            await expect(Promise.all([
                first,
                second,
            ])).resolves.toEqual([
                undefined,
                undefined,
            ]);

            await expect(logger.close()).resolves.toBeUndefined();
        });

        it('should drop a record logged while close() is in flight and still flush the earlier one', async ({ expect }) => {
            const path = join(directory, 'app.log');
            const onError = vi.fn();
            const logger = await createTrackedLogger({
                console: false,
                file: { path },
                icons: false,
                onError,
                timestamp: false,
            });

            const first = logger.info('first');
            const closing = logger.close();
            await logger.info('late');
            await closing;
            await first;

            expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'closed' }));
            await expect(readFile(path, 'utf8')).resolves.toBe('first\n');
        });

        it('should resolve later log calls, report a closed diagnostic, and write nothing', async ({ expect }) => {
            const streams = mockStreams();
            const path = join(directory, 'app.log');
            const onError = vi.fn();
            const logger = await createTrackedLogger({
                file: { path },
                icons: false,
                onError,
                timestamp: false,
            });

            await logger.info('before');
            await logger.close();
            streams.stdout.mockClear();

            await expect(logger.info('after')).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'closed' }));
            expect(streams.stdout).not.toHaveBeenCalled();
            await expect(readFile(path, 'utf8')).resolves.toBe('before\n');
        });
    });

    describe('rotation', () => {
        it('should rotate by size into gzip history files and keep at most maxFiles', async ({ expect }) => {
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                console: false,
                file: {
                    path,
                    rotate: {
                        maxFiles: 2,
                        maxFileSize: '1K',
                    },
                },
                icons: false,
                timestamp: false,
            });

            for (let index = 0; index < 40; index++) await logger.info(`${String(index).padStart(3, '0')} ${'x'.repeat(100)}`);
            await logger.close();

            const files = await readdir(directory);
            const history = files.filter((name) => name.endsWith('.gz'));

            expect(files).toContain('app.log');
            expect(history).toHaveLength(2);

            const texts = [
                ...await Promise.all(history.map(async (name) => gunzipSync(await readFile(join(directory, name))).toString('utf8'))),
                await readFile(path, 'utf8'),
            ];

            const indexGroups = texts
                .map((text) => text.split('\n').filter(Boolean))
                .filter((lines) => lines.length)
                .map((lines) => lines.map((line) => {
                    expect(line).toMatch(/^\d{3} x{100}$/);
                    return Number(line.slice(0, 3));
                }))
                .toSorted((first, second) => first[0]! - second[0]!);

            const retained = indexGroups.flat();

            expect(retained.length).toBeGreaterThan(0);
            expect(retained.at(-1)).toBe(39);
            expect(retained).toEqual(Array.from(
                { length: retained.length },
                (_, index) => 40 - retained.length + index,
            ));
        });

        it('should not be affected by caller mutation of the rotate object after the factory is called', async ({ expect }) => {
            const rotate = {
                maxFiles: 5,
                maxFileSize: '1K',
            };

            const pending = createTrackedLogger({
                console: false,
                file: {
                    path: join(directory, 'app.log'),
                    rotate,
                },
                icons: false,
                timestamp: false,
            });

            rotate.maxFileSize = 'bad';
            rotate.maxFiles = 0;
            const logger = await pending;

            for (let index = 0; index < 20; index++) await logger.info(`${String(index).padStart(3, '0')} ${'x'.repeat(100)}`);
            await logger.close();

            const history = (await readdir(directory)).filter((name) => name.endsWith('.gz'));

            expect(history.length).toBeGreaterThan(0);
            expect(history.length).toBeLessThanOrEqual(5);
        });

        it('should archive records left in the active file by an earlier period instead of the next one', async ({ expect }) => {
            const path = join(directory, 'app.log');
            await writeFile(path, 'yesterday\n');
            const yesterday = new Date(Date.now() - (24 * 60 * 60 * 1000));
            await utimes(path, yesterday, yesterday);

            const logger = await createTrackedLogger({
                console: false,
                file: {
                    path,
                    rotate: {
                        compress: false,
                        interval: 'daily',
                    },
                },
                icons: false,
                timestamp: false,
            });

            await logger.info('today');
            await logger.close();

            const history = (await readdir(directory)).filter((name) => name !== 'app.log' && !name.endsWith('.txt'));

            expect(history).toHaveLength(1);
            await expect(readFile(join(directory, history[0]!), 'utf8')).resolves.toBe('yesterday\n');
            await expect(readFile(path, 'utf8')).resolves.toBe('today\n');
        });

        it('should keep the history files within maxTotalSize', async ({ expect }) => {
            const logger = await createTrackedLogger({
                console: false,
                file: {
                    path: join(directory, 'app.log'),
                    rotate: {
                        compress: false,
                        maxFileSize: '1K',
                        maxTotalSize: '2K',
                    },
                },
                icons: false,
                timestamp: false,
            });

            for (let index = 0; index < 60; index++) await logger.info(`${String(index).padStart(3, '0')} ${'x'.repeat(100)}`);
            await logger.close();

            const history = (await readdir(directory)).filter((name) => name !== 'app.log' && !name.endsWith('.txt'));
            const sizes = await Promise.all(history.map(async (name) => (await stat(join(directory, name))).size));

            expect(history.length).toBeGreaterThan(0);
            expect(sizes.reduce((total, size) => total + size, 0)).toBeLessThanOrEqual(2048);
        });

        it('should report rotation cleanup warnings with the rotation diagnostic type and count them', async ({ expect }) => {
            const stream = new Writable({
                write(_chunk, _encoding, callback) {
                    callback();
                },
            });

            vi.resetModules();
            vi.doMock('rotating-file-stream', () => ({ createStream: () => stream }));
            const { createNodeLogger: createIsolatedLogger } = await import('../../src/logger/node');
            const onError = vi.fn();
            const logger = await createIsolatedLogger({
                console: false,
                file: {
                    path: join(directory, 'app.log'),
                    rotate: { maxFileSize: '1K' },
                },
                onError,
            });

            loggers.push(logger);
            const warning = new Error('cleanup failed');
            stream.emit('warning', warning);

            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                error: warning,
                type: 'rotation',
            }));

            expect(logger.getStats().errorEventCount).toBe(1);

            await logger.info('still writing');

            expect(logger.getStats()).toEqual({
                errorEventCount: 1,
                failedCount: 0,
                overflowCount: 0,
                pendingBytes: 0,
            });
        });

        it('should keep plain-text history files when compress is false', async ({ expect }) => {
            const logger = await createTrackedLogger({
                console: false,
                file: {
                    path: join(directory, 'app.log'),
                    rotate: {
                        compress: false,
                        maxFileSize: '1K',
                    },
                },
                icons: false,
                timestamp: false,
            });

            for (let index = 0; index < 20; index++) await logger.info(`${String(index).padStart(3, '0')} ${'x'.repeat(100)}`);
            await logger.close();

            const names = (await readdir(directory)).filter((name) => !name.endsWith('.txt'));
            const history = names.filter((name) => name !== 'app.log');
            const contents = await Promise.all(names.map(async (name) => await readFile(join(directory, name), 'utf8')));
            const lines = contents.flatMap((text) => text.split('\n').filter(Boolean)).toSorted();

            expect(history.length).toBeGreaterThan(0);
            expect(history.some((name) => name.endsWith('.gz'))).toBe(false);
            expect(lines).toEqual(Array.from({ length: 20 }, (_, index) => `${String(index).padStart(3, '0')} ${'x'.repeat(100)}`));
        });
    });

    describe('rotation dependency', () => {
        it('should reject with a descriptive error and cause when rotating-file-stream cannot be imported', async ({ expect }) => {
            const failure = new Error('module not found');
            vi.resetModules();
            vi.doMock(
                'rotating-file-stream',
                () => {
                    throw failure;
                },
            );

            const { createNodeLogger: createIsolatedLogger } = await import('../../src/logger/node');
            const error = await createIsolatedLogger({
                file: {
                    path: join(directory, 'nested', 'app.log'),
                    rotate: { maxFileSize: '1K' },
                },
            }).catch((error_: unknown) => error_);

            expect(error).toBeInstanceOf(Error);
            expect((error as Error).message).toMatch(/rotating-file-stream/);
            expect((error as Error).cause).toBeDefined();
            expect(existsSync(join(directory, 'nested'))).toBe(false);
        });
    });

    describe('console output', () => {
        it.for<[LoggerMethod, 'stderr' | 'stdout']>([
            [
                'trace',
                'stdout',
            ],
            [
                'debug',
                'stdout',
            ],
            [
                'info',
                'stdout',
            ],
            [
                'success',
                'stdout',
            ],
            [
                'warn',
                'stderr',
            ],
            [
                'error',
                'stderr',
            ],
            [
                'fatal',
                'stderr',
            ],
        ])(
            'should write %s to %s with a trailing newline',
            async ([method, stream], { expect }) => {
                const streams = mockStreams();
                const logger = await createTrackedLogger({
                    icons: false,
                    level: 'trace',
                    timestamp: false,
                });

                await logger[method]('hello');

                expect(streams[stream === 'stdout' ? 'stderr' : 'stdout']).not.toHaveBeenCalled();
                expect(writtenText(streams[stream])).toBe('hello\n');
            },
        );

        it('should render the same text to console and file apart from ANSI', async ({ expect }) => {
            vi.useFakeTimers({
                toFake: [
                    'Date',
                    'performance',
                ],
            });

            vi.setSystemTime(new Date(2026, 0, 5, 3, 4, 5, 6));
            const streams = mockStreams();
            forceStreamColors(process.stdout, false);
            forceStreamColors(process.stderr, false);
            const path = join(directory, 'app.log');
            const logger = await createTrackedLogger({
                file: { path },
                prefix: 'pre',
                suffix: 'suf',
            });

            await logger.info('msg', { a: 1 });
            await logger.error('failed');
            await logger.close();

            const expectedInfo = 'ℹ [2026-01-05 03:04:05.006] pre msg { a: 1 } suf\n';
            const expectedError = '✖ [2026-01-05 03:04:05.006] pre failed suf\n';

            expect(writtenText(streams.stdout)).toBe(expectedInfo);
            expect(writtenText(streams.stderr)).toBe(expectedError);
            await expect(readFile(path, 'utf8')).resolves.toBe(expectedInfo + expectedError);
        });

        it('should report a console diagnostic and still resolve when a console write fails', async ({ expect }) => {
            const failure = new Error('stdout broke');
            mockStreams((callback) => callback?.(failure));
            const onError = vi.fn();
            const logger = await createTrackedLogger({ onError });

            await expect(logger.info('x')).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                error: failure,
                type: 'console',
            }));
        });

        it('should report a console diagnostic and still resolve when write() throws synchronously', async ({ expect }) => {
            vi.spyOn(process.stdout, 'write').mockImplementation(() => {
                throw new Error('sync failure');
            });

            const onError = vi.fn();
            const logger = await createTrackedLogger({ onError });

            await expect(logger.info('x')).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'console' }));
        });

        it('should settle pending console writes with a diagnostic when the stream emits an error', async ({ expect }) => {
            const failure = new Error('stream error');
            mockStreams(() => {});
            const onError = vi.fn();
            const logger = await createTrackedLogger({ onError });

            const pending = logger.info('x');
            process.stdout.emit('error', failure);

            await expect(pending).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                error: failure,
                type: 'console',
            }));
        });

        it('should share exactly one permanent listener per stream across loggers and module copies', async ({ expect }) => {
            const streams = stubProcessStreams();
            const loadedLoggers: NodeLogger[] = [];
            for (let copy = 0; copy < 3; copy++) {
                vi.resetModules();
                const { createNodeLogger: createFreshNodeLogger } = await import('../../src/logger/node');
                const logger = await createFreshNodeLogger();
                loggers.push(logger);
                loadedLoggers.push(logger);
                await logger.info(`copy ${copy}`);
            }

            expect(streams.stdout.listenerCount('error')).toBe(1);
            expect(streams.stdout.listenerCount('close')).toBe(1);
            expect(streams.stderr.listenerCount('error')).toBe(0);

            await Promise.all(loadedLoggers.map(async (logger) => await logger.close()));

            expect(streams.stdout.listenerCount('error')).toBe(1);
            expect(streams.stdout.listenerCount('close')).toBe(1);
            expect(() => streams.stdout.emit('error', new Error('late'))).not.toThrow();
        });

        it('should not attach stream listeners for loggers that never write to the console', async ({ expect }) => {
            const streams = stubProcessStreams();
            const logger = await createTrackedLogger({
                console: false,
                file: { path: join(directory, 'app.log') },
            });

            await logger.error('x');
            await logger.info('y');
            await logger.close();

            for (const stream of [
                streams.stderr,
                streams.stdout,
            ]) {
                expect(stream.listenerCount('error')).toBe(0);
                expect(stream.listenerCount('close')).toBe(0);
            }
        });

        it('should write the diagnostic fallback to stderr only when no onError is given', async ({ expect }) => {
            const withoutHandler = await createTrackedLogger({ console: false });
            const withHandler = await createTrackedLogger({
                console: false,
                onError: vi.fn(),
            });

            await Promise.all([
                withoutHandler.close(),
                withHandler.close(),
            ]);

            vi.mocked(writeSync).mockClear();
            await withHandler.info('late');

            expect(writeSync).not.toHaveBeenCalled();

            await withoutHandler.info('late');

            expect(writeSync).toHaveBeenCalledWith(2, '[logger] Logger is closed.\n');
        });
    });
});
