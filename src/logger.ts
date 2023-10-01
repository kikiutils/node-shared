import dateFormat from 'dateformat';
import colorLogger from 'node-color-log';

colorLogger.setDate(() => dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss'));

export const logger = colorLogger;
export default logger;
