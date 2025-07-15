import {
    deserialize,
    serialize,
} from 'superjson';

enum StorageValueEncodingType {
    Json = '0',
    String = '1',
}

const customValueHeader = '​⁠';
const customValueHeaderLength = customValueHeader.length + 1;
const toCustomValue = (type: StorageValueEncodingType, payload: string) => `${customValueHeader}${type}${payload}`;

/**
 * An enhanced localStorage wrapper that supports storing
 * complex data types (e.g. Dates, Maps, Sets) using SuperJSON encoding.
 *
 * This utility preserves type structure when saving and retrieving values.
 *
 * @example
 * ```typescript
 * import { enhancedLocalStorage } from '@kikiutils/shared/storage/enhanced/local';
 *
 * enhancedLocalStorage.setItem('user', { name: 'user', createdAt: new Date() });
 * const user = enhancedLocalStorage.getItem<{ name: string, createdAt: Date }>('user');
 * ```
 */
export const enhancedLocalStorage = Object.freeze({
    /**
     * Removes all items from localStorage.
     */
    clear: () => window.localStorage.clear(),
    /**
     * Retrieves a value by key and decodes it using SuperJSON or raw string.
     *
     * @template T - The expected type of the value.
     *
     * @param {string} key - The key of the value to retrieve.
     *
     * @returns {null | T} The decoded value or null if not found.
     */
    getItem<T = unknown>(key: string) {
        const rawValue = window.localStorage.getItem(key);
        return rawValue ? decodeStorageValue(rawValue) as T : null;
    },
    /**
     * Checks whether a key exists in localStorage.
     *
     * @param {string} key - The key to check.
     *
     * @returns {boolean} True if the key exists, false otherwise.
     */
    hasItem: (key: string) => window.localStorage.getItem(key) !== null,
    /**
     * Returns the number of items stored in localStorage.
     *
     * @returns {number} The number of items stored in localStorage.
     */
    get length() {
        return window.localStorage.length;
    },
    /**
     * Removes a specific key from localStorage.
     *
     * @param {string} key - The key to remove.
     */
    removeItem: (key: string) => window.localStorage.removeItem(key),
    /**
     * Stores a value in localStorage with automatic serialization.
     *
     * @param {string} key - The key to store the value under.
     * @param {any} value - The value to store.
     */
    setItem: (key: string, value: any) => window.localStorage.setItem(key, encodeToStorageValue(value)),
});

function decodeStorageValue(data: string) {
    if (!isCustomFormat(data)) return data;
    const payload = data.substring(customValueHeaderLength);
    const type = data.charAt(customValueHeader.length);
    switch (type) {
        case StorageValueEncodingType.Json:
            try {
                return deserialize(JSON.parse(payload));
            } catch {
                throw new Error('[EnhancedLocalStorage] Failed to parse JSON payload');
            }
        case StorageValueEncodingType.String: return payload;
        default:
            throw new Error(`[EnhancedLocalStorage] Unknown encoding type: ${type}`);
    }
}

function encodeToStorageValue(value: any) {
    if (typeof value === 'string') return toCustomValue(StorageValueEncodingType.String, value);
    return toCustomValue(StorageValueEncodingType.Json, JSON.stringify(serialize(value)));
}

function isCustomFormat(data: string) {
    return (
        data.length >= customValueHeaderLength
        && data[0] === customValueHeader[0]
        && data[1] === customValueHeader[1]
    );
}
