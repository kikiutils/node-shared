import { onActivated } from 'vue';
import type { Ref } from 'vue';
import {
    onBeforeRouteLeave,
    useRoute,
} from 'vue-router';

import { appendRedirectParamToUrl } from './url';

/**
 * Appends the current Vue Router route's `fullPath` as the `redirect` query parameter to the given URL.
 *
 * @param url - The base URL to modify.
 *
 * @returns A new URL with the current route `fullPath` as the `redirect` parameter.
 */
export function appendRedirectParamFromCurrentRouteToUrl(url: string) {
    return appendRedirectParamToUrl(url, useRoute().fullPath);
}

/**
 * Clears an interval referenced by a Vue ref and sets it to `null`.
 *
 * @param intervalRef - A Vue ref holding a timer handle or `null`.
 */
export function clearIntervalRef(intervalRef: Ref<null | ReturnType<typeof setInterval>>) {
    if (intervalRef.value) clearInterval(intervalRef.value);
    intervalRef.value = null;
}

/**
 * Clears a timeout referenced by a Vue ref and sets it to `null`.
 *
 * @param timeoutRef - A Vue ref holding a timer handle or `null`.
 */
export function clearTimeoutRef(timeoutRef: Ref<null | ReturnType<typeof setTimeout>>) {
    if (timeoutRef.value) clearTimeout(timeoutRef.value);
    timeoutRef.value = null;
}

/**
 * Registers hooks that save and restore a container's scroll position across kept-alive route changes.
 *
 * @remarks
 * Call within Vue component setup with Vue Router and `KeepAlive`.
 * Route leave saves the current offsets, and each activation restores them to the currently referenced element.
 * A missing element saves zero offsets and skips restoration. Without `KeepAlive`, unmounting discards the state.
 * The hooks follow the component lifecycle; there is no separate cleanup handle.
 *
 * @typeParam T - The scrollable element type.
 *
 * @param containerRef - The reference to the scrollable element, or `null` while it is unavailable.
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
