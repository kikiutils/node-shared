import type { GlobalComponents } from 'vue';

/**
 * A nullable reference to an instance of a globally registered Vue component.
 *
 * @example
 *
 * ```ts
 * import type { ComponentRef } from '@kikiutils/shared/types/vue';
 * import { ref } from 'vue';
 *
 * const keepAliveRef = ref<ComponentRef<'KeepAlive'>>(null);
 * ```
 */
export type ComponentRef<K extends keyof GlobalComponents> = GlobalComponents[K] extends abstract new (
    ...args: any
) => infer Instance ? Instance | null : never;
