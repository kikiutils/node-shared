/**
 * A caller-owned asynchronous adapter for Redis-like binary operations.
 *
 * @remarks
 * Each callback performs one operation and rejects its promise on backend failure.
 */
export interface RedisLikeAdapter {
    /**
     * Deletes a key and resolves to the number of keys deleted.
     */
    delete: (key: string) => Promise<number>;

    /**
     * Resolves to `null` when the key is missing.
     */
    getBuffer: (key: string) => Promise<null | Uint8Array>;

    /**
     * Atomically reads and deletes a key, such as with Redis `GETDEL`,
     * and resolves to its raw bytes, or `null` when the key is missing.
     */
    getBufferAndDelete: (key: string) => Promise<null | Uint8Array>;

    has: (key: string) => Promise<boolean>;

    /**
     * Anything other than `OK` is treated as an unacknowledged write.
     */
    setBuffer: (key: string, value: Uint8Array) => Promise<'OK' | void>;

    setBufferWithTtl: (key: string, ttlSeconds: number, value: Uint8Array) => Promise<'OK' | void>;

    /**
     * Writes only when the key is missing, such as with Redis `SET key value EX ttl NX`, and resolves to `OK`,
     * or `null` or no value when the key already exists.
     */
    setBufferWithTtlIfAbsent: (key: string, ttlSeconds: number, value: Uint8Array) => Promise<'OK' | null | void>;

    /**
     * Resolves to the remaining TTL in seconds, `-1` for no expiry, or `-2` for a missing key.
     */
    ttl: (key: string) => Promise<number>;
}

/**
 * An asynchronous Redis-like storage contract with typed reads and serialized writes.
 *
 * @remarks
 * Operations reject on backend or serialization failure.
 */
export interface RedisLikeStorage {
    /**
     * Atomically reads and removes a deserialized value and resolves to `null` when the key is missing.
     * Concurrent callers on the same key receive the value at most once. The key is removed before deserialization,
     * so a value that fails to deserialize is still lost.
     *
     * @typeParam T - The expected value type; deserialization does not validate this type.
     */
    getAndRemoveItem: <T = unknown>(key: string) => Promise<null | T>;

    /**
     * Resolves to `null` when the key is missing.
     *
     * @typeParam T - The expected value type; deserialization does not validate this type.
     */
    getItem: <T = unknown>(key: string) => Promise<null | T>;

    /**
     * Resolves to `-1` for no expiry or `-2` for a missing key.
     */
    getItemTtlSeconds: (key: string) => Promise<number>;

    hasItem: (key: string) => Promise<boolean>;

    removeItem: (key: string) => Promise<boolean>;

    /**
     * Stores a value and resolves to whether the backend acknowledges the write.
     */
    setItem: (key: string, value: unknown) => Promise<boolean>;

    /**
     * Stores a value with an expiry and resolves to whether the backend acknowledges the write.
     */
    setItemWithTtl: (key: string, ttlSeconds: number, value: unknown) => Promise<boolean>;

    /**
     * Atomically stores a value with an expiry only when the key is missing
     * and resolves to whether the backend acknowledges the write.
     */
    setItemWithTtlIfAbsent: (key: string, ttlSeconds: number, value: unknown) => Promise<boolean>;
}
