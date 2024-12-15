import type { HonoBase } from 'hono/hono-base';
import { logger as honoLogger } from 'hono/logger';
import type {
    Env,
    Schema,
} from 'hono/types';

import logger from './pino';

/**
 * Sets up logging for a Hono application. Logs incoming requests based on the `logIncoming` parameter.
 *
 * @param {HonoBase<E, S, BasePath>} honoApp - The Hono application instance.
 * @param {boolean} [logIncoming] - Whether to log incoming requests. Defaults to false.
 *
 * @example
 * ```typescript
 * import { useHonoLogger } from '@kikiutils/node/hono';
 * import { Hono } from 'hono';
 *
 * const honoApp = new Hono();
 * useHonoLogger(honoApp, true);
 * ```
 */
export function useHonoLogger<E extends Env = Env, S extends Schema = Schema, BasePath extends string = '/'>(honoApp: HonoBase<E, S, BasePath>, logIncoming: boolean = false) {
    if (process.env.NODE_ENV === 'production') return;
    const logFunction = logIncoming ? (text: string) => logger.info(text) : (text: string) => !text.startsWith('<--') && logger.info(text.slice(4));
    honoApp.use(honoLogger(logFunction));
}
