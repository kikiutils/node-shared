import {
    describe,
    it,
    vi,
} from 'vitest';
import { ref } from 'vue';

import type { Nullable } from '../src/types';
import { appendRedirectParamToUrl } from '../src/url';
import {
    appendRedirectParamFromCurrentRouteToUrl,
    clearIntervalRef,
    clearTimeoutRef,
    usePreserveScroll,
} from '../src/vue';

const lifecycleCallbacks = {
    activated: [] as Array<() => void>,
    beforeRouteLeave: [] as Array<() => void>,
};

// Mocks
vi.mock('vue', async (importActual) => {
    const actual = await importActual<typeof import('vue')>();
    return {
        ...actual,
        onActivated: vi.fn((callback: () => void) => lifecycleCallbacks.activated.push(callback)),
    };
});
vi.mock('vue-router', () => ({
    onBeforeRouteLeave: vi.fn((callback: () => void) => lifecycleCallbacks.beforeRouteLeave.push(callback)),
    useRoute: vi.fn(() => ({ fullPath: '/profile?tab=settings#section' })),
}));
vi.mock('../src/url', () => ({ appendRedirectParamToUrl: vi.fn(() => 'mocked-result') }));

// Tests
describe('appendRedirectParamFromCurrentRouteToUrl', () => {
    it('should append route fullPath as redirect param', ({ expect }) => {
        const result = appendRedirectParamFromCurrentRouteToUrl('/login');
        expect(appendRedirectParamToUrl).toHaveBeenCalledWith('/login', '/profile?tab=settings#section');
        expect(result).toBe('mocked-result');
    });
});

describe.concurrent('clearIntervalRef', () => {
    it('should clear the interval and set ref to null', ({ expect }) => {
        const clearSpy = vi.spyOn(globalThis, 'clearInterval');
        const intervalRef = ref<Nullable<ReturnType<typeof setInterval>>>(setInterval(() => {}, 1000));
        const interval = intervalRef.value;

        clearIntervalRef(intervalRef);

        expect(clearSpy).toHaveBeenCalledWith(interval);
        expect(intervalRef.value).toBeNull();

        clearSpy.mockRestore();
    });

    it('should not throw if ref is already null', ({ expect }) => {
        const intervalRef = ref<Nullable<ReturnType<typeof setInterval>>>(null);

        expect(() => clearIntervalRef(intervalRef)).not.toThrow();
        expect(intervalRef.value).toBeNull();
    });
});

describe.concurrent('clearTimeoutRef', () => {
    it('should clear the timeout and set ref to null', ({ expect }) => {
        const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
        const timeoutRef = ref<Nullable<ReturnType<typeof setTimeout>>>(setTimeout(() => {}, 1000));
        const timeout = timeoutRef.value;

        clearTimeoutRef(timeoutRef);

        expect(clearSpy).toHaveBeenCalledWith(timeout);
        expect(timeoutRef.value).toBeNull();

        clearSpy.mockRestore();
    });

    it('should not throw if ref is already null', ({ expect }) => {
        const timeoutRef = ref<Nullable<ReturnType<typeof setTimeout>>>(null);

        expect(() => clearTimeoutRef(timeoutRef)).not.toThrow();
        expect(timeoutRef.value).toBeNull();
    });
});

describe('usePreserveScroll', () => {
    it('should save scroll on route leave and restore it on activation', ({ expect }) => {
        lifecycleCallbacks.activated.length = 0;
        lifecycleCallbacks.beforeRouteLeave.length = 0;
        const element = {
            scrollLeft: 12,
            scrollTop: 34,
        } as HTMLElement;
        const containerRef = ref<Nullable<HTMLElement>>(element);

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
        lifecycleCallbacks.activated.length = 0;
        lifecycleCallbacks.beforeRouteLeave.length = 0;
        const containerRef = ref<Nullable<HTMLElement>>(null);

        usePreserveScroll(containerRef);

        expect(() => lifecycleCallbacks.beforeRouteLeave[0]!()).not.toThrow();
        expect(() => lifecycleCallbacks.activated[0]!()).not.toThrow();
    });
});
