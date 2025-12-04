import { LRUCache } from 'lru-cache';
import {
    describe,
    it,
} from 'vitest';

import { createLruKeyedStore } from '../../../src/storages/lru/keyed-store';

interface User {
    id: number;
    name: string;
}

describe.concurrent('createLruKeyedStore', () => {
    const lru = new LRUCache({ max: 100 });
    const userStore = createLruKeyedStore<User>(lru)((id: number) => `user:${id}`);

    it('should set and get an item correctly', ({ expect }) => {
        const user = {
            id: 1,
            name: 'Alice',
        };

        userStore.setItem(user, 1);
        expect(userStore.getItem(1)).toEqual(user);
    });

    it('should return null for missing items', ({ expect }) => expect(userStore.getItem(999)).toBeNull());
    it('should confirm existence of a cached item with hasItem', ({ expect }) => {
        userStore.setItem(
            {
                id: 2,
                name: 'Bob',
            },
            2,
        );

        expect(userStore.hasItem(2)).toBe(true);
        expect(userStore.hasItem(999)).toBe(false);
    });

    it('should remove an item correctly', ({ expect }) => {
        userStore.setItem(
            {
                id: 3,
                name: 'Charlie',
            },
            3,
        );

        expect(userStore.getItem(3)).not.toBeNull();
        userStore.removeItem(3);
        expect(userStore.getItem(3)).toBeNull();
    });

    it('should resolve key using resolveKey()', ({ expect }) => {
        const key = userStore.resolveKey(123);
        expect(key).toBe('user:123');
    });

    it('should get correct TTL if set', ({ expect }) => {
        const ttlStore = new LRUCache({
            max: 100,
            ttl: 1000,
        });

        const store = createLruKeyedStore<User>(ttlStore)((id: number) => `user:${id}`);
        store.setItem(
            {
                id: 4,
                name: 'Dave',
            },
            4,
        );

        const ttl = store.getItemTtl(4);
        expect(typeof ttl).toBe('number');
        expect(ttl).toBeGreaterThan(990);
    });
});
