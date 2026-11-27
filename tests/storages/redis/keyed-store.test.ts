import {
    describe,
    it,
    vi,
} from 'vitest';

import { createRedisKeyedStore } from '../../../src/storages/redis/keyed-store';
import type { RedisLikeStorage } from '../../../src/storages/redis/types';

describe('createRedisKeyedStore', () => {
    it('should resolve keys and delegate every operation to the wrapped redis storage', async ({ expect }) => {
        const user = { name: 'Alice' };
        const getAndRemoveItem = vi.fn(async () => user);
        const getItem = vi.fn(async () => user);
        const getItemTtlSeconds = vi.fn(async () => 30);
        const hasItem = vi.fn(async () => true);
        const removeItem = vi.fn(async () => true);
        const setItem = vi.fn(async () => true);
        const setItemWithTtl = vi.fn(async () => true);
        const setItemWithTtlIfAbsent = vi.fn(async () => true);
        const storage: RedisLikeStorage = {
            getAndRemoveItem: getAndRemoveItem as RedisLikeStorage['getAndRemoveItem'],
            getItem: getItem as RedisLikeStorage['getItem'],
            getItemTtlSeconds,
            hasItem,
            removeItem,
            setItem,
            setItemWithTtl,
            setItemWithTtlIfAbsent,
        };

        const store = createRedisKeyedStore<{ name: string }>(storage)(
            (tenant: string, id: number) => `${tenant}:user:${id}`,
        );

        expect(Object.isFrozen(store)).toBe(true);
        expect(store.resolveKey('acme', 1)).toBe('acme:user:1');
        await expect(store.setItem(user, 'acme', 1)).resolves.toBe(true);
        await expect(store.setItemWithTtl(60, user, 'acme', 1)).resolves.toBe(true);
        await expect(store.setItemWithTtlIfAbsent(60, user, 'acme', 1)).resolves.toBe(true);
        await expect(store.getItem('acme', 1)).resolves.toEqual(user);
        await expect(store.getAndRemoveItem('acme', 1)).resolves.toEqual(user);
        await expect(store.getItemTtlSeconds('acme', 1)).resolves.toBe(30);
        await expect(store.hasItem('acme', 1)).resolves.toBe(true);
        await expect(store.removeItem('acme', 1)).resolves.toBe(true);

        expect(setItem).toHaveBeenCalledWith('acme:user:1', user);
        expect(setItemWithTtl).toHaveBeenCalledWith('acme:user:1', 60, user);
        expect(setItemWithTtlIfAbsent).toHaveBeenCalledWith('acme:user:1', 60, user);
        expect(getItem).toHaveBeenCalledWith('acme:user:1');
        expect(getAndRemoveItem).toHaveBeenCalledWith('acme:user:1');
        expect(getItemTtlSeconds).toHaveBeenCalledWith('acme:user:1');
        expect(hasItem).toHaveBeenCalledWith('acme:user:1');
        expect(removeItem).toHaveBeenCalledWith('acme:user:1');
    });

    it('should surface key resolver errors as rejections without calling storage', async ({ expect }) => {
        const error = new Error('bad key');
        const getItem = vi.fn();
        const store = createRedisKeyedStore({ getItem } as unknown as RedisLikeStorage)(() => {
            throw error;
        });

        const result = store.getItem();

        await expect(result).rejects.toBe(error);
        expect(getItem).not.toHaveBeenCalled();
    });
});
