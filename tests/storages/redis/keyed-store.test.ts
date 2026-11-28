import {
    describe,
    it,
    vi,
} from 'vitest';

import { createRedisKeyedStore } from '../../../src/storages/redis/keyed-store';
import type { RedisLikeStorage } from '../../../src/storages/redis/types';

describe('createRedisKeyedStore', () => {
    it('should resolve the key from the key arguments and keep the value and TTL arguments in order', async ({ expect }) => {
        const storage = {
            getAndRemoveItem: vi.fn(async () => null),
            getItem: vi.fn(async () => null),
            getItemTtlSeconds: vi.fn(async () => 10),
            hasItem: vi.fn(async () => true),
            removeItem: vi.fn(async () => true),
            setItem: vi.fn(async () => true),
            setItemWithTtl: vi.fn(async () => true),
            setItemWithTtlIfAbsent: vi.fn(async () => false),
        } satisfies RedisLikeStorage;

        const store = createRedisKeyedStore<{ name: string }>(storage)(
            (tenant: string, id: number) => `${tenant}:user:${id}`,
        );

        const value = { name: 'Alice' };
        const key = 'acme:user:1';

        expect(Object.isFrozen(store)).toBe(true);
        expect(store.resolveKey('acme', 1)).toBe(key);
        await expect(store.getItem('acme', 1)).resolves.toBeNull();
        await expect(store.getAndRemoveItem('acme', 1)).resolves.toBeNull();
        await expect(store.getItemTtlSeconds('acme', 1)).resolves.toBe(10);
        await expect(store.hasItem('acme', 1)).resolves.toBe(true);
        await expect(store.removeItem('acme', 1)).resolves.toBe(true);
        await expect(store.setItem(value, 'acme', 1)).resolves.toBe(true);
        await expect(store.setItemWithTtl(30, value, 'acme', 1)).resolves.toBe(true);
        await expect(store.setItemWithTtlIfAbsent(60, value, 'acme', 1)).resolves.toBe(false);

        expect(storage.getItem).toHaveBeenCalledWith(key);
        expect(storage.getAndRemoveItem).toHaveBeenCalledWith(key);
        expect(storage.getItemTtlSeconds).toHaveBeenCalledWith(key);
        expect(storage.hasItem).toHaveBeenCalledWith(key);
        expect(storage.removeItem).toHaveBeenCalledWith(key);
        expect(storage.setItem).toHaveBeenCalledWith(key, value);
        expect(storage.setItemWithTtl).toHaveBeenCalledWith(key, 30, value);
        expect(storage.setItemWithTtlIfAbsent).toHaveBeenCalledWith(key, 60, value);
    });
});
