import { ref } from 'vue';

import { appendRedirectParamToUrl } from '../src/url';
import {
    appendRedirectParamFromCurrentRouteToUrl,
    clearIntervalRef,
    clearTimeoutRef,
} from '../src/vue';

jest.mock('vue-router', () => ({ useRoute: jest.fn(() => ({ fullPath: '/profile?tab=settings#section' })) }));

jest.mock('../src/url', () => ({ appendRedirectParamToUrl: jest.fn(() => 'mocked-result') }));

describe('appendRedirectParamFromCurrentRouteToUrl', () => {
    it('should append route fullPath as redirect param', () => {
        const result = appendRedirectParamFromCurrentRouteToUrl('/login');
        expect(appendRedirectParamToUrl).toHaveBeenCalledWith('/login', '/profile?tab=settings#section');
        expect(result).toBe('mocked-result');
    });
});

describe('clearIntervalRef', () => {
    it('should clear the interval and set ref to null', () => {
        const intervalRef = ref<null | ReturnType<typeof setInterval>>(null);
        const interval = setInterval(() => {}, 1000);
        intervalRef.value = interval;
        const clearSpy = jest.spyOn(globalThis, 'clearInterval');
        clearIntervalRef(intervalRef);
        expect(clearSpy).toHaveBeenCalledWith(interval);
        expect(intervalRef.value).toBeNull();
        clearSpy.mockRestore();
    });

    it('should not throw if ref is already null', () => {
        const intervalRef = ref<null | ReturnType<typeof setInterval>>(null);
        expect(() => clearIntervalRef(intervalRef)).not.toThrow();
        expect(intervalRef.value).toBeNull();
    });
});

describe('clearTimeoutRef', () => {
    it('should clear the timeout and set ref to null', () => {
        const timeoutRef = ref<null | ReturnType<typeof setTimeout>>(null);
        const timeout = setTimeout(() => {}, 1000);
        timeoutRef.value = timeout;
        const clearSpy = jest.spyOn(globalThis, 'clearTimeout');
        clearTimeoutRef(timeoutRef);
        expect(clearSpy).toHaveBeenCalledWith(timeout);
        expect(timeoutRef.value).toBeNull();
        clearSpy.mockRestore();
    });

    it('should not throw if ref is already null', () => {
        const timeoutRef = ref<null | ReturnType<typeof setTimeout>>(null);
        expect(() => clearTimeoutRef(timeoutRef)).not.toThrow();
        expect(timeoutRef.value).toBeNull();
    });
});
