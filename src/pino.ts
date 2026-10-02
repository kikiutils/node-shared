import { pino } from 'pino';
import { PinoPretty } from 'pino-pretty';

// Configure pretty-printed log output.
const stream = PinoPretty({
    colorize: true, // Enable colored output for better readability
    ignore: 'hostname,pid', // Exclude 'hostname' and 'pid' fields from the logs
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l', // Format the timestamp in 'yyyy-mm-dd HH:MM:ss.l' format
});

/**
 * A pino logger with environment-controlled verbosity.
 *
 * @remarks
 * `PINO_LOGGER_LEVEL` sets the log level when nonempty at module initialization;
 * otherwise, `NODE_ENV=production` selects `error`, and other environments retain the logger's default level.
 * Assign `logger.level` to change verbosity after initialization.
 *
 * @example
 *
 * ```ts
 * import { logger } from '@kikiutils/shared/pino';
 *
 * logger.level = 'info';
 * logger.info('Application started');
 * ```
 *
 * @see {@link https://getpino.io/#/docs/api?id=level-string | Pino log levels}
 */
export const pinoLogger = pino({}, stream);
export const logger = pinoLogger;
// eslint-disable-next-line style/max-len
pinoLogger.level = process.env.PINO_LOGGER_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : pinoLogger.level);
