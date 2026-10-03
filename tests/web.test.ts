/**
 * @vitest-environment jsdom
 */

import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import { appendRedirectParamToUrl } from '../src/url';
import {
    appendRedirectParamFromCurrentLocationToUrl,
    assignUrlWithRedirectParamFromCurrentLocation,
} from '../src/web';

vi.mock('../src/url', () => ({ appendRedirectParamToUrl: vi.fn(() => 'mocked-result') }));

const assign = vi.fn();
const originalLocation = Object.getOwnPropertyDescriptor(window, 'location')!;

beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    Object.defineProperty(
        window,
        'location',
        {
            configurable: true,
            value: {
                assign,
                hash: '#section',
                pathname: '/profile',
                search: '?tab=settings',
            },
        },
    );
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    Object.defineProperty(window, 'location', originalLocation);
});

describe('appendRedirectParamFromCurrentLocationToUrl', () => {
    it('should forward the full current path and return the generated URL', ({ expect }) => {
        const result = appendRedirectParamFromCurrentLocationToUrl('/login');

        expect(appendRedirectParamToUrl).toHaveBeenCalledExactlyOnceWith('/login', '/profile?tab=settings#section');
        expect(result).toBe('mocked-result');
    });
});

describe('assignUrlWithRedirectParamFromCurrentLocation', () => {
    it('should assign immediately when no delay is provided', ({ expect }) => {
        const result = assignUrlWithRedirectParamFromCurrentLocation('/login');

        expect(result).toBeUndefined();
        expect(assign).toHaveBeenCalledExactlyOnceWith('mocked-result');
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should assign only after the requested delay', ({ expect }) => {
        assignUrlWithRedirectParamFromCurrentLocation('/login', 1000);

        expect(assign).not.toHaveBeenCalled();
        vi.advanceTimersByTime(999);
        expect(assign).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(assign).toHaveBeenCalledExactlyOnceWith('mocked-result');
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should return a timer handle that lets the caller cancel delayed navigation', ({ expect }) => {
        const timer = assignUrlWithRedirectParamFromCurrentLocation('/login', 1000);

        clearTimeout(timer);
        vi.advanceTimersByTime(1000);

        expect(assign).not.toHaveBeenCalled();
        expect(vi.getTimerCount()).toBe(0);
    });
});
