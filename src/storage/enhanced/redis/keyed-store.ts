import type { createEnhancedRedisStorage } from './core';

/**
 * Creates a reusable, type-safe Redis-backed storage interface based on `createEnhancedRedisStorage`
 * and a dynamic key-generation function.
 *
 * This utility abstracts away key construction and provides high-level access
 * to Redis operations such as `getItem`, `setItem`, `setItemWithTtl`, and `getItemTtl`.
 * It is ideal for namespaced data, caching, and session handling.
 *
 * @template D - The value type to store
 *
 * @param {ReturnType<typeof createEnhancedRedisStorage>} storage - The enhanced Redis storage instance
 *
 * @returns A factory that accepts a key generator function and returns a scoped Redis storage interface
 *
 * @example
 * ```typescript
 * import { createKeyedEnhancedRedisStore } from '@kikiutils/shared/storage/enhanced/redis';
 *
 * const userStore = createKeyedEnhancedRedisStore<User>(redisStorage)((id: number) => `user:${id}`);
 * await userStore.setItem({ id: 123, name: 'user' }, 123);
 * const user = await userStore.getItem(123);
 * ```
 */
export function createKeyedEnhancedRedisStore<D = unknown>(storage: ReturnType<typeof createEnhancedRedisStorage>) {
    return <P extends any[]>(getKeyFunction: (...args: P) => string) => Object.freeze({
        getItem: (...args: P) => storage.getItem<D>(getKeyFunction(...args)),
        getItemTtl: (...args: P) => storage.getItemTtl(getKeyFunction(...args)),
        hasItem: (...args: P) => storage.hasItem(getKeyFunction(...args)),
        removeItem: (...args: P) => storage.removeItem(getKeyFunction(...args)),
        /**
         * Resolves the storage key from the given arguments.
         *
         * @returns {string} The final string key used internally
         */
        resolveKey: (...args: P) => getKeyFunction(...args),
        setItem: (value: D, ...args: P) => storage.setItem(getKeyFunction(...args), value),
        setItemWithTtl(seconds: number, value: D, ...args: P) {
            return storage.setItemWithTtl(getKeyFunction(...args), seconds, value);
        },
    });
}
