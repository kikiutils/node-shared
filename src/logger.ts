import pino from 'pino';
import pinoPretty from 'pino-pretty';

const stream = pinoPretty({
	colorize: true,
	ignore: 'hostname,pid',
	translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l'
});

const logger = pino({}, stream);
logger.level = process.env.PINO_LOGGER_LEVEL || (process.env.NODE_ENV === 'production' ? 'error' : logger.level);
export { logger };
export default logger;
