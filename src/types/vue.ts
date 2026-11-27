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
export type ComponentRef<K extends keyof GlobalComponents> = ComponentRefTarget<GlobalComponents[K]> | null;

// Vue sets template refs of non-stateful components to their root element.
type ComponentRefTarget<C> = C extends abstract new (...args: any) => infer Instance ? Instance : Element;
