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
            delete: vi.fn((key: string) => Promise.resolve(buffers.delete(key) ? 1 : 0)),
            getBuffer: vi.fn((key: string) => Promise.resolve(buffers.get(key) ?? null)),
            has: vi.fn((key: string) => Promise.resolve(buffers.has(key))),
            setBuffer: vi.fn((key: string, value: Uint8Array) => {
                buffers.set(key, value);
                return Promise.resolve(ok);
            }),
            setBufferEx: vi.fn((key: string, ttlSeconds: number, value: Uint8Array) => {
                buffers.set(key, value);
                ttls.set(key, ttlSeconds);
                return Promise.resolve(ok);
            }),
            ttl: vi.fn((key: string) => Promise.resolve(ttls.get(key) ?? -1)),
        };
    });

    it('should serialize values to buffers and deserialize them on read', async ({ expect }) => {
        const storage = createRedisMsgpackStorage(adapter);
        const value = {
            id: 1,
            tags: [
                'a',
                'b',
            ],
        };

        await expect(storage.setItem('user:1', value)).resolves.toBe(true);
        expect(adapter.setBuffer).toHaveBeenCalledWith('user:1', expect.any(Uint8Array));
        await expect(storage.getItem('user:1')).resolves.toEqual(value);
        await expect(storage.hasItem('user:1')).resolves.toBe(true);
    });

    it('should return null for missing values and false for unsuccessful writes/removals', async ({ expect }) => {
        const storage = createRedisMsgpackStorage({
            ...adapter,
            delete: vi.fn(() => Promise.resolve(0)),
            setBuffer: vi.fn(() => Promise.resolve(undefined)),
            setBufferEx: vi.fn(() => Promise.resolve(undefined)),
        });

        await expect(storage.getItem('missing')).resolves.toBeNull();
        await expect(storage.setItem('key', 'value')).resolves.toBe(false);
        await expect(storage.setItemWithTtl('key', 60, 'value')).resolves.toBe(false);
        await expect(storage.removeItem('missing')).resolves.toBe(false);
    });

    it('should support ttl-aware writes, ttl reads, and successful removal', async ({ expect }) => {
        const storage = createRedisMsgpackStorage(adapter);

        await expect(storage.setItemWithTtl('session', 60, { ok: true })).resolves.toBe(true);
        expect(adapter.setBufferEx).toHaveBeenCalledWith('session', 60, expect.any(Uint8Array));
        await expect(storage.getItemTtl('session')).resolves.toBe(60);
        await expect(storage.removeItem('session')).resolves.toBe(true);
        await expect(storage.hasItem('session')).resolves.toBe(false);
    });

    it('should freeze the returned storage facade', ({ expect }) => {
        expect(Object.isFrozen(createRedisMsgpackStorage(adapter))).toBe(true);
    });
});
