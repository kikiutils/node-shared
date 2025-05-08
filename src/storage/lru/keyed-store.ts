import type { LRUCache } from 'lru-cache';

/**
 * Creates a reusable, type-safe keyed store wrapper for an LRUCache instance.
 *
 * This utility allows structured access to cache entries using a dynamic key-generation function.
 *
 * @template D - The specific value type exposed by this store (must extend `V`).
 *
 * @param {LRUCache<any, any, any>} lruInstance - An instance of `lru-cache`.
 *
 * @returns A factory that accepts a key generator and returns a scoped, type-safe LRU-based store.
 *
 * @example
 * ```typescript
 * import { createKeyedLruStore } from '@kikiutils/shared/storage/lru/keyed-store';
 *
 * const lruCache = new LRUCache({ max: 5000 });
 * const userStore = createKeyedLruStore<User>(lruCache)((id: number) => `user:${id}`);
 * userStore.setItem({ id: 1 }, 1);
 * const user = userStore.getItem(1);
 * ```
 */
export function createKeyedLruStore<D = unknown>(lruInstance: LRUCache<any, any, any>) {
    return <P extends any[]>(getKeyFunction: (...args: P) => string) => Object.freeze({
        /**
         * Return a value from the cache. Will update the recency of the cache entry found.
         *
         * If the key is not found, returns `null`.
         */
        getItem(...args: P) {
            const rawValue = lruInstance.get(getKeyFunction(...args));
            return rawValue as D ?? null;
        },
        getItemTtl: (...args: P) => lruInstance.getRemainingTTL(getKeyFunction(...args)),
        hasItem: (...args: P) => lruInstance.has(getKeyFunction(...args)),
        removeItem: (...args: P) => lruInstance.delete(getKeyFunction(...args)),
        /**
         * Resolves the full cache key from the given arguments.
         */
        resolveKey: (...args: P) => getKeyFunction(...args),
        setItem(value: D, ...args: P) {
            lruInstance.set(getKeyFunction(...args), value);
        },
    });
}
