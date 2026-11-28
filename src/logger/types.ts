import type { SafePromise } from '../types';

/** Minimum severity to emit; `success` uses the same threshold as `info`. */
export type LoggerLevel = 'debug' | 'error' | 'fatal' | 'info' | 'silent' | 'trace' | 'warn';

export type LoggerMethod = 'success' | Exclude<LoggerLevel, 'silent'>;

/**
 * Logging methods never throw or reject for recoverable failures, and awaiting one waits for processing, not
 * guaranteed delivery or fsync. Configuration errors can throw from the factory, `configure()`, `setLevel()`, or
 * `isLevelEnabled()`. Factories freeze the API object; settings remain adjustable through its methods.
 */
export interface Logger {
    configure: (options: Pick<LoggerOptions, 'console' | 'icons' | 'prefix' | 'suffix' | 'timestamp'>) => void;
    debug: (...args: unknown[]) => SafePromise<void>;
    error: (...args: unknown[]) => SafePromise<void>;
    fatal: (...args: unknown[]) => SafePromise<void>;
    info: (...args: unknown[]) => SafePromise<void>;
    isLevelEnabled: (level: LoggerLevel | LoggerMethod) => boolean;

    /** `env` restores environment-driven filtering. */
    setLevel: (level: 'env' | LoggerLevel) => void;
    success: (...args: unknown[]) => SafePromise<void>;
    trace: (...args: unknown[]) => SafePromise<void>;
    warn: (...args: unknown[]) => SafePromise<void>;
}

/** A shallow-frozen failure notification; nested error values retain their original ownership. */
export interface LoggerDiagnostic {
    error?: unknown;
    message: string;
    overflowCount?: number;

    /** Same-type notifications suppressed since the previous emitted diagnostic. */
    suppressedCount?: number;
    type: 'closed' | 'console' | 'file' | 'format' | 'invalid-level' | 'overflow' | 'rotation';
}

export interface LoggerOptions {
    /** Controls record output only, not diagnostics. Defaults to `true`. */
    console?: boolean;

    /** Defaults to `true`. */
    icons?: boolean;

    /** Overrides LOG_LEVEL; `env` restores the environment-driven threshold. */
    level?: 'env' | LoggerLevel;

    /**
     * Best-effort, rate-limited notification that replaces the stderr or `console.error` fallback; failures in this
     * callback are contained.
     */
    onError?: (event: Readonly<LoggerDiagnostic>) => void;
    prefix?: string;
    suffix?: string;

    /** Enables the fixed local-time millisecond prefix. Defaults to `true`. */
    timestamp?: boolean;
}
