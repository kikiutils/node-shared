import type { HonoBase } from 'hono/hono-base';
import { logger as honoLogger } from 'hono/logger';

import logger from './logger';

export const useHonoLogger = (honoApp: HonoBase, logIncoming: boolean = false) => {
	if (process.env.NODE_ENV === 'production') return;
	const logFunction = logIncoming ? (text: string) => logger.info(text.slice(6)) : (text: string) => !text.startsWith('  <--') && logger.info(text.slice(6));
	honoApp.use(honoLogger(logFunction));
};
