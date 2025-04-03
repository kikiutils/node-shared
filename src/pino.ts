import pino from 'pino';
import pinoPretty from 'pino-pretty';

/**
 * Configure pinoPretty to enhance the log output.
 */
const stream = pinoPretty({
    colorize: true, // Enable colored output for better readability
    ignore: 'hostname,pid', // Exclude 'hostname' and 'pid' fields from the logs
    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l', // Format the timestamp in 'yyyy-mm-dd HH:MM:ss.l' format
});

/**
 * A pino logger instance with the configured stream.
 *
 * The logger's level is determined based on the `PINO_LOGGER_LEVEL` and `NODE_ENV` environment variables.
 * If `PINO_LOGGER_LEVEL` is set, it will be used; otherwise, if `NODE_ENV` is `production`,
 * the level will be set to `error`.
 *
 * To manually change the level, assign the desired level to `logger.level`.
 *
 * See available levels [here](https://getpino.io/#/docs/api?id=level-string).
 *
 * @example
 * ```typescript
 * import logger from '@kikiutils/node/pino';
 *
 * logger.info('test'); // [2024-07-11 12:12:30.085] INFO: test
 *
 * // Manually change the level
 * logger.level = 'info';
 * ```
 */
export const pinoLogger = pino({}, stream);
export const logger = pinoLogger;
// eslint-disable-next-line style/max-len
pinoLogger.level = process.env.PINO_LOGGER_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : pinoLogger.level);

export default pinoLogger;
