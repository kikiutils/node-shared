import {
    describe,
    it,
    vi,
} from 'vitest';

import { createRedisKeyedStore } from '../../../src/storages/redis/keyed-store';
import type { RedisLikeStorage } from '../../../src/storages/redis/types';

describe.concurrent('createRedisKeyedStore', () => {
    it('should resolve keys and delegate every operation to the wrapped redis storage', async ({ expect }) => {
        const user = { name: 'Alice' };
        const getItem = vi.fn(() => Promise.resolve(user));
        const getItemTtl = vi.fn(() => Promise.resolve(30));
        const hasItem = vi.fn(() => Promise.resolve(true));
        const removeItem = vi.fn(() => Promise.resolve(true));
        const setItem = vi.fn(() => Promise.resolve(true));
        const setItemWithTtl = vi.fn(() => Promise.resolve(true));
        const storage: RedisLikeStorage = {
            getItem: getItem as RedisLikeStorage['getItem'],
            getItemTtl,
            hasItem,
            removeItem,
            setItem,
            setItemWithTtl,
        };
        const store = createRedisKeyedStore<{ name: string }>(storage)(
            (tenant: string, id: number) => `${tenant}:user:${id}`,
        );

        expect(Object.isFrozen(store)).toBe(true);
        expect(store.resolveKey('acme', 1)).toBe('acme:user:1');
        await expect(store.setItem(user, 'acme', 1)).resolves.toBe(true);
        await expect(store.setItemWithTtl(60, user, 'acme', 1)).resolves.toBe(true);
        await expect(store.getItem('acme', 1)).resolves.toEqual(user);
        await expect(store.getItemTtl('acme', 1)).resolves.toBe(30);
        await expect(store.hasItem('acme', 1)).resolves.toBe(true);
        await expect(store.removeItem('acme', 1)).resolves.toBe(true);

        expect(setItem).toHaveBeenCalledWith('acme:user:1', user);
        expect(setItemWithTtl).toHaveBeenCalledWith('acme:user:1', 60, user);
        expect(getItem).toHaveBeenCalledWith('acme:user:1');
        expect(getItemTtl).toHaveBeenCalledWith('acme:user:1');
        expect(hasItem).toHaveBeenCalledWith('acme:user:1');
        expect(removeItem).toHaveBeenCalledWith('acme:user:1');
    });
});
