import {
    objectHasOwn,
    objectKeys,
} from 'ts-extras';

import type {
    Logger,
    LoggerDiagnostic,
    LoggerLevel,
    LoggerMethod,
    LoggerOptions,
} from '../types';

import { loggerMethods } from './levels';
import type { LoggerRecord } from './types';

interface LoggerHooks {
    /**
     * A non-throwing reporter created by createDiagnosticReporter.
     */
    report: (event: LoggerDiagnostic) => void;
    write: (record: LoggerRecord) => Promise<void> | void;
}

// Constants/Variables
const booleanPresentationKeys = [
    'console',
    'icons',
    'timestamp',
] as const;

const stringPresentationKeys = [
    'prefix',
    'suffix',
] as const;

// Functions

/**
 * Contains sync throws and async rejections from diagnostic sinks; the reporter prevents synchronous re-entry.
 */
function callContained<T>(callback: ((value: T) => unknown) | undefined, value: T) {
    try {
        const result: unknown = callback?.(value);
        // A thenable check, not `instanceof Promise`, also covers promises from other realms such as `node:vm`.
        if (typeof (result as PromiseLike<unknown> | undefined)?.then === 'function') {
            Promise.resolve(result).catch(() => {
                // A failed diagnostic callback has nowhere safer to report to.
            });
        }
    } catch {
        // Same as the rejection handler above.
    }
}

/**
 * A non-recursive, rate-limited diagnostic boundary shared by server and browser adapters.
 */
export function createDiagnosticReporter(
    onError?: (event: Readonly<LoggerDiagnostic>) => void,
    fallback?: (message: string) => unknown,
): (event: LoggerDiagnostic) => void {
    let reporting = false;
    const stateByType = new Map<LoggerDiagnostic['type'], { lastReportedAt: number; suppressedCount: number }>();

    return (event) => {
        if (reporting) return;
        try {
            const now = performance.now();
            const state = stateByType.get(event.type);
            if (state && now - state.lastReportedAt < 1000) {
                state.suppressedCount++;
                return;
            }

            reporting = true;
            const suppressedCount = state?.suppressedCount ?? 0;
            if (suppressedCount) {
                event = {
                    ...event,
                    suppressedCount,
                };
            }

            stateByType.set(
                event.type,
                {
                    lastReportedAt: now,
                    suppressedCount: 0,
                },
            );

            if (onError) {
                // The per-type rate limit already bounds how often onError runs, so async callbacks may overlap.
                callContained(onError, Object.freeze({ ...event }));
            } else {
                const summary = suppressedCount ? ` (${suppressedCount} similar diagnostics suppressed)` : '';
                callContained(fallback, `[logger] ${event.message}${summary}\n`);
            }
        } catch { /* Diagnostics must never escape into the logging pipeline. */ } finally {
            reporting = false;
        }
    };
}

export function createLoggerCore(options: LoggerOptions, hooks: LoggerHooks): Readonly<Logger> {
    validateLevel(options.level);
    validatePresentation(options);
    if (options.onError !== undefined && typeof options.onError !== 'function') {
        throw new TypeError('Logger onError must be a function');
    }

    const presentation = {
        console: options.console ?? true,
        icons: options.icons ?? true,
        prefix: options.prefix ?? '',
        suffix: options.suffix ?? '',
        timestamp: options.timestamp ?? true,
    };

    const { report } = hooks;

    let override = options.level === 'env' ? undefined : options.level;
    let previousEnvironment: string | undefined;
    let currentLevel: LoggerLevel = override ?? 'info';
    let environmentRead = false;

    function refreshLevel() {
        if (override !== undefined) return;
        const input = readEnvironmentLevel();
        if (environmentRead && input === previousEnvironment) return;
        environmentRead = true;
        previousEnvironment = input;
        const normalized = input?.trim().toLowerCase() || undefined;
        currentLevel = isLevel(normalized) ? normalized : 'info';
        if (normalized !== undefined && !isLevel(normalized)) {
            report({
                message: 'Invalid LOG_LEVEL; using info.',
                type: 'invalid-level',
            });
        }
    }

    const logger = {
        configure(configuration) {
            validatePresentation(configuration);
            for (const name of booleanPresentationKeys) {
                const value = configuration[name];
                if (value !== undefined) presentation[name] = value;
            }

            for (const name of stringPresentationKeys) {
                const value = configuration[name];
                if (value !== undefined) presentation[name] = value;
            }
        },
        isLevelEnabled(level) {
            if (level !== 'success' && !isLevel(level)) throw new TypeError('Invalid logger level');
            refreshLevel();
            return level !== 'silent' && getLevelSeverity(level) >= getLevelSeverity(currentLevel);
        },
        setLevel(level) {
            if (level !== 'env' && !isLevel(level)) throw new TypeError('Invalid logger level');
            override = level === 'env' ? undefined : level;
            environmentRead = false;
            if (override !== undefined) {
                currentLevel = override;
            } else {
                refreshLevel();
            }
        },
    } as Logger;

    for (const type of objectKeys(loggerMethods) as LoggerMethod[]) {
        logger[type] = async (...args: unknown[]) => {
            try {
                refreshLevel();
                if (loggerMethods[type].severity < getLevelSeverity(currentLevel)) return;
                await hooks.write({
                    ...presentation,
                    args,
                    date: new Date(),
                    type,
                });
            } catch (error) {
                report({
                    error,
                    message: 'Logger output failed.',
                    type: 'format',
                });
            }
        };
    }

    return Object.freeze(logger);
}

function getLevelSeverity(level: LoggerLevel | LoggerMethod): number {
    return level === 'silent' ? Number.POSITIVE_INFINITY : loggerMethods[level].severity;
}

function isLevel(value: unknown): value is LoggerLevel {
    return typeof value === 'string'
      && (value === 'silent' || (value !== 'success' && objectHasOwn(loggerMethods, value)));
}

function readEnvironmentLevel(): string | undefined {
    return (globalThis as { process?: { env?: { LOG_LEVEL?: string } } }).process?.env?.LOG_LEVEL;
}

function validateLevel(value: unknown): asserts value is 'env' | LoggerLevel | undefined {
    if (value !== undefined && value !== 'env' && !isLevel(value)) throw new TypeError('Invalid logger level');
}

function validatePresentation(options: Pick<LoggerOptions, 'console' | 'icons' | 'prefix' | 'suffix' | 'timestamp'>) {
    for (const name of booleanPresentationKeys) {
        if (options[name] !== undefined && typeof options[name] !== 'boolean') {
            throw new TypeError(`Logger ${name} must be a boolean`);
        }
    }

    for (const name of stringPresentationKeys) {
        if (options[name] !== undefined && typeof options[name] !== 'string') {
            throw new TypeError(`Logger ${name} must be a string`);
        }
    }
}
