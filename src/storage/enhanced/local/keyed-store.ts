import { enhancedLocalStorage } from './core';

/**
 * Creates a reusable, type-safe storage interface based on `enhancedLocalStorage`
 * and a dynamic key-generation function.
 *
 * This utility allows you to abstract away key construction logic and work directly
 * with scoped key-value operations like `getItem`, `setItem`, and `removeItem`.
 *
 * @template D - The value type to store
 *
 * @returns A factory that accepts a key generator function and returns a scoped storage interface
 *
 * @example
 * ```typescript
 * import { createKeyedEnhancedLocalStore } from '@kikiutils/shared/storage/enhanced/local';
 *
 * const userStore = createKeyedEnhancedLocalStore<User>()((id: number) => `user:${id}`);
 * userStore.setItem({ id: 123, name: 'user' }, 123);
 * const user = userStore.getItem(123);
 * ```
 */
export function createKeyedEnhancedLocalStore<D = unknown>() {
    return <P extends any[]>(getKeyFunction: (...args: P) => string) => Object.freeze({
        getItem: (...args: P) => enhancedLocalStorage.getItem<D>(getKeyFunction(...args)),
        hasItem: (...args: P) => enhancedLocalStorage.hasItem(getKeyFunction(...args)),
        removeItem: (...args: P) => enhancedLocalStorage.removeItem(getKeyFunction(...args)),
        /**
         * Resolves the storage key from the given arguments.
         *
         * @returns {string} The final string key used internally
         */
        resolveKey: (...args: P) => getKeyFunction(...args),
        setItem: (value: D, ...args: P) => enhancedLocalStorage.setItem(getKeyFunction(...args), value),
    });
}
