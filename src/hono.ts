import type { HonoBase } from 'hono/hono-base';
import { logger as honoLogger } from 'hono/logger';
import type { Env, Schema } from 'hono/types';

import logger from './logger';

export const useHonoLogger = <E extends Env = Env, S extends Schema = {}, BasePath extends string = '/'>(honoApp: HonoBase<E, S, BasePath>, logIncoming: boolean = false) => {
	if (process.env.NODE_ENV === 'production') return;
	const logFunction = logIncoming ? (text: string) => logger.info(text.slice(6)) : (text: string) => !text.startsWith('  <--') && logger.info(text.slice(6));
	honoApp.use(honoLogger(logFunction));
};
