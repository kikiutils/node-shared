import { createConsola } from 'consola';

/**
 * A consola logger with environment-controlled verbosity.
 *
 * @remarks
 * `CONSOLA_LOGGER_LEVEL` sets the log level when defined at module initialization;
 * otherwise, `NODE_ENV=production` selects `0`, and other environments retain the logger's default level.
 * Assign `logger.level` to change verbosity after initialization.
 *
 * @example
 *
 * ```ts
 * import { logger } from '@kikiutils/shared/consola';
 *
 * logger.level = 3;
 * logger.info('Application started');
 * ```
 *
 * @see {@link https://github.com/unjs/consola#log-level | Consola log levels}
 */
export const consolaLogger = createConsola();
export const logger = consolaLogger;
if (process.env.CONSOLA_LOGGER_LEVEL !== undefined) consolaLogger.level = +process.env.CONSOLA_LOGGER_LEVEL;
else consolaLogger.level = process.env.NODE_ENV === 'production' ? 0 : consolaLogger.level;
