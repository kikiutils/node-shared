import { onActivated } from 'vue';
import type { Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

/**
 * Call within Vue component setup with Vue Router and `KeepAlive`. Route leave saves the current offsets, and each
 * activation restores them to the currently referenced element. A missing element saves zero offsets and skips
 * restoration. Without `KeepAlive`, unmounting discards the state.
 */
export function usePreserveScroll<T extends Element = HTMLElement>(containerRef: Ref<null | T>) {
    let scrollLeft = 0;
    let scrollTop = 0;
    onActivated(() => {
        if (!containerRef.value) return;
        containerRef.value.scrollLeft = scrollLeft;
        containerRef.value.scrollTop = scrollTop;
    });

    onBeforeRouteLeave(() => {
        scrollLeft = containerRef.value?.scrollLeft ?? 0;
        scrollTop = containerRef.value?.scrollTop ?? 0;
    });
}
