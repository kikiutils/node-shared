/** Each callback performs one operation and rejects its promise on backend failure. */
export interface RedisLikeAdapter {
    delete: (key: string) => Promise<number>;

    getBuffer: (key: string) => Promise<null | Uint8Array>;

    /** Atomically reads and deletes a key, such as with Redis `GETDEL`. */
    getBufferAndDelete: (key: string) => Promise<null | Uint8Array>;

    has: (key: string) => Promise<boolean>;

    /** Anything other than `OK` is treated as an unacknowledged write. */
    setBuffer: (key: string, value: Uint8Array) => Promise<'OK' | void>;

    setBufferWithTtl: (key: string, ttlSeconds: number, value: Uint8Array) => Promise<'OK' | void>;

    /** Writes only when the key is missing, such as with Redis `SET key value EX ttl NX`. */
    setBufferWithTtlIfAbsent: (key: string, ttlSeconds: number, value: Uint8Array) => Promise<'OK' | null | void>;

    /** Resolves to the remaining TTL in seconds, `-1` for no expiry, or `-2` for a missing key. */
    ttl: (key: string) => Promise<number>;
}

/** Operations reject on backend or serialization failure. */
export interface RedisLikeStorage {
    /**
     * Atomically reads and removes a value. Concurrent callers on the same key receive the value at most once. The key
     * is removed before deserialization, so a value that fails to deserialize is still lost.
     *
     * @typeParam T - The expected value type; deserialization does not validate this type.
     */
    getAndRemoveItem: <T = unknown>(key: string) => Promise<null | T>;

    /** @typeParam T - The expected value type; deserialization does not validate this type. */
    getItem: <T = unknown>(key: string) => Promise<null | T>;

    getItemTtlSeconds: (key: string) => Promise<number>;

    hasItem: (key: string) => Promise<boolean>;

    removeItem: (key: string) => Promise<boolean>;

    /** Resolves to whether the backend acknowledges the write. */
    setItem: (key: string, value: unknown) => Promise<boolean>;

    /** Resolves to whether the backend acknowledges the write. */
    setItemWithTtl: (key: string, ttlSeconds: number, value: unknown) => Promise<boolean>;

    /** Atomically stores only when the key is missing; resolves to whether the backend acknowledges the write. */
    setItemWithTtlIfAbsent: (key: string, ttlSeconds: number, value: unknown) => Promise<boolean>;
}
