import { onActivated } from 'vue';
import type { Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

/** Call within component setup under Vue Router; restoring needs `KeepAlive`, since unmounting discards the offsets. */
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
