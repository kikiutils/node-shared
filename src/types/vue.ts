import type { GlobalComponents } from 'vue';

/**
 * A nullable reference to an instance of a globally registered Vue component.
 *
 * @typeParam K - The component name in Vue's `GlobalComponents` registry.
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
export type ComponentRef<K extends keyof GlobalComponents> = InstanceType<GlobalComponents[K]> | null;
