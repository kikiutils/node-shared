/**
 * A caller-owned asynchronous adapter for Redis-like binary operations.
 *
 * @remarks
 * Each callback performs one operation and rejects its promise on backend failure.
 * TTL results use Redis conventions: `-1` means no expiry, and `-2` means the key is missing.
 */
export interface RedisLikeAdapter {
    /**
     * Deletes a key and resolves to the number of keys deleted.
     */
    delete: (key: string) => Promise<number>;

    /**
     * Reads a key and resolves to its raw bytes, or `null` when the key is missing.
     */
    getBuffer: (key: string) => Promise<null | Uint8Array>;

    /**
     * Checks a key and resolves to whether it exists.
     */
    has: (key: string) => Promise<boolean>;

    /**
     * Writes raw bytes and resolves to the backend acknowledgment, or no value.
     */
    setBuffer: (key: string, value: Uint8Array) => Promise<'OK' | void>;

    /**
     * Writes raw bytes with an expiry and resolves to the backend acknowledgment, or no value.
     *
     * @param key - The storage key.
     * @param ttlSeconds - The expiry duration in seconds.
     * @param value - The raw bytes to store.
     */
    setBufferEx: (key: string, ttlSeconds: number, value: Uint8Array) => Promise<'OK' | void>;

    /**
     * Reads a key's remaining TTL in seconds, or `-1` for no expiry and `-2` for a missing key.
     */
    ttl: (key: string) => Promise<number>;
}

/**
 * An asynchronous Redis-like storage contract with typed reads and serialized writes.
 *
 * @remarks
 * Operations reject on backend or serialization failure. TTL values are in seconds;
 * `-1` means no expiry, and `-2` means the key is missing. Connection cleanup remains caller-owned.
 */
export interface RedisLikeStorage {
    /**
     * Reads a deserialized value and resolves to `null` when the key is missing.
     *
     * @typeParam T - The expected value type; deserialization does not validate this type.
     */
    getItem: <T = unknown>(key: string) => Promise<null | T>;

    /**
     * Reads a key's remaining TTL in seconds, or `-1` for no expiry and `-2` for a missing key.
     */
    getItemTtl: (key: string) => Promise<number>;

    /**
     * Checks a key and resolves to whether it exists.
     */
    hasItem: (key: string) => Promise<boolean>;

    /**
     * Removes a key and resolves to whether a key was deleted.
     */
    removeItem: (key: string) => Promise<boolean>;

    /**
     * Stores a value and resolves to whether the backend acknowledges the write.
     */
    setItem: (key: string, value: any) => Promise<boolean>;

    /**
     * Stores a value with an expiry and resolves to whether the backend acknowledges the write.
     *
     * @param key - The storage key.
     * @param ttlSeconds - The expiry duration in seconds.
     * @param value - The value to serialize and store.
     */
    setItemWithTtl: (key: string, ttlSeconds: number, value: any) => Promise<boolean>;
}
