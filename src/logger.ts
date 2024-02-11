import pino from 'pino';
import pinoPretty from 'pino-pretty';

const stream = pinoPretty({
	colorize: true,
	ignore: 'hostname,pid',
	translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l'
});

const logger = pino({}, stream);
export { logger };
export default logger;
