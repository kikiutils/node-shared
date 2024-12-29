import { format } from 'date-fns';
import colorLogger from 'node-color-log';

colorLogger.setDate(() => format(new Date(), 'yyyy-MM-dd HH:mm:ss'));

export const logger = colorLogger;
export default logger;
