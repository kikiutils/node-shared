import {
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import { createRedisMsgpackStorage } from '../../../src/storages/redis/msgpack';
import type { RedisLikeAdapter } from '../../../src/storages/redis/types';

const ok = 'OK' as const;

describe('createRedisMsgpackStorage', () => {
    const buffers = new Map<string, Uint8Array>();
    const ttls = new Map<string, number>();
    let adapter: RedisLikeAdapter;

    beforeEach(() => {
        buffers.clear();
        ttls.clear();
        adapter = {
            delete: async (key: string) => buffers.delete(key) ? 1 : 0,
            getBuffer: vi.fn(async (key: string) => buffers.get(key) ?? null),
            getBufferAndDelete: vi.fn(async (key: string) => {
                const value = buffers.get(key) ?? null;
                buffers.delete(key);
                return value;
            }),
            has: async (key: string) => buffers.has(key),
            setBuffer: vi.fn(async (key: string, value: Uint8Array) => {
                buffers.set(key, value);
                return ok;
            }),
            setBufferWithTtl: vi.fn(async (key: string, ttlSeconds: number, value: Uint8Array) => {
                buffers.set(key, value);
                ttls.set(key, ttlSeconds);
                return ok;
            }),
            setBufferWithTtlIfAbsent: vi.fn(async (key: string, ttlSeconds: number, value: Uint8Array) => {
                if (buffers.has(key)) return null;
                buffers.set(key, value);
                ttls.set(key, ttlSeconds);
                return ok;
            }),
            ttl: async (key: string) => ttls.get(key) ?? -1,
        };
    });

    it.for([
        {
            id: 1,
            tags: [
                'a',
                'b',
            ],
        },
        0,
        '',
        false,
        null,
    ])(
        'should serialize %j to a buffer and deserialize it on read',
        async (value, { expect }) => {
            const storage = createRedisMsgpackStorage(adapter);

            expect(Object.isFrozen(storage)).toBe(true);
            await expect(storage.setItem('key', value)).resolves.toBe(true);
            expect(adapter.setBuffer).toHaveBeenCalledWith('key', expect.any(Uint8Array));
            await expect(storage.getItem('key')).resolves.toEqual(value);
            await expect(storage.hasItem('key')).resolves.toBe(true);
        },
    );

    it('should return null for missing values and false for unsuccessful writes/removals', async ({ expect }) => {
        const storage = createRedisMsgpackStorage({
            ...adapter,
            delete: async () => 0,
            setBuffer: async () => undefined,
            setBufferWithTtl: async () => undefined,
        });

        await expect(storage.getItem('missing')).resolves.toBeNull();
        await expect(storage.getAndRemoveItem('missing')).resolves.toBeNull();
        await expect(storage.setItem('key', 'value')).resolves.toBe(false);
        await expect(storage.setItemWithTtl('key', 60, 'value')).resolves.toBe(false);
        await expect(storage.removeItem('missing')).resolves.toBe(false);
    });

    it('should support ttl-aware writes, ttl reads, and successful removal', async ({ expect }) => {
        const storage = createRedisMsgpackStorage(adapter);

        await expect(storage.setItemWithTtl('session', 60, { ok: true })).resolves.toBe(true);
        expect(adapter.setBufferWithTtl).toHaveBeenCalledWith('session', 60, expect.any(Uint8Array));
        await expect(storage.getItemTtlSeconds('session')).resolves.toBe(60);
        await expect(storage.removeItem('session')).resolves.toBe(true);
        await expect(storage.hasItem('session')).resolves.toBe(false);
    });

    it('should write ttl-aware values only when the key is missing', async ({ expect }) => {
        const storage = createRedisMsgpackStorage(adapter);

        await expect(storage.setItemWithTtlIfAbsent('cooldown', 60, 1)).resolves.toBe(true);
        expect(adapter.setBufferWithTtlIfAbsent).toHaveBeenCalledWith('cooldown', 60, expect.any(Uint8Array));
        await expect(storage.setItemWithTtlIfAbsent('cooldown', 30, 2)).resolves.toBe(false);
        await expect(storage.getItem('cooldown')).resolves.toBe(1);
        await expect(storage.getItemTtlSeconds('cooldown')).resolves.toBe(60);
    });

    it('should accept one second as the smallest valid TTL', async ({ expect }) => {
        const storage = createRedisMsgpackStorage(adapter);

        await expect(storage.setItemWithTtl('key', 1, 'value')).resolves.toBe(true);
        await expect(storage.setItemWithTtlIfAbsent('other', 1, 'value')).resolves.toBe(true);
    });

    it('should read and remove values through a single adapter call', async ({ expect }) => {
        const storage = createRedisMsgpackStorage(adapter);

        await storage.setItem('token', { id: 1 });
        await expect(storage.getAndRemoveItem('token')).resolves.toEqual({ id: 1 });
        expect(adapter.getBufferAndDelete).toHaveBeenCalledExactlyOnceWith('token');
        await expect(storage.hasItem('token')).resolves.toBe(false);
    });

    it.for([
        -1,
        0,
        1.5,
        Number.NaN,
        Number.POSITIVE_INFINITY,
    ])(
        'should reject TTL %s, which Redis does not accept as an expiry, without calling the adapter',
        async (ttlSeconds, { expect }) => {
            const storage = createRedisMsgpackStorage(adapter);

            await expect(storage.setItemWithTtl('key', ttlSeconds, 'value')).rejects.toThrow(RangeError);
            await expect(storage.setItemWithTtlIfAbsent('key', ttlSeconds, 'value')).rejects.toThrow(RangeError);
            expect(adapter.setBufferWithTtl).not.toHaveBeenCalled();
            expect(adapter.setBufferWithTtlIfAbsent).not.toHaveBeenCalled();
        },
    );
});
