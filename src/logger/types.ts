/** Minimum severity to emit; `success` uses the same threshold as `info`. */
export type LoggerLevel = 'debug' | 'error' | 'fatal' | 'info' | 'silent' | 'trace' | 'warn';

/** A logging method, including the informational success presentation. */
export type LoggerMethod = 'success' | Exclude<LoggerLevel, 'silent'>;

/**
 * A logger whose logging methods never throw or reject for recoverable failures.
 *
 * Awaiting a method waits for processing, not guaranteed successful delivery or fsync.
 * Configuration errors may throw from the factory, configure(), or setLevel().
 * Factories freeze the API object; settings remain adjustable through its methods.
 */
export interface Logger {
    configure: (options: Pick<LoggerOptions, 'console' | 'icons' | 'prefix' | 'suffix' | 'timestamp'>) => void;
    debug: (...args: unknown[]) => Promise<void>;
    error: (...args: unknown[]) => Promise<void>;
    fatal: (...args: unknown[]) => Promise<void>;
    info: (...args: unknown[]) => Promise<void>;

    /** Accepts success as an informational method; it is not a configurable threshold. */
    isLevelEnabled: (level: LoggerLevel | LoggerMethod) => boolean;

    /** Sets a severity threshold (not success); env restores environment-driven filtering. */
    setLevel: (level: 'env' | LoggerLevel) => void;
    success: (...args: unknown[]) => Promise<void>;
    trace: (...args: unknown[]) => Promise<void>;
    warn: (...args: unknown[]) => Promise<void>;
}

/** A shallow-frozen failure notification; nested error values retain their original ownership. */
export interface LoggerDiagnostic {
    droppedCount?: number;
    error?: unknown;
    message: string;

    /** Same-type notifications suppressed since the previous emitted diagnostic. */
    suppressedCount?: number;
    type: 'closed' | 'console' | 'file' | 'format' | 'invalid-level' | 'overflow';
}

/** Configuration shared by browser and server loggers. */
export interface LoggerOptions {
    /** Enables console output. Defaults to `true`. */
    console?: boolean;

    /** Enables Unicode level icons. Defaults to `true`. */
    icons?: boolean;

    /** Overrides LOG_LEVEL; `env` restores the environment-driven threshold. */
    level?: 'env' | LoggerLevel;

    /** Best-effort, rate-limited notification; failures in this callback are contained. */
    onError?: (event: Readonly<LoggerDiagnostic>) => void;
    prefix?: string;
    suffix?: string;

    /** Enables the fixed local-time millisecond prefix. Defaults to `true`. */
    timestamp?: boolean;
}
