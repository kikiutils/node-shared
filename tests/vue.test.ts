import {
    describe,
    it,
    vi,
} from 'vitest';
import { ref } from 'vue';

import { appendRedirectParamToUrl } from '../src/url';
import {
    appendRedirectParamFromCurrentRouteToUrl,
    clearIntervalRef,
    clearTimeoutRef,
} from '../src/vue';

// Mocks
vi.mock('vue-router', () => ({ useRoute: vi.fn(() => ({ fullPath: '/profile?tab=settings#section' })) }));
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
        const intervalRef = ref<null | ReturnType<typeof setInterval>>(setInterval(() => {}, 1000));
        const interval = intervalRef.value;

        clearIntervalRef(intervalRef);

        expect(clearSpy).toHaveBeenCalledWith(interval);
        expect(intervalRef.value).toBeNull();

        clearSpy.mockRestore();
    });

    it('should not throw if ref is already null', ({ expect }) => {
        const intervalRef = ref<null | ReturnType<typeof setInterval>>(null);

        expect(() => clearIntervalRef(intervalRef)).not.toThrow();
        expect(intervalRef.value).toBeNull();
    });
});

describe.concurrent('clearTimeoutRef', () => {
    it('should clear the timeout and set ref to null', ({ expect }) => {
        const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
        const timeoutRef = ref<null | ReturnType<typeof setTimeout>>(setTimeout(() => {}, 1000));
        const timeout = timeoutRef.value;

        clearTimeoutRef(timeoutRef);

        expect(clearSpy).toHaveBeenCalledWith(timeout);
        expect(timeoutRef.value).toBeNull();

        clearSpy.mockRestore();
    });

    it('should not throw if ref is already null', ({ expect }) => {
        const timeoutRef = ref<null | ReturnType<typeof setTimeout>>(null);

        expect(() => clearTimeoutRef(timeoutRef)).not.toThrow();
        expect(timeoutRef.value).toBeNull();
    });
});
