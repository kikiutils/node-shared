import type { MaybeReadonly } from '../../types';

import type { RedisLikeStorage } from './types';

/**
 * Creates a keyed store wrapper around a Redis-like storage.
 *
 * @template D - The data type stored in the keyed store
 *
 * @param {MaybeReadonly<RedisLikeStorage>} storage - The underlying Redis-like storage instance
 *
 * @returns {(keyFn: (...args: P) => string) => Readonly<{
 *   getItem, getItemTtl, hasItem, removeItem, resolveKey, setItem, setItemWithTtl
 * }>} A keyed store factory that takes a key resolution function
 *
 * @example
 * ```typescript
 * import { createRedisKeyedStore } from '@kikiutils/shared/storages/redis/keyed-store';
 * import { createRedisMsgpackStorage } from '@kikiutils/shared/storages/redis/msgpack';
 * import { createClient } from 'redis';
 *
 * const client = createClient();
 * await client.connect();
 * const storage = createRedisMsgpackStorage(client as unknown as RedisLikeAdapter);
 * const keyedStore = createRedisKeyedStore(storage)((userId: string) => `user:${userId}`);
 * await keyedStore.setItem({ name: 'Alice' }, 'user-123');
 * const user = await keyedStore.getItem('user-123'); // { name: 'Alice' }
 * ```
 */
export function createRedisKeyedStore<D = unknown>(storage: MaybeReadonly<RedisLikeStorage>) {
    return <P extends any[]>(keyFn: (...args: P) => string) => Object.freeze({
        getItem: (...args: P) => storage.getItem<D>(keyFn(...args)),
        getItemTtl: (...args: P) => storage.getItemTtl(keyFn(...args)),
        hasItem: (...args: P) => storage.hasItem(keyFn(...args)),
        removeItem: (...args: P) => storage.removeItem(keyFn(...args)),
        resolveKey: (...args: P) => keyFn(...args),
        setItem: (value: D, ...args: P) => storage.setItem(keyFn(...args), value),
        setItemWithTtl(ttlSeconds: number, value: D, ...args: P) {
            return storage.setItemWithTtl(keyFn(...args), ttlSeconds, value);
        },
    });
}
