import { Buffer } from 'node:buffer';

import type { RedisLikeScriptClient } from '../../redis/script-runner';
import { createRedisScriptRunner } from '../../redis/script-runner';

import type { RedisLikeAdapter } from './types';

/**
 * The subset of Bun's `RedisClient` used by `createBunRedisAdapter`, typed structurally so this package does not
 * depend on Bun's type declarations.
 */
export interface BunRedisLikeClient extends RedisLikeScriptClient {
    del: (key: string) => Promise<number>;
    exists: (key: string) => Promise<boolean>;
    getBuffer: (key: string) => Promise<null | Uint8Array>;
    set: (key: string, value: Uint8Array, ...options: string[]) => Promise<null | string>;
    setex: (key: string, seconds: number, value: Uint8Array) => Promise<'OK'>;
    ttl: (key: string) => Promise<number>;
}

// Bun decodes `GETDEL` replies as text, which corrupts binary values, so the script returns the value hex-encoded.
// TODO: Once a released Bun includes https://github.com/oven-sh/bun/pull/49499 (Bun 1.4.5 does not), replace this
// script with `client.getdel(key, { buffer: true })`.
// A lookup table instead of a per-byte callback, because the script blocks the server for its whole run.
const getAndDeleteHexScript = `local value = redis.call("GETDEL", KEYS[1])
if not value then
    return false
end

local hex = {}
for byte = 0, 255 do
    hex[string.char(byte)] = string.format("%02x", byte)
end

return (string.gsub(value, ".", hex))`;

/**
 * `getBufferAndDelete` runs an atomic `GETDEL` Lua script through `EVALSHA`, so the client's user needs the
 * `EVALSHA` and `SCRIPT LOAD` permissions. Create one adapter per client and reuse it so script loads are shared.
 *
 * @example
 *
 * ```ts
 * const storage = createRedisMsgpackStorage(createBunRedisAdapter(new RedisClient()));
 * ```
 */
export function createBunRedisAdapter(client: BunRedisLikeClient): Readonly<RedisLikeAdapter> {
    const getAndDeleteHex = createRedisScriptRunner<null | string>(client, getAndDeleteHexScript);
    return Object.freeze({
        delete: async (key: string) => await client.del(key),
        getBuffer: async (key: string) => await client.getBuffer(key),
        async getBufferAndDelete(key: string) {
            const hex = await getAndDeleteHex([key], []);
            return hex === null ? null : Buffer.from(hex, 'hex');
        },
        has: async (key: string) => await client.exists(key),
        setBuffer: async (key: string, value: Uint8Array) => await client.set(key, value) === 'OK' ? 'OK' : undefined,
        async setBufferWithTtl(key: string, ttlSeconds: number, value: Uint8Array) {
            return await client.setex(key, ttlSeconds, value);
        },
        async setBufferWithTtlIfAbsent(key: string, ttlSeconds: number, value: Uint8Array) {
            return await client.set(key, value, 'EX', String(ttlSeconds), 'NX') === 'OK' ? 'OK' : null;
        },
        ttl: async (key: string) => await client.ttl(key),
    });
}
