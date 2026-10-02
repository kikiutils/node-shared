import type { LRUCache } from 'lru-cache';

/**
 * Creates a keyed cache factory sharing a caller-owned LRU cache.
 *
 * @remarks
 * The key resolver is called synchronously once per operation, and its exceptions propagate.
 * Reads return the cached value without copying it, or `null` for missing or nullish values.
 * `getItemTtl` exposes the underlying remaining TTL in milliseconds; `setItem` returns the underlying cache.
 * The facade does not dispose the supplied cache, and LRU defaults remain those of the supplied instance.
 *
 * @typeParam D - The stored value type used by reads and writes.
 *
 * @param lruInstance - The shared LRU cache instance.
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
        /**
         * Returns the cached value and applies the underlying cache's read-recency policy.
         *
         * @returns The cached value without copying it, or `null` when absent or nullish.
         */
        getItem(...args: P) {
            const rawValue = lruInstance.get(keyFn(...args));
            return rawValue as D ?? null;
        },
        getItemTtl: (...args: P) => lruInstance.getRemainingTTL(keyFn(...args)),
        hasItem: (...args: P) => lruInstance.has(keyFn(...args)),
        removeItem: (...args: P) => lruInstance.delete(keyFn(...args)),
        /**
         * Resolves the full cache key from the given arguments.
         */
        resolveKey: (...args: P) => keyFn(...args),
        setItem: (value: D, ...args: P) => lruInstance.set(keyFn(...args), value),
    });
}
