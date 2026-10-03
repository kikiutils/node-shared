import { LRUCache } from 'lru-cache';
import {
    describe,
    it,
} from 'vitest';

import { createLruKeyedStore } from '../../../src/storages/lru/keyed-store';

describe('createLruKeyedStore', () => {
    it('should share the caller-owned cache and resolve composite keys for every operation', ({ expect }) => {
        const cache = new LRUCache<string, { name: string }>({ max: 2 });
        const store = createLruKeyedStore<{ name: string }>(cache)(
            (tenant: string, id: number) => `${tenant}:user:${id}`,
        );

        const user = { name: 'Alice' };

        expect(Object.isFrozen(store)).toBe(true);
        expect(store.resolveKey('acme', 1)).toBe('acme:user:1');
        expect(store.getItem('acme', 1)).toBeNull();
        expect(store.hasItem('acme', 1)).toBe(false);
        expect(store.setItem(user, 'acme', 1)).toBe(cache);
        expect(cache.get('acme:user:1')).toBe(user);
        expect(store.getItem('acme', 1)).toBe(user);
        expect(store.hasItem('acme', 1)).toBe(true);
        expect(store.removeItem('acme', 1)).toBe(true);
        expect(store.removeItem('acme', 1)).toBe(false);
        expect(store.getItem('acme', 1)).toBeNull();
    });

    it('should preserve falsy cached values rather than treating them as missing', ({ expect }) => {
        const cache = new LRUCache<string, boolean | number | string>({ max: 3 });
        const store = createLruKeyedStore<boolean | number | string>(cache)((id: string) => id);

        for (
            const value of [
                0,
                false,
                '',
            ]
        ) {
            store.setItem(value, 'key');
            expect(store.getItem('key')).toBe(value);
        }
    });

    it('should expose remaining TTL in milliseconds and return null after expiry', ({ expect }) => {
        let now = 1000;
        const cache = new LRUCache<string, string>({
            max: 1,
            perf: { now: () => now },
            ttl: 1000,
            ttlResolution: 0,
        });

        const store = createLruKeyedStore<string>(cache)((id: number) => `item:${id}`);
        store.setItem('value', 1);

        expect(store.getItemTtl(1)).toBe(1000);
        now += 400;
        expect(store.getItemTtl(1)).toBe(600);
        now += 601;
        expect(store.getItem(1)).toBeNull();
        expect(store.hasItem(1)).toBe(false);
    });
});
