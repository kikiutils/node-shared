import type { LRUCache } from 'lru-cache';

/**
 * Creates a keyed cache factory sharing a caller-owned LRU cache.
 *
 * @remarks
 * The key resolver is called synchronously once per operation, and its exceptions propagate.
 * Reads return the cached value without copying it, or `null` when missing.
 * `getItemTtl` returns the remaining TTL in milliseconds, `Infinity` for no expiry, `0` for a missing key, and a
 * negative value for an expired item the cache has not purged yet.
 * Writes return whether the value was stored. The cache rejects values larger than its `maxEntrySize`, removing any
 * previous value under the key, and writing `undefined` deletes the key.
 * LRU defaults remain those of the supplied instance.
 *
 * @returns A factory accepting a key resolver and returning a new frozen keyed facade sharing the cache.
 *
 * @example
 *
 * ```ts
 * import { createLruKeyedStore } from '@kikiutils/shared/storages/lru/keyed-store';
 * import { LRUCache } from 'lru-cache';
 *
 * const cache = new LRUCache<string, { name: string }>({ max: 100 });
 * const keyedStore = createLruKeyedStore<{ name: string }>(cache)((userId: string) => `user:${userId}`);
 * keyedStore.setItem({ name: 'Alice' }, 'user-123');
 * console.log(keyedStore.getItem('user-123')); // => { name: 'Alice' }
 * ```
 */
export function createLruKeyedStore<D = unknown>(lruInstance: LRUCache<any, any, any>) {
    return <P extends any[]>(keyFn: (...args: P) => string) => Object.freeze({
        getItem: (...args: P) => lruInstance.get(keyFn(...args)) as D | undefined ?? null,
        getItemTtl: (...args: P) => lruInstance.getRemainingTTL(keyFn(...args)),
        hasItem: (...args: P) => lruInstance.has(keyFn(...args)),
        removeItem: (...args: P) => lruInstance.delete(keyFn(...args)),
        resolveKey: (...args: P) => keyFn(...args),
        setItem: (value: D, ...args: P) => setLruItem(lruInstance, keyFn(...args), value),
        setItemWithTtl(ttlMilliseconds: number, value: D, ...args: P) {
            return setLruItem(lruInstance, keyFn(...args), value, ttlMilliseconds);
        },
    });
}

function setLruItem(cache: LRUCache<any, any, any>, key: string, value: unknown, ttl?: number) {
    const status: LRUCache.Status<any, any> = {};
    cache.set(
        key,
        value,
        {
            status,
            ttl,
        },
    );

    return status.set === 'add' || status.set === 'replace' || status.set === 'update';
}
