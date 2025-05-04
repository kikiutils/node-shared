import { enhancedLocalStorage } from './core';

/**
 * Creates a keyed storage interface that wraps `enhancedLocalStorage` operations
 * using a dynamic key-generation function.
 *
 * This allows you to define reusable, type-safe storage handlers
 * without repeating key construction logic.
 *
 * @template D - The value type stored for each key.
 *
 * @returns A factory that accepts a key generator function and returns
 * a scoped storage API with `getItem`, `setItem`, `hasItem`, and `removeItem`.
 *
 * @example
 * ```typescript
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
         * @returns {string} The final string key used internally.
         */
        resolveKey: (...args: P) => getKeyFunction(...args),
        setItem: (value: D, ...args: P) => enhancedLocalStorage.setItem(getKeyFunction(...args), value),
    });
}
