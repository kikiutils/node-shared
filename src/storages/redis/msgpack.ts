import {
    decode,
    encode,
    isNativeAccelerationEnabled,
} from 'msgpackr';

import type {
    RedisLikeAdapter,
    RedisLikeStorage,
} from './types';

// A deliberate import-time side effect, declared in package.json `sideEffects`: it flags installs missing the
// native msgpackr addon.
if (!isNativeAccelerationEnabled) {
    console.warn('Native acceleration not enabled for msgpackr, verify that install finished properly');
}

/**
 * Creates a frozen Redis-like storage facade using MessagePack serialization.
 *
 * @remarks
 * Writes resolve to `true` only when the adapter returns `OK`; removal resolves to `true` only when exactly one key
 * is deleted.
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
 *     getBufferAndDelete: async (key) => {
 *         const value = values.get(key) ?? null;
 *         values.delete(key);
 *         return value;
 *     },
 *     has: async (key) => values.has(key),
 *     setBuffer: async (key, value) => {
 *         values.set(key, value);
 *         return 'OK';
 *     },
 *     setBufferEx: async () => {
 *         throw new Error('TTL writes are not supported by this example adapter');
 *     },
 *     setBufferExNx: async () => {
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
        async getAndRemoveItem<T = unknown>(key: string) {
            const rawValue = await adapter.getBufferAndDelete(key);
            return rawValue ? decode(rawValue) as T : null;
        },
        async getItem<T = unknown>(key: string) {
            const rawValue = await adapter.getBuffer(key);
            return rawValue ? decode(rawValue) as T : null;
        },
        getItemTtl: async (key: string) => await adapter.ttl(key),
        hasItem: async (key: string) => await adapter.has(key),
        removeItem: async (key: string) => await adapter.delete(key) === 1,
        setItem: async (key: string, value: unknown) => await adapter.setBuffer(key, encode(value)) === 'OK',
        async setItemWithTtl(key: string, ttlSeconds: number, value: unknown) {
            return await adapter.setBufferEx(key, ttlSeconds, encode(value)) === 'OK';
        },
        async setItemWithTtlIfAbsent(key: string, ttlSeconds: number, value: unknown) {
            return await adapter.setBufferExNx(key, ttlSeconds, encode(value)) === 'OK';
        },
    });
}
