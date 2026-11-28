import type { LRUCache } from 'lru-cache';

/**
 * The key resolver is called synchronously once per operation, and its exceptions propagate.
 * Reads return the cached value without copying it.
 * `getItemTtlMilliseconds` returns `Infinity` for no expiry, `0` for a missing key, and a negative value
 * for an expired item the cache has not purged yet.
 * The cache rejects values larger than its `maxEntrySize`, removing any previous value under the key, and writing
 * `undefined` deletes the key. A `ttlMilliseconds` of `0` disables expiry.
 *
 * @throws RangeError from `setItemWithTtl` if `ttlMilliseconds` is negative or `NaN`, which the cache would store as
 * already expired or never expiring.
 */
export function createLruKeyedStore<D = unknown>(lruInstance: LRUCache<any, any, any>) {
    return <P extends any[]>(keyFn: (...args: P) => string) => Object.freeze({
        getItem: (...args: P) => lruInstance.get(keyFn(...args)) as D | undefined ?? null,
        getItemTtlMilliseconds: (...args: P) => lruInstance.getRemainingTTL(keyFn(...args)),
        hasItem: (...args: P) => lruInstance.has(keyFn(...args)),
        removeItem: (...args: P) => lruInstance.delete(keyFn(...args)),
        resolveKey: (...args: P) => keyFn(...args),
        setItem: (value: D, ...args: P) => setLruItem(lruInstance, keyFn(...args), value),
        setItemWithTtl(ttlMilliseconds: number, value: D, ...args: P) {
            // The negated comparison also rejects `NaN`.
            if (!(ttlMilliseconds >= 0)) throw new RangeError(`ttlMilliseconds must be a non-negative number, got ${ttlMilliseconds}.`);
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
