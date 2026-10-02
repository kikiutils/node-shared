import type { MaybeReadonly } from '../../types';

import type { RedisLikeStorage } from './types';

/**
 * Creates a keyed store factory sharing a caller-owned Redis-like storage facade.
 *
 * @remarks
 * The key resolver is called synchronously once per operation with the operation's key arguments.
 * Resolver exceptions propagate synchronously; asynchronous storage failures retain the underlying rejection.
 * `setItemWithTtl` accepts its TTL in seconds before the value and key arguments.
 * The factory does not open or close the underlying connection; cleanup remains the caller's responsibility.
 *
 * @typeParam D - The stored value type used by reads and writes.
 *
 * @param storage - The shared Redis-like storage instance.
 *
 * @returns A factory accepting a key resolver and returning a new frozen keyed facade sharing the storage.
 * Reads, writes, removals, and TTL results retain the underlying storage contract.
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
