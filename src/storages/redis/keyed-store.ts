import type { MaybeReadonly } from '../../types';

import type { RedisLikeStorage } from './types';

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
