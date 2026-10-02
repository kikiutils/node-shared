import {
    decode,
    encode,
    isNativeAccelerationEnabled,
} from 'msgpackr';

import type {
    RedisLikeAdapter,
    RedisLikeStorage,
} from './types';

if (!isNativeAccelerationEnabled) {
    console.warn('Native acceleration not enabled for msgpackr, verify that install finished properly');
}

/**
 * Creates a frozen Redis-like storage facade using MessagePack serialization.
 *
 * @remarks
 * Adapter rejections and MessagePack serialization errors propagate to the caller.
 * Reads resolve to `null` when no raw value exists. Writes resolve to `true` only when the adapter returns `OK`;
 * removal resolves to `true` only when exactly one key is deleted.
 * The adapter remains caller-owned; creating the facade does not open or close a connection.
 *
 * @param adapter - The caller-owned adapter for raw binary operations.
 *
 * @returns A new frozen facade sharing the supplied adapter.
 *
 * @example
 *
 * ```ts
 * import { createRedisMsgpackStorage } from '@kikiutils/shared/storages/redis/msgpack';
 * import type { RedisLikeAdapter } from '@kikiutils/shared/storages/redis/types';
 *
 * // This in-memory adapter demonstrates non-expiring operations without an external service.
 * const values = new Map<string, Uint8Array>();
 * const adapter: RedisLikeAdapter = {
 *     delete: async (key) => values.delete(key) ? 1 : 0,
 *     getBuffer: async (key) => values.get(key) ?? null,
 *     has: async (key) => values.has(key),
 *     setBuffer: async (key, value) => {
 *         values.set(key, value);
 *         return 'OK';
 *     },
 *     setBufferEx: async () => {
 *         throw new Error('TTL writes are not supported by this example adapter');
 *     },
 *     ttl: async (key) => values.has(key) ? -1 : -2,
 * };
 *
 * const storage = createRedisMsgpackStorage(adapter);
 * await storage.setItem('profile', { name: 'Alice' });
 * const profile = await storage.getItem<{ name: string }>('profile');
 * console.log(profile); // => { name: 'Alice' }
 * ```
 */
export function createRedisMsgpackStorage(adapter: RedisLikeAdapter): Readonly<RedisLikeStorage> {
    return Object.freeze({
        async getItem<T = unknown>(key: string) {
            const rawValue = await adapter.getBuffer(key);
            return rawValue ? decode(rawValue) as T : null;
        },
        getItemTtl: (key: string) => adapter.ttl(key),
        hasItem: (key: string) => adapter.has(key),
        removeItem: async (key: string) => await adapter.delete(key) === 1,
        setItem: async (key: string, value: any) => await adapter.setBuffer(key, encode(value)) === 'OK',
        async setItemWithTtl(key: string, ttlSeconds: number, value: any) {
            return await adapter.setBufferEx(key, ttlSeconds, encode(value)) === 'OK';
        },
    });
}
