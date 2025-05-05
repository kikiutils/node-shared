import type { LRUCache } from 'lru-cache';

/**
 * Creates a reusable, type-safe keyed store wrapper for an LRUCache instance.
 *
 * This utility allows structured access to cache entries using a dynamic key-generation function.
 *
 * @template D - The specific value type exposed by this store (must extend `V`).
 * @template K - The type of keys used in the LRU cache (default: string).
 * @template V - The type of values stored in the LRU cache.
 * @template FC - The value used by `lru-cache` fetch context (if any).
 *
 * @param {LRUCache<K, V, FC>} lruInstance - An instance of `lru-cache`.
 *
 * @returns A factory that accepts a key generator and returns a scoped, type-safe LRU-based store.
 *
 * @example
 * ```typescript
 * const lruCache = new LRUCache<string, { id: number }>();
 * const userStore = createKeyedLruStore<User>(lruCache)((id: number) => `user:${id}`);
 * userStore.setItem({ id: 1 }, 1);
 * const user = userStore.getItem(1);
 * ```
 */
// eslint-disable-next-line ts/no-empty-object-type
export function createKeyedLruStore<D extends V, K extends {}, V extends {}, FC = unknown>(
    lruInstance: LRUCache<K, V, FC>,
) {
    return <P extends any[]>(getKeyFunction: (...args: P) => K) => Object.freeze({
        /**
         * Return a value from the cache. Will update the recency of the cache entry found.
         *
         * If the key is not found, returns `null`.
         */
        getItem(...args: P) {
            const rawValue = lruInstance.get(getKeyFunction(...args));
            return rawValue ?? null;
        },
        getItemTtl: (...args: P) => lruInstance.getRemainingTTL(getKeyFunction(...args)),
        hasItem: (...args: P) => lruInstance.has(getKeyFunction(...args)),
        removeItem: (...args: P) => lruInstance.delete(getKeyFunction(...args)),
        /**
         * Resolves the full cache key from the given arguments.
         */
        resolveKey: (...args: P) => getKeyFunction(...args),
        setItem: (value: D, ...args: P) => lruInstance.set(getKeyFunction(...args), value),
    });
}
