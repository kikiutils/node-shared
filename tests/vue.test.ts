import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';
import {
    ref,
    shallowRef,
} from 'vue';

import {
    appendRedirectParamFromCurrentRouteToUrl,
    clearIntervalRef,
    clearTimeoutRef,
    usePreserveScroll,
} from '../src/vue';

// Hoisted state is required by the module mock factories.
const lifecycleCallbacks = vi.hoisted(() => ({
    activated: [] as Array<() => void>,
    beforeRouteLeave: [] as Array<() => void>,
}));

vi.mock('vue', async (importActual) => {
    const actual = await importActual<typeof import('vue')>();
    return {
        ...actual,
        onActivated: (callback: () => void) => lifecycleCallbacks.activated.push(callback),
    };
});

vi.mock('vue-router', () => ({
    onBeforeRouteLeave: (callback: () => void) => lifecycleCallbacks.beforeRouteLeave.push(callback),
    useRoute: () => ({ fullPath: '/profile?tab=settings#section' }),
}));

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    lifecycleCallbacks.activated.length = 0;
    lifecycleCallbacks.beforeRouteLeave.length = 0;
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('appendRedirectParamFromCurrentRouteToUrl', () => {
    it('should append route fullPath as redirect param', ({ expect }) => {
        const result = appendRedirectParamFromCurrentRouteToUrl('/login');

        expect(result).toBe('/login?redirect=%2Fprofile%3Ftab%3Dsettings%23section');
    });
});

describe('clearIntervalRef', () => {
    it('should clear the interval and set ref to null', ({ expect }) => {
        const clearSpy = vi.spyOn(globalThis, 'clearInterval');
        const intervalRef = ref<null | ReturnType<typeof setInterval>>(setInterval(() => {}, 1000));
        const interval = intervalRef.value;

        clearIntervalRef(intervalRef);

        expect(clearSpy).toHaveBeenCalledWith(interval);
        expect(intervalRef.value).toBeNull();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should preserve a null timer ref', ({ expect }) => {
        const intervalRef = ref<null | ReturnType<typeof setInterval>>(null);

        clearIntervalRef(intervalRef);

        expect(intervalRef.value).toBeNull();
    });
});

describe('clearTimeoutRef', () => {
    it('should clear the timeout and set ref to null', ({ expect }) => {
        const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
        const timeoutRef = ref<null | ReturnType<typeof setTimeout>>(setTimeout(() => {}, 1000));
        const timeout = timeoutRef.value;

        clearTimeoutRef(timeoutRef);

        expect(clearSpy).toHaveBeenCalledWith(timeout);
        expect(timeoutRef.value).toBeNull();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should preserve a null timer ref', ({ expect }) => {
        const timeoutRef = ref<null | ReturnType<typeof setTimeout>>(null);

        clearTimeoutRef(timeoutRef);

        expect(timeoutRef.value).toBeNull();
    });
});

describe('usePreserveScroll', () => {
    it('should save scroll on route leave and restore it on activation', ({ expect }) => {
        const element = {
            scrollLeft: 12,
            scrollTop: 34,
        };

        // Only scroll offsets are consumed; shallowRef preserves the fixture identity.

        const containerRef = shallowRef(element as HTMLElement);

        usePreserveScroll(containerRef);

        expect(lifecycleCallbacks.activated).toHaveLength(1);
        expect(lifecycleCallbacks.beforeRouteLeave).toHaveLength(1);

        lifecycleCallbacks.beforeRouteLeave[0]!();
        element.scrollLeft = 0;
        element.scrollTop = 0;
        lifecycleCallbacks.activated[0]!();

        expect(element.scrollLeft).toBe(12);
        expect(element.scrollTop).toBe(34);
    });

    it('should tolerate a missing container while saving and restoring scroll', ({ expect }) => {
        const containerRef = ref<HTMLElement | null>(null);

        usePreserveScroll(containerRef);

        lifecycleCallbacks.beforeRouteLeave[0]!();
        lifecycleCallbacks.activated[0]!();

        // Saving with no element resets the offsets used by a later activation.
        const element = {
            scrollLeft: 12,
            scrollTop: 34,
        };

        containerRef.value = element as HTMLElement;
        lifecycleCallbacks.activated[0]!();

        expect(containerRef.value.scrollLeft).toBe(0);
        expect(containerRef.value.scrollTop).toBe(0);
    });
});
