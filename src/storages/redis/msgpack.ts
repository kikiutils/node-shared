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

function assertTtlSeconds(ttlSeconds: number) {
    if (!Number.isSafeInteger(ttlSeconds) || ttlSeconds < 1) throw new RangeError(`ttlSeconds must be a positive safe integer, got ${ttlSeconds}.`);
}

/**
 * TTL writes reject with `RangeError` before reaching the adapter unless `ttlSeconds` is a positive safe integer,
 * which is what Redis accepts as an expiry.
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
        getItemTtlSeconds: async (key: string) => await adapter.ttl(key),
        hasItem: async (key: string) => await adapter.has(key),
        removeItem: async (key: string) => await adapter.delete(key) === 1,
        setItem: async (key: string, value: unknown) => await adapter.setBuffer(key, encode(value)) === 'OK',
        async setItemWithTtl(key: string, ttlSeconds: number, value: unknown) {
            assertTtlSeconds(ttlSeconds);
            return await adapter.setBufferWithTtl(key, ttlSeconds, encode(value)) === 'OK';
        },
        async setItemWithTtlIfAbsent(key: string, ttlSeconds: number, value: unknown) {
            assertTtlSeconds(ttlSeconds);
            return await adapter.setBufferWithTtlIfAbsent(key, ttlSeconds, encode(value)) === 'OK';
        },
    });
}
