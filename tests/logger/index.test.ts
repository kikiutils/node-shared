import { setTimeout as sleep } from 'node:timers/promises';
import {
    inspect,
    stripVTControlCharacters,
} from 'node:util';
import { runInNewContext } from 'node:vm';

import {
    objectEntries,
    objectValues,

} from 'ts-extras';
import type { UnknownRecord } from 'type-fest';
import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import { createLogger } from '../../src/logger';
import {
    formatLoggerConsoleArgs,
    formatLoggerTime,
    supportsLoggerColor,
} from '../../src/logger/_internals/formatter';
import { createDiagnosticReporter } from '../../src/logger/_internals/logger';
import type { LoggerRecord } from '../../src/logger/_internals/types';
import type {
    LoggerDiagnostic,
    LoggerLevel,
    LoggerMethod,
} from '../../src/logger/types';

const allMethods: LoggerMethod[] = [
    'trace',
    'debug',
    'info',
    'success',
    'warn',
    'error',
    'fatal',
];

async function collectEmittedMethods(logger: Record<LoggerMethod, (...args: unknown[]) => Promise<void>>) {
    const spies = mockConsole();
    for (const method of allMethods) await logger[method](method);
    const emitted = [
        ...spies.debug.mock.calls,
        ...spies.info.mock.calls,
        ...spies.warn.mock.calls,
        ...spies.error.mock.calls,
    ].map((call) => renderCall(call));

    return allMethods.filter((method) => emitted.includes(method));
}

/**
 * `unhandledRejection` fires after the microtask queue drains, so observation continues for ~20 ms after the callback.
 */
async function collectUnhandledRejections(callback: () => Promise<void> | void) {
    const rejections: unknown[] = [];
    const listener = (reason: unknown) => rejections.push(reason);
    process.on('unhandledRejection', listener);
    try {
        await callback();
        await sleep(20);
    } finally {
        process.off('unhandledRejection', listener);
    }

    return rejections;
}

function createRecord(overrides: Partial<LoggerRecord> = {}): LoggerRecord {
    return {
        args: [],
        console: true,
        date: new Date(2026, 0, 5, 3, 4, 5, 6),
        icons: false,
        prefix: '',
        suffix: '',
        timestamp: false,
        type: 'info',
        ...overrides,
    };
}

function mockConsole() {
    const noop = () => {};
    return {
        debug: vi.spyOn(console, 'debug').mockImplementation(noop),
        error: vi.spyOn(console, 'error').mockImplementation(noop),
        info: vi.spyOn(console, 'info').mockImplementation(noop),
        warn: vi.spyOn(console, 'warn').mockImplementation(noop),
    };
}

function renderCall(call: unknown[]) {
    return call
        .slice(1)
        .map((part) => typeof part === 'string' ? stripVTControlCharacters(part) : inspect(part))
        .join(' ');
}

/**
 * Fakes both clocks the diagnostic rate limit and the timestamps may read.
 */
function useFakeClock(time: Date | number) {
    vi.useFakeTimers({
        toFake: [
            'Date',
            'performance',
        ],
    });

    vi.setSystemTime(time);
}

beforeEach(() => {
    vi.stubEnv('LOG_LEVEL', '');
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
});

describe('createLogger', () => {
    describe('level filtering', () => {
        it('should emit info and above by default', async ({ expect }) => {
            vi.stubEnv('LOG_LEVEL', undefined);
            const logger = createLogger({
                icons: false,
                timestamp: false,
            });

            await expect(collectEmittedMethods(logger)).resolves.toEqual([
                'info',
                'success',
                'warn',
                'error',
                'fatal',
            ]);
        });

        it.for<[LoggerLevel, LoggerMethod[]]>([
            [
                'trace',
                allMethods,
            ],
            [
                'debug',
                allMethods.filter((method) => method !== 'trace'),
            ],
            [
                'info',
                [
                    'info',
                    'success',
                    'warn',
                    'error',
                    'fatal',
                ],
            ],
            [
                'warn',
                [
                    'warn',
                    'error',
                    'fatal',
                ],
            ],
            [
                'error',
                [
                    'error',
                    'fatal',
                ],
            ],
            [
                'fatal',
                ['fatal'],
            ],
            [
                'silent',
                [],
            ],
        ])(
            'should emit the methods enabled by the %s threshold',
            async ([level, expected], { expect }) => {
                const logger = createLogger({
                    icons: false,
                    level,
                    timestamp: false,
                });

                await expect(collectEmittedMethods(logger)).resolves.toEqual(expected);
                for (const method of allMethods) expect(logger.isLevelEnabled(method)).toBe(expected.includes(method));
            },
        );

        it.for([
            'warn',
            ' WARN ',
            'Warn\n',
        ])(
            'should read LOG_LEVEL %j with whitespace and case normalization',
            async (value, { expect }) => {
                vi.stubEnv('LOG_LEVEL', value);
                const onError = vi.fn();
                const logger = createLogger({
                    icons: false,
                    onError,
                    timestamp: false,
                });

                await expect(collectEmittedMethods(logger)).resolves.toEqual([
                    'warn',
                    'error',
                    'fatal',
                ]);

                expect(onError).not.toHaveBeenCalled();
            },
        );

        it('should read LOG_LEVEL again on every call', async ({ expect }) => {
            vi.stubEnv('LOG_LEVEL', 'error');
            const spies = mockConsole();
            const logger = createLogger({
                icons: false,
                timestamp: false,
            });

            await logger.warn('hidden');

            expect(spies.warn).not.toHaveBeenCalled();
            expect(logger.isLevelEnabled('warn')).toBe(false);

            vi.stubEnv('LOG_LEVEL', 'debug');
            await logger.debug('shown');

            expect(spies.debug).toHaveBeenCalledTimes(1);
            expect(logger.isLevelEnabled('trace')).toBe(false);
            expect(logger.isLevelEnabled('debug')).toBe(true);

            vi.stubEnv('LOG_LEVEL', undefined);

            expect(logger.isLevelEnabled('debug')).toBe(false);
            expect(logger.isLevelEnabled('info')).toBe(true);
        });

        it('should treat an empty LOG_LEVEL as unset without a diagnostic', async ({ expect }) => {
            vi.stubEnv('LOG_LEVEL', '');
            const onError = vi.fn();
            const logger = createLogger({ onError });

            expect(logger.isLevelEnabled('info')).toBe(true);
            expect(logger.isLevelEnabled('debug')).toBe(false);
            expect(onError).not.toHaveBeenCalled();
        });

        it.for([
            'verbose',
            'success',
            'env',
        ])(
            'should fall back to info and report one invalid-level diagnostic for LOG_LEVEL %j',
            async (value, { expect }) => {
                vi.stubEnv('LOG_LEVEL', value);
                mockConsole();
                const onError = vi.fn();
                const logger = createLogger({
                    icons: false,
                    onError,
                    timestamp: false,
                });

                await logger.info('one');
                await logger.debug('two');
                await logger.warn('three');

                expect(logger.isLevelEnabled('info')).toBe(true);
                expect(logger.isLevelEnabled('debug')).toBe(false);
                expect(onError).toHaveBeenCalledTimes(1);
                expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'invalid-level' }));
            },
        );

        it('should write the invalid-level diagnostic to console.error only when there is no onError', ({ expect }) => {
            vi.stubEnv('LOG_LEVEL', 'verbose');
            const spies = mockConsole();

            createLogger().isLevelEnabled('info');

            expect(spies.error).toHaveBeenCalledWith('[logger] Invalid LOG_LEVEL; using info.');

            spies.error.mockClear();
            createLogger({ onError: vi.fn() }).isLevelEnabled('info');

            expect(spies.error).not.toHaveBeenCalled();
        });

        it('should prefer the level option over LOG_LEVEL without reading an invalid LOG_LEVEL', async ({ expect }) => {
            vi.stubEnv('LOG_LEVEL', 'nonsense');
            const onError = vi.fn();
            const logger = createLogger({
                level: 'debug',
                onError,
            });

            expect(logger.isLevelEnabled('debug')).toBe(true);
            expect(logger.isLevelEnabled('trace')).toBe(false);
            expect(onError).not.toHaveBeenCalled();
        });

        it('should prefer setLevel over LOG_LEVEL and restore env-driven filtering with setLevel("env")', async ({ expect }) => {
            vi.stubEnv('LOG_LEVEL', 'error');
            const logger = createLogger({ level: 'trace' });

            expect(logger.isLevelEnabled('trace')).toBe(true);

            logger.setLevel('warn');

            expect(logger.isLevelEnabled('info')).toBe(false);
            expect(logger.isLevelEnabled('warn')).toBe(true);

            logger.setLevel('env');

            expect(logger.isLevelEnabled('warn')).toBe(false);
            expect(logger.isLevelEnabled('error')).toBe(true);

            vi.stubEnv('LOG_LEVEL', 'debug');

            expect(logger.isLevelEnabled('debug')).toBe(true);
        });

        it('should start env-driven when the level option is "env"', async ({ expect }) => {
            vi.stubEnv('LOG_LEVEL', 'trace');

            expect(createLogger({ level: 'env' }).isLevelEnabled('trace')).toBe(true);
        });

        it('should never report silent as enabled', ({ expect }) => {
            const logger = createLogger({ level: 'info' });

            expect(logger.isLevelEnabled('silent')).toBe(false);

            logger.setLevel('silent');

            expect(logger.isLevelEnabled('silent')).toBe(false);
        });

        it.for([
            'verbose',
            '',
            null,
            1,
        ])(
            'should throw TypeError for the invalid level %j',
            (level, { expect }) => {
                const logger = createLogger();

                expect(() => createLogger({ level: level as never })).toThrow(TypeError);
                expect(() => logger.setLevel(level as never)).toThrow(TypeError);
                expect(() => logger.isLevelEnabled(level as never)).toThrow(TypeError);
            },
        );

        it('should reject success as a threshold in the factory and setLevel', ({ expect }) => {
            const logger = createLogger();

            expect(() => createLogger({ level: 'success' as never })).toThrow(TypeError);
            expect(() => logger.setLevel('success' as never)).toThrow(TypeError);
        });

        it('should throw TypeError when setLevel receives undefined and keep the current level', ({ expect }) => {
            const logger = createLogger({ level: 'warn' });

            expect(() => logger.setLevel(undefined as never)).toThrow(TypeError);
            expect(logger.isLevelEnabled('warn')).toBe(true);
            expect(logger.isLevelEnabled('info')).toBe(false);
        });
    });

    describe('console methods', () => {
        it.for<[LoggerMethod, 'debug' | 'error' | 'info' | 'warn', string]>([
            [
                'debug',
                'debug',
                '⚙',
            ],
            [
                'trace',
                'debug',
                '·',
            ],
            [
                'info',
                'info',
                'ℹ',
            ],
            [
                'success',
                'info',
                '✔',
            ],
            [
                'warn',
                'warn',
                '⚠',
            ],
            [
                'error',
                'error',
                '✖',
            ],
            [
                'fatal',
                'error',
                '✖',
            ],
        ])(
            'should write %s through console.%s with its icon',
            async (
                [
                    method,
                    consoleMethod,
                    icon,
                ],
                { expect },
            ) => {
                const spies = mockConsole();
                const logger = createLogger({
                    level: 'trace',
                    timestamp: false,
                });

                await logger[method]('hello', 42);

                for (const [name, spy] of objectEntries(spies)) {
                    expect(spy).toHaveBeenCalledTimes(name === consoleMethod ? 1 : 0);
                }

                expect(renderCall(spies[consoleMethod].mock.calls[0]!)).toBe(`${icon} hello 42`);
            },
        );

        it('should keep objects as separate console arguments', async ({ expect }) => {
            const spies = mockConsole();
            const value = { nested: { a: 1 } };
            const logger = createLogger({
                icons: false,
                timestamp: false,
            });

            await logger.info('data', value);

            expect(spies.info.mock.calls[0]).toContain(value);
        });
    });

    describe('presentation', () => {
        it('should emit nothing when console is false', async ({ expect }) => {
            const spies = mockConsole();
            const logger = createLogger({
                console: false,
                level: 'trace',
            });

            for (const method of allMethods) await logger[method]('hidden');

            for (const spy of objectValues(spies)) expect(spy).not.toHaveBeenCalled();
        });

        it('should render icon, local timestamp, prefix, message, and suffix', async ({ expect }) => {
            useFakeClock(new Date(2026, 0, 5, 3, 4, 5, 6));
            const spies = mockConsole();
            const logger = createLogger({
                prefix: 'pre',
                suffix: 'suf',
            });

            await logger.warn('message');

            expect(renderCall(spies.warn.mock.calls[0]!)).toBe('⚠ [2026-01-05 03:04:05.006] pre message suf');
        });

        it('should omit icons, timestamps, prefix, and suffix when disabled or empty', async ({ expect }) => {
            const spies = mockConsole();
            const logger = createLogger({
                icons: false,
                timestamp: false,
            });

            await logger.success('plain');

            expect(renderCall(spies.info.mock.calls[0]!)).toBe('plain');
        });

        it('should update presentation with configure() and keep unspecified settings', async ({ expect }) => {
            const spies = mockConsole();
            const logger = createLogger({
                icons: false,
                prefix: 'old',
                timestamp: false,
            });

            logger.configure({
                icons: true,
                prefix: 'new',
                suffix: 'end',
            });

            await logger.info('m');

            expect(renderCall(spies.info.mock.calls[0]!)).toBe('ℹ new m end');

            logger.configure({
                prefix: '',
                suffix: '',
                timestamp: true,
            });

            await logger.info('m');

            expect(renderCall(spies.info.mock.calls[1]!)).toMatch(/^ℹ \[\d{4}(?:-\d{2}){2} [\d:]{8}\.\d{3}\] m$/);

            logger.configure({ console: false });
            await logger.info('m');

            expect(spies.info).toHaveBeenCalledTimes(2);

            logger.configure({ console: true });
            await logger.info('m');

            expect(spies.info).toHaveBeenCalledTimes(3);
        });

        it.for([
            { console: 'yes' },
            { icons: 1 },
            { timestamp: null },
            { prefix: 1 },
            { suffix: {} },
        ])(
            'should throw TypeError for the invalid presentation %j',
            (options, { expect }) => {
                const logger = createLogger({ prefix: 'kept' });

                expect(() => createLogger(options as never)).toThrow(TypeError);
                expect(() => logger.configure(options as never)).toThrow(TypeError);
            },
        );

        it('should leave presentation unchanged when configure() throws', async ({ expect }) => {
            const spies = mockConsole();
            const logger = createLogger({
                icons: false,
                prefix: 'kept',
                timestamp: false,
            });

            expect(() => logger.configure({
                prefix: 'changed',
                timestamp: 'no' as never,
            })).toThrow(TypeError);

            await logger.info('m');

            expect(renderCall(spies.info.mock.calls[0]!)).toBe('kept m');
        });

        it.for([
            'handler',
            1,
            {},
            null,
        ])(
            'should throw TypeError when onError is %j',
            (onError, { expect }) => {
                expect(() => createLogger({ onError: onError as never })).toThrow(TypeError);
            },
        );
    });

    describe('failure containment', () => {
        it('should resolve and report a console diagnostic when the console method throws', async ({ expect }) => {
            const spies = mockConsole();
            const failure = new Error('console broke');
            spies.info.mockImplementation(() => {
                throw failure;
            });

            const onError = vi.fn();
            const logger = createLogger({ onError });

            await expect(logger.info('m')).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                error: failure,
                message: 'Console output failed.',
                type: 'console',
            }));

            expect(Object.isFrozen(onError.mock.calls[0]![0])).toBe(true);
        });

        it('should report once and not recurse when onError logs through the same logger', async ({ expect }) => {
            const spies = mockConsole();
            const failure = () => {
                throw new Error('console broke');
            };

            spies.info.mockImplementation(failure);
            spies.warn.mockImplementation(failure);
            const onError = vi.fn();
            const logger = createLogger({ onError });
            onError.mockImplementation(() => {
                void logger.warn('diagnostic');
            });

            await expect(logger.info('m')).resolves.toBeUndefined();

            expect(onError).toHaveBeenCalledTimes(1);
            expect(spies.warn).toHaveBeenCalledTimes(1);
        });

        it('should resolve, report console, and raise no unhandled rejection when console is replaced by a rejecting async function', async ({ expect }) => {
            const spies = mockConsole();
            const failure = new Error('async console broke');
            spies.info.mockImplementation((async () => {
                throw failure;
            }) as never);

            const onError = vi.fn();
            const logger = createLogger({ onError });

            const rejections = await collectUnhandledRejections(async () => {
                await expect(logger.info('m')).resolves.toBeUndefined();
            });

            expect(rejections).toEqual([]);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({
                error: failure,
                message: 'Console output failed.',
                type: 'console',
            }));
        });

        it('should not wait for a console replacement that never settles', async ({ expect }) => {
            const spies = mockConsole();
            spies.info.mockImplementation((async () => await new Promise<void>(() => {})) as never);
            const logger = createLogger();

            await expect(logger.info('m')).resolves.toBeUndefined();
            await expect(logger.info('again')).resolves.toBeUndefined();

            expect(spies.info).toHaveBeenCalledTimes(2);
        });

        it('should contain rejecting promises from another realm returned by console and onError', async ({ expect }) => {
            const spies = mockConsole();
            spies.info.mockImplementation((() => runInNewContext('Promise.reject(new Error("console"))')) as never);
            const onError = vi.fn(() => runInNewContext('Promise.reject(new Error("handler"))'));
            const logger = createLogger({ onError });

            const rejections = await collectUnhandledRejections(async () => {
                await expect(logger.info('m')).resolves.toBeUndefined();
            });

            expect(rejections).toEqual([]);
            expect(onError).toHaveBeenCalledTimes(1);
            expect(onError).toHaveBeenCalledWith(expect.objectContaining({ type: 'console' }));
        });

        it('should raise no unhandled rejection when the fallback console is an async function that rejects', async ({ expect }) => {
            const spies = mockConsole();
            spies.info.mockImplementation(() => {
                throw new Error('console broke');
            });

            spies.error.mockImplementation((async () => {
                throw new Error('async fallback broke');
            }) as never);

            const logger = createLogger();

            const rejections = await collectUnhandledRejections(async () => {
                await expect(logger.info('m')).resolves.toBeUndefined();
            });

            expect(rejections).toEqual([]);
            expect(spies.error).toHaveBeenCalledTimes(1);
        });
    });

    describe('api shape', () => {
        it('should return a frozen logger object', ({ expect }) => {
            const logger = createLogger();

            expect(Object.isFrozen(logger)).toBe(true);
            expect(() => {
                (logger as unknown as UnknownRecord).info = () => {};
            }).toThrow(TypeError);
        });

        it('should keep level and presentation independent between loggers', async ({ expect }) => {
            const spies = mockConsole();
            const first = createLogger({
                icons: false,
                level: 'error',
                timestamp: false,
            });

            const second = createLogger({
                icons: false,
                level: 'debug',
                timestamp: false,
            });

            first.setLevel('trace');
            first.configure({
                icons: true,
                prefix: 'first',
            });

            expect(second.isLevelEnabled('trace')).toBe(false);
            expect(second.isLevelEnabled('debug')).toBe(true);

            await second.info('m');

            expect(renderCall(spies.info.mock.calls[0]!)).toBe('m');

            second.setLevel('fatal');

            expect(first.isLevelEnabled('trace')).toBe(true);
        });
    });
});

describe('createDiagnosticReporter', () => {
    function createEvent(type: LoggerDiagnostic['type'] = 'console'): LoggerDiagnostic {
        return {
            message: `${type} failed`,
            type,
        };
    }

    it('should append the error detail to the fallback message', ({ expect }) => {
        useFakeClock(0);
        const fallback = vi.fn();
        const report = createDiagnosticReporter(undefined, fallback);

        report({
            ...createEvent('console'),
            error: new Error('EACCES: permission denied'),
        });

        vi.advanceTimersByTime(1000);
        report({
            ...createEvent('console'),
            error: 'plain failure',
        });

        expect(fallback.mock.calls.map(([message]) => message)).toEqual([
            '[logger] console failed EACCES: permission denied\n',
            '[logger] console failed plain failure\n',
        ]);
    });

    it('should suppress same-type diagnostics within one second and carry suppressedCount afterwards', ({ expect }) => {
        useFakeClock(0);
        const onError = vi.fn();
        const fallback = vi.fn();
        const reportToCallback = createDiagnosticReporter(onError);
        const reportToFallback = createDiagnosticReporter(undefined, fallback);

        for (const report of [
            reportToCallback,
            reportToFallback,
        ]) {
            report(createEvent());
            report(createEvent());
        }

        vi.advanceTimersByTime(500);
        reportToCallback(createEvent());
        reportToFallback(createEvent());
        vi.advanceTimersByTime(499);
        reportToCallback(createEvent());
        reportToFallback(createEvent());

        expect(onError).toHaveBeenCalledTimes(1);
        expect(onError.mock.calls[0]![0]).not.toHaveProperty('suppressedCount');
        expect(fallback).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1);
        reportToCallback(createEvent());
        reportToFallback(createEvent());

        expect(onError).toHaveBeenCalledTimes(2);
        expect(onError.mock.calls[1]![0]).toHaveProperty('suppressedCount', 3);
        expect(fallback).toHaveBeenCalledTimes(2);
        expect(fallback.mock.calls[1]![0]).toBe('[logger] console failed (3 similar diagnostics suppressed)\n');

        vi.advanceTimersByTime(1000);
        reportToCallback(createEvent());

        expect(onError).toHaveBeenCalledTimes(3);
        expect(onError.mock.calls[2]![0]).not.toHaveProperty('suppressedCount');
    });

    it('should measure the rate-limit window on the monotonic clock, not the system clock', ({ expect }) => {
        useFakeClock(new Date(2026, 0, 5, 12));
        const onError = vi.fn();
        const report = createDiagnosticReporter(onError);

        report(createEvent());
        vi.setSystemTime(new Date(2026, 0, 5, 11, 50));
        report(createEvent());

        expect(onError).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(1001);
        report(createEvent());

        expect(onError).toHaveBeenCalledTimes(2);
        expect(onError.mock.calls[1]![0]).toHaveProperty('suppressedCount', 1);
    });

    it('should rate-limit each diagnostic type independently, even while an async onError never settles', ({ expect }) => {
        useFakeClock(0);
        const onError = vi.fn<(event: LoggerDiagnostic) => unknown>(async () => await new Promise<void>(() => {}));
        const report = createDiagnosticReporter(onError);

        report(createEvent('console'));
        report(createEvent('file'));
        report(createEvent('overflow'));
        report(createEvent('console'));

        expect(onError.mock.calls.map(([event]) => event.type)).toEqual([
            'console',
            'file',
            'overflow',
        ]);
    });

    it('should contain a throwing onError and keep reporting later events', ({ expect }) => {
        useFakeClock(0);
        const onError = vi.fn(() => {
            throw new Error('handler broke');
        });

        const report = createDiagnosticReporter(onError);

        expect(() => report(createEvent('console'))).not.toThrow();
        expect(() => report(createEvent('file'))).not.toThrow();
        expect(onError).toHaveBeenCalledTimes(2);
    });

    it('should contain a throwing fallback', ({ expect }) => {
        const fallback = vi.fn(() => {
            throw new Error('fallback broke');
        });

        const report = createDiagnosticReporter(undefined, fallback);

        expect(() => report(createEvent('console'))).not.toThrow();
        expect(() => report(createEvent('file'))).not.toThrow();
        expect(fallback).toHaveBeenCalledTimes(2);
    });
});

describe('formatLoggerTime', () => {
    it('should format local time as [YYYY-MM-DD HH:mm:ss.SSS] with zero padding', ({ expect }) => {
        expect(formatLoggerTime(new Date(2026, 0, 5, 3, 4, 5, 6))).toBe('[2026-01-05 03:04:05.006]');
        expect(formatLoggerTime(new Date(2026, 11, 31, 23, 59, 59, 999))).toBe('[2026-12-31 23:59:59.999]');
        expect(formatLoggerTime(new Date(2026, 5, 15, 0, 0, 0, 120))).toBe('[2026-06-15 00:00:00.120]');
    });

    it('should use the local time zone rather than UTC', ({ expect }) => {
        vi.stubEnv('TZ', 'Asia/Taipei');

        expect(formatLoggerTime(new Date(Date.UTC(2026, 0, 4, 19, 4, 5, 6)))).toBe('[2026-01-05 03:04:05.006]');
    });
});

describe('supportsLoggerColor', () => {
    function clearColorEnvironment() {
        for (const name of [
            'FORCE_COLOR',
            'NO_COLOR',
            'NODE_DISABLE_COLORS',
            'TERM',
        ]) vi.stubEnv(name, undefined);
    }

    it('should defer to hasColors when present', ({ expect }) => {
        vi.stubEnv('FORCE_COLOR', '0');
        vi.stubEnv('NO_COLOR', '1');

        expect(supportsLoggerColor({ hasColors: () => true })).toBe(true);

        vi.stubEnv('FORCE_COLOR', '1');

        expect(supportsLoggerColor({
            hasColors: () => false,
            isTTY: true,
        })).toBe(false);
    });

    it.for([
        [
            '',
            true,
        ],
        [
            '1',
            true,
        ],
        [
            '0',
            false,
        ],
        [
            'false',
            false,
        ],
    ] as const)(
        'should resolve FORCE_COLOR=%j to %j regardless of TTY, NO_COLOR, and TERM',
        ([value, expected], { expect }) => {
            clearColorEnvironment();
            vi.stubEnv('FORCE_COLOR', value);
            vi.stubEnv('NO_COLOR', '1');
            vi.stubEnv('TERM', 'dumb');

            expect(supportsLoggerColor({ isTTY: false })).toBe(expected);
            expect(supportsLoggerColor({ isTTY: true })).toBe(expected);
        },
    );

    it('should enable colors for a TTY in a clean environment', ({ expect }) => {
        clearColorEnvironment();

        expect(supportsLoggerColor({ isTTY: true })).toBe(true);
        expect(supportsLoggerColor({ isTTY: false })).toBe(false);
        expect(supportsLoggerColor({})).toBe(false);
    });

    it.for([
        [
            'NO_COLOR',
            '1',
        ],
        [
            'NODE_DISABLE_COLORS',
            '1',
        ],
        [
            'TERM',
            'dumb',
        ],
    ])(
        'should disable colors for a TTY when %s=%s',
        ([name, value], { expect }) => {
            clearColorEnvironment();
            vi.stubEnv(name!, value);

            expect(supportsLoggerColor({ isTTY: true })).toBe(false);
        },
    );
});

describe('formatLoggerConsoleArgs', () => {
    describe('node.js branch', () => {
        function stubNodeProcess(colors: { stderr: boolean; stdout: boolean }) {
            vi.stubGlobal(
                'process',
                {
                    env: {},
                    stderr: { hasColors: () => colors.stderr },
                    stdout: { hasColors: () => colors.stdout },
                },
            );
        }

        it('should use %s for strings and %O for other values', ({ expect }) => {
            stubNodeProcess({
                stderr: false,
                stdout: false,
            });

            const value = { a: 1 };

            expect(formatLoggerConsoleArgs(createRecord({
                args: [
                    'message',
                    value,
                    7,
                ],
                icons: true,
                prefix: 'pre',
                suffix: 'suf',
                timestamp: true,
            }))).toEqual([
                '%s %s %s %s %O %O %s',
                'ℹ',
                '[2026-01-05 03:04:05.006]',
                'pre',
                'message',
                value,
                7,
                'suf',
            ]);
        });

        it('should add ANSI colors only when the target stream supports them', ({ expect }) => {
            stubNodeProcess({
                stderr: false,
                stdout: true,
            });

            const [, infoIcon] = formatLoggerConsoleArgs(createRecord({
                icons: true,
                type: 'info',
            }));

            const [, warnIcon] = formatLoggerConsoleArgs(createRecord({
                icons: true,
                type: 'warn',
            }));

            expect(infoIcon).toContain('\u001B[');
            expect(stripVTControlCharacters(infoIcon as string)).toBe('ℹ');
            expect(warnIcon).toBe('⚠');
        });
    });

    describe('browser branch', () => {
        it.for([
            [
                'without a process global',
                undefined,
            ],
            [
                'without stdout and stderr streams',
                {
                    env: {},
                    versions: { node: '26' },
                },
            ],
        ])(
            'should decorate presentation with CSS arguments %s',
            ([, processStub], { expect }) => {
                vi.stubGlobal('process', processStub);
                const value = { a: 1 };

                expect(formatLoggerConsoleArgs(createRecord({
                    args: [
                        'message',
                        value,
                    ],
                    icons: true,
                    prefix: 'pre',
                    suffix: 'suf',
                    timestamp: true,
                    type: 'success',
                }))).toEqual([
                    '%c✔%c %c[2026-01-05 03:04:05.006]%c %cpre%c message %o %csuf%c',
                    'color: #16a34a',
                    '',
                    'color: #808080',
                    '',
                    'color: #0891b2',
                    '',
                    value,
                    'color: #0891b2',
                    '',
                ]);
            },
        );

        it('should choose the branch per stream when only stdout exists', ({ expect }) => {
            vi.stubGlobal(
                'process',
                {
                    env: {},
                    stdout: { hasColors: () => false },
                },
            );

            const value = { a: 1 };

            expect(formatLoggerConsoleArgs(createRecord({
                args: [value],
                type: 'info',
            }))).toEqual([
                '%O',
                value,
            ]);

            expect(formatLoggerConsoleArgs(createRecord({
                args: [value],
                type: 'warn',
            }))).toEqual([
                '%o',
                value,
            ]);
        });

        it('should escape percent signs in strings and decorations while passing objects as separate arguments', ({ expect }) => {
            vi.stubGlobal('process', undefined);
            const value = { a: 1 };

            expect(formatLoggerConsoleArgs(createRecord({
                args: [
                    '50%d done',
                    value,
                ],
                prefix: '100%',
            }))).toEqual([
                '%c100%%%c 50%%d done %o',
                'color: #0891b2',
                '',
                value,
            ]);
        });

        it('should pass undecorated text as a single literal argument, which consoles print without substitution', ({ expect }) => {
            vi.stubGlobal('process', undefined);

            expect(formatLoggerConsoleArgs(createRecord({
                args: [
                    '50%',
                    'done',
                ],
            }))).toEqual(['50% done']);
        });

        it('should write browser-formatted arguments through the logger when no Node.js process exists', async ({ expect }) => {
            vi.stubGlobal('process', undefined);
            const spies = mockConsole();
            const logger = createLogger({
                level: 'info',
                timestamp: false,
            });

            await logger.error('failed');

            expect(spies.error).toHaveBeenCalledWith(
                '%c✖%c failed',
                'color: #dc2626',
                '',
            );
        });
    });
});
