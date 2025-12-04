import type { LRUCache } from 'lru-cache';

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
