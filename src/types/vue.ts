import type { GlobalComponents } from 'vue';

import type { Nullable } from './';

/**
 * A type that represents a reference to a Vue component instance.
 * The reference can be either an instance of the specified component or null.
 *
 * @template K - The key of the component in the GlobalComponents.
 *
 * @example
 * ```typescript
 * import type { ComponentRef } from '@kikiutils/types/vue';
 *
 * const keepAliveRef = ref<ComponentRef<'KeepAlive'>>(null);
 * ```
 */
export type ComponentRef<K extends keyof GlobalComponents> = Nullable<InstanceType<GlobalComponents[K]>>;
