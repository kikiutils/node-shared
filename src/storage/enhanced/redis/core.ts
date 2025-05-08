import { Buffer } from 'node:buffer';

import { Redis } from 'ioredis';
import {
    deserialize,
    serialize,
} from 'superjson';

enum StorageValueEncodingType {
    Buffer = 0,
    Json = 1,
    String = 2,
}

const customValueHeader = Buffer.of(
    0xE2,
    0x81,
    0xA0,
);

const customValueHeaderLength = customValueHeader.byteLength + 1;

/**
 * Creates an enhanced Redis-based storage interface using SuperJSON encoding.
 *
 * This utility provides a typed, serializable key-value store backed by Redis,
 * supporting TTL operations and safe deserialization of complex types (e.g. Date, Map).
 *
 * @param {Redis | string} ioRedisInstanceOrUrl - Either an existing `ioredis` instance or a Redis connection string.
 *
 * @returns A frozen object that wraps Redis commands with typed get/set logic and encoding.
 *
 * @example
 * ```typescript
 * import { createEnhancedRedisStorage } from '@kikiutils/shared/storage/enhanced/redis';
 *
 * const redisStorage = createEnhancedRedisStorage('redis://localhost');
 * await redisStorage.setItem('user:1', { name: 'user' });
 * const user = await redisStorage.getItem<{ name: string }>('user:1');
 * ```
 */
export function createEnhancedRedisStorage(ioRedisInstanceOrUrl: Redis | string) {
    const instance = ioRedisInstanceOrUrl instanceof Redis ? ioRedisInstanceOrUrl : new Redis(ioRedisInstanceOrUrl);
    return Object.freeze({
        /**
         * Retrieves a value from Redis and decodes it.
         *
         * @template T - The expected return type.
         *
         * @param {string} key - The Redis key.
         *
         * @returns {Promise<null | T>} The decoded value or null if not found.
         */
        async getItem<T = unknown>(key: string) {
            const rawValue = await instance.getBuffer(key);
            return rawValue ? decodeStorageValue(rawValue) as T : null;
        },
        /**
         * Gets the remaining TTL (in seconds) for a given key.
         *
         * @param {string} key - The Redis key.
         *
         * @returns {Promise<number>} The number of seconds until the key expires, or -1 if no expiration is set.
         */
        getItemTtl: (key: string) => instance.ttl(key),
        /**
         * Checks whether a key exists in Redis.
         *
         * @param {string} key - The Redis key.
         *
         * @returns {Promise<boolean>} True if the key exists, false otherwise.
         */
        hasItem: async (key: string) => await instance.exists(key) === 1,
        /**
         * The underlying Redis instance, exposed for advanced operations.
         * Use with caution; most use cases should rely on the wrapper methods.
         *
         * @returns {Redis} The underlying Redis instance.
         */
        get instance() {
            return instance;
        },
        /**
         * Removes a key from Redis.
         *
         * @param {string} key - The Redis key to delete.
         *
         * @returns {Promise<boolean>} A Promise that resolves to `true` if the key was removed,
         * or `false` if it did not exist.
         */
        removeItem: async (key: string) => await instance.del(key) === 1,
        /**
         * Stores a value in Redis without expiration.
         *
         * @param {string} key - The Redis key.
         * @param {any} value - The value to store. Will be serialized.
         */
        setItem: (key: string, value: any) => instance.set(key, encodeToStorageValue(value)),
        /**
         * Stores a value in Redis with a time-to-live (TTL).
         *
         * @param {string} key - The Redis key.
         * @param {number} seconds - Expiration time in seconds.
         * @param {any} value - The value to store. Will be serialized.
         */
        setItemWithTtl(key: string, seconds: number, value: any) {
            return instance.setex(key, seconds, encodeToStorageValue(value));
        },
    });
}

function decodeStorageValue(data: Buffer) {
    if (!isCustomFormat(data)) return data;
    const payload = data.subarray(customValueHeaderLength);
    const type = data[customValueHeader.byteLength];
    switch (type) {
        case StorageValueEncodingType.Buffer: return payload;
        case StorageValueEncodingType.Json:
            try {
                return deserialize(JSON.parse(payload.toString()));
            } catch {
                throw new Error('[RedisStorage] Failed to parse JSON payload.');
            }
        case StorageValueEncodingType.String: return payload.toString();
        default:
            throw new Error(`[RedisStorage] Unknown encoding type: ${type}.`);
    }
}

function encodeToStorageValue(value: any) {
    if (Buffer.isBuffer(value)) return toCustomValue(StorageValueEncodingType.Buffer, value);
    if (typeof value === 'string') return toCustomValue(StorageValueEncodingType.String, Buffer.from(value));
    return toCustomValue(StorageValueEncodingType.Json, Buffer.from(JSON.stringify(serialize(value))));
}

function isCustomFormat(buffer: Buffer) {
    return (
        buffer.length >= customValueHeaderLength
        && buffer[0] === customValueHeader[0]
        && buffer[1] === customValueHeader[1]
        && buffer[2] === customValueHeader[2]
    );
}

function toCustomValue(type: StorageValueEncodingType, payload: Buffer) {
    return Buffer.concat([
        customValueHeader,
        Buffer.of(type),
        payload,
    ]);
}
