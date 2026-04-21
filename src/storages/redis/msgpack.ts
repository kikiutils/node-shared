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
 * Creates a Redis-like storage using msgpack serialization.
 *
 * @param {RedisLikeAdapter} adapter - The Redis-like adapter to use for raw buffer operations
 *
 * @returns {Readonly<RedisLikeStorage>} A readonly storage instance
 *   with getItem, setItem, hasItem, removeItem, getItemTtl, setItemWithTtl
 *
 * @example
 * ```typescript
 * import { createRedisMsgpackStorage } from '@kikiutils/shared/storages/redis/msgpack';
 * import { createClient } from 'redis';
 *
 * const client = createClient();
 * await client.connect();
 * const storage = createRedisMsgpackStorage(client as unknown as RedisLikeAdapter);
 * await storage.setItem('key', { foo: 'bar' });
 * const value = await storage.getItem('key'); // { foo: 'bar' }
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
