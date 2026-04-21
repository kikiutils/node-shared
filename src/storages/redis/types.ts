import type { Nullable } from '../../types';

/**
 * Low-level Redis-like adapter interface for raw buffer operations.
 */
export interface RedisLikeAdapter {
    /**
     * Deletes a key and returns the number of keys deleted.
     */
    delete: (key: string) => Promise<number>;

    /**
     * Gets the raw buffer value for a key.
     */
    getBuffer: (key: string) => Promise<Nullable<Uint8Array>>;

    /**
     * Checks if a key exists.
     */
    has: (key: string) => Promise<boolean>;

    /**
     * Sets a raw buffer value for a key.
     */
    setBuffer: (key: string, value: Uint8Array) => Promise<'OK' | void>;

    /**
     * Sets a raw buffer value for a key with a TTL.
     */
    setBufferEx: (key: string, ttlSeconds: number, value: Uint8Array) => Promise<'OK' | void>;

    /**
     * Gets the TTL of a key in seconds.
     */
    ttl: (key: string) => Promise<number>;
}

/**
 * High-level Redis-like storage interface with typed get/set operations.
 */
export interface RedisLikeStorage {
    /**
     * Gets a deserialized value by key.
     */
    getItem: <T = unknown>(key: string) => Promise<Nullable<T>>;

    /**
     * Gets the TTL of a key in seconds.
     */
    getItemTtl: (key: string) => Promise<number>;

    /**
     * Checks if a key exists.
     */
    hasItem: (key: string) => Promise<boolean>;

    /**
     * Removes a key.
     */
    removeItem: (key: string) => Promise<boolean>;

    /**
     * Sets a value for a key.
     */
    setItem: (key: string, value: any) => Promise<boolean>;

    /**
     * Sets a value for a key with a TTL.
     */
    setItemWithTtl: (key: string, ttlSeconds: number, value: any) => Promise<boolean>;
}
