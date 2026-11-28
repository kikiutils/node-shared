import {
    describe,
    it,
    vi,
} from 'vitest';

import { createRedisKeyedStore } from '../../../src/storages/redis/keyed-store';
import type { RedisLikeStorage } from '../../../src/storages/redis/types';

describe('createRedisKeyedStore', () => {
    it('should store every operation under the resolved key of the shared storage', async ({ expect }) => {
        const values = new Map<string, unknown>();
        const ttls = new Map<string, number>();
        const storage: RedisLikeStorage = {
            getAndRemoveItem: async <T>(key: string) => {
                const value = values.get(key) ?? null;
                values.delete(key);
                return value as null | T;
            },
            getItem: async <T>(key: string) => (values.get(key) ?? null) as null | T,
            getItemTtlSeconds: async (key) => ttls.get(key) ?? (values.has(key) ? -1 : -2),
            hasItem: async (key) => values.has(key),
            removeItem: async (key) => values.delete(key),
            setItem: async (key, value) => !!values.set(key, value),
            setItemWithTtl: async (key, ttlSeconds, value) => !!values.set(key, value) && !!ttls.set(key, ttlSeconds),
            setItemWithTtlIfAbsent: async (key, ttlSeconds, value) => {
                if (values.has(key)) return false;
                values.set(key, value);
                ttls.set(key, ttlSeconds);
                return true;
            },
        };

        const store = createRedisKeyedStore<{ name: string }>(storage)(
            (tenant: string, id: number) => `${tenant}:user:${id}`,
        );

        const alice = { name: 'Alice' };

        expect(Object.isFrozen(store)).toBe(true);
        expect(store.resolveKey('acme', 1)).toBe('acme:user:1');
        await expect(store.setItem(alice, 'acme', 1)).resolves.toBe(true);
        await expect(storage.getItem('acme:user:1')).resolves.toBe(alice);
        await expect(store.hasItem('acme', 2)).resolves.toBe(false);

        await expect(store.setItemWithTtlIfAbsent(60, { name: 'Bob' }, 'acme', 1)).resolves.toBe(false);
        await expect(store.setItemWithTtlIfAbsent(60, { name: 'Bob' }, 'acme', 2)).resolves.toBe(true);
        await expect(store.getItemTtlSeconds('acme', 2)).resolves.toBe(60);
        await expect(store.setItemWithTtl(30, alice, 'acme', 3)).resolves.toBe(true);
        await expect(store.getItemTtlSeconds('acme', 3)).resolves.toBe(30);

        await expect(store.getAndRemoveItem('acme', 1)).resolves.toBe(alice);
        await expect(store.getItem('acme', 1)).resolves.toBeNull();
        await expect(store.removeItem('acme', 2)).resolves.toBe(true);
        await expect(store.hasItem('acme', 2)).resolves.toBe(false);
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
