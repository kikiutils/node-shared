import type { RedisLikeStorage } from './types';

export function createRedisKeyedStore<D = unknown>(storage: RedisLikeStorage) {
    return <P extends any[]>(keyFn: (...args: P) => string) => Object.freeze({
        getAndRemoveItem: async (...args: P) => await storage.getAndRemoveItem<D>(keyFn(...args)),
        getItem: async (...args: P) => await storage.getItem<D>(keyFn(...args)),
        getItemTtlSeconds: async (...args: P) => await storage.getItemTtlSeconds(keyFn(...args)),
        hasItem: async (...args: P) => await storage.hasItem(keyFn(...args)),
        removeItem: async (...args: P) => await storage.removeItem(keyFn(...args)),
        resolveKey: (...args: P) => keyFn(...args),
        setItem: async (value: D, ...args: P) => await storage.setItem(keyFn(...args), value),
        async setItemWithTtl(ttlSeconds: number, value: D, ...args: P) {
            return await storage.setItemWithTtl(keyFn(...args), ttlSeconds, value);
        },
        async setItemWithTtlIfAbsent(ttlSeconds: number, value: D, ...args: P) {
            return await storage.setItemWithTtlIfAbsent(keyFn(...args), ttlSeconds, value);
        },
    });
}
