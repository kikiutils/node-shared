import type { LRUCache } from 'lru-cache';

/**
 * Creates a keyed store wrapper around an LRU cache instance.
 *
 * @template D - The data type stored in the keyed store
 *
 * @param {LRUCache<any, any, any>} lruInstance - The underlying lru-cache instance
 *
 * @returns {(keyFn: (...args: P) => string) => Readonly<{
 *   getItem, getItemTtl, hasItem, removeItem, resolveKey, setItem
 * }>} A keyed store factory that takes a key resolution function
 *
 * @example
 * ```typescript
 * import { createLruKeyedStore } from '@kikiutils/shared/storages/lru/keyed-store';
 * import { LRUCache } from 'lru-cache';
 *
 * const lru = new LRUCache({ max: 100 });
 * const keyedStore = createLruKeyedStore(lru)((userId: string) => `user:${userId}`);
 * await keyedStore.setItem({ name: 'Alice' }, 'user-123');
 * const user = await keyedStore.getItem('user-123'); // { name: 'Alice' }
 * ```
 */
export function createLruKeyedStore<D = unknown>(lruInstance: LRUCache<any, any, any>) {
    return <P extends any[]>(keyFn: (...args: P) => string) => Object.freeze({
        /**
         * Return a value from the cache. Will update the recency of the cache entry found.
         *
         * If the key is not found, returns `null`.
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
