import pino from 'pino';
import pinoPretty from 'pino-pretty';

/**
 * Configure pinoPretty to enhance the log output.
 */
const stream = pinoPretty({
	colorize: true, // Enable colored output for better readability
	ignore: 'hostname,pid', // Exclude 'hostname' and 'pid' fields from the logs
	translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l' // Format the timestamp in 'yyyy-mm-dd HH:MM:ss.l' format
});

/**
 * A pino logger instance with the configured stream.
 *
 * @example
 * ```typescript
 * import logger from '@kikiutils/node/logger';
 *
 * logger.info('test'); // Output: '[2024-07-11 12:12:30.085] INFO: test'
 * ```
 */
const logger = pino({}, stream);

/**
 * Set the logger level based on environment variables.
 * If PINO_LOGGER_LEVEL is set, use that level.
 * If NODE_ENV is 'production', default to 'error' level.
 * Otherwise, use the current logger level.
 */
logger.level = process.env.PINO_LOGGER_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : logger.level);
export { logger };
export default logger;
