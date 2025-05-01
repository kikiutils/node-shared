import { onActivated } from 'vue';
import type { Ref } from 'vue';
import { onBeforeRouteLeave } from 'vue-router';

/**
 * Clears an interval referenced by a Vue ref and sets it to null.
 *
 * @param intervalRef - A Vue ref holding a NodeJS.Timeout or null
 */
export function clearIntervalRef(intervalRef: Ref<null | ReturnType<typeof setInterval>>) {
    if (intervalRef.value) clearInterval(intervalRef.value);
    intervalRef.value = null;
}

/**
 * Clears a timeout referenced by a Vue ref and sets it to null.
 *
 * @param timeoutRef - A Vue ref holding a NodeJS.Timeout or null
 */
export function clearTimeoutRef(timeoutRef: Ref<null | ReturnType<typeof setTimeout>>) {
    if (timeoutRef.value) clearTimeout(timeoutRef.value);
    timeoutRef.value = null;
}

/**
 * A Vue composition function that remembers and restores scroll position
 * of a scrollable container across route changes and keep-alive activation.
 *
 * @param containerRef - A ref to the scrollable HTML element
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
        scrollLeft = containerRef.value?.scrollLeft || 0;
        scrollTop = containerRef.value?.scrollTop || 0;
    });
}
