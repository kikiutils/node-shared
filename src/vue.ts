import { onActivated } from 'vue';
import type { Ref } from 'vue';
import {
    onBeforeRouteLeave,
    useRoute,
} from 'vue-router';

import type { Nullable } from './types';
import { appendRedirectParamToUrl } from './url';

/**
 * Appends the current Vue Router route's fullPath as the `redirect` query parameter to the given URL.
 *
 * @param {string} url - The base URL to modify
 *
 * @returns {string} A new URL with the current route fullPath as the `redirect` parameter
 */
export function appendRedirectParamFromCurrentRouteToUrl(url: string) {
    return appendRedirectParamToUrl(url, useRoute().fullPath);
}

/**
 * Clears an interval referenced by a Vue ref and sets it to null.
 *
 * @param {Ref<Nullable<ReturnType<typeof setInterval>>>} intervalRef - A Vue ref holding a NodeJS.Timeout or null
 */
export function clearIntervalRef(intervalRef: Ref<Nullable<ReturnType<typeof setInterval>>>) {
    if (intervalRef.value) clearInterval(intervalRef.value);
    intervalRef.value = null;
}

/**
 * Clears a timeout referenced by a Vue ref and sets it to null.
 *
 * @param {Ref<Nullable<ReturnType<typeof setTimeout>>>} timeoutRef - A Vue ref holding a NodeJS.Timeout or null
 */
export function clearTimeoutRef(timeoutRef: Ref<Nullable<ReturnType<typeof setTimeout>>>) {
    if (timeoutRef.value) clearTimeout(timeoutRef.value);
    timeoutRef.value = null;
}

/**
 * A Vue composition function that remembers and restores scroll position
 * of a scrollable container across route changes and keep-alive activation.
 *
 * @template T - The type of the scrollable element (defaults to HTMLElement)
 *
 * @param {Ref<Nullable<T>>} containerRef - A ref to the scrollable HTML element
 */
export function usePreserveScroll<T extends Element = HTMLElement>(containerRef: Ref<Nullable<T>>) {
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
