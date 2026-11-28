// @vitest-environment jsdom

import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import {
    appendRedirectParamFromCurrentLocationToUrl,
    assignUrlWithRedirectParamFromCurrentLocation,
} from '../src/web';

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

        expect(result).toBe('/login?redirect=%2Fprofile%3Ftab%3Dsettings%23section');
    });

    it('should keep a backslash in the current query instead of rejecting the redirect', ({ expect }) => {
        window.location.search = '?q=a\\b';

        expect(appendRedirectParamFromCurrentLocationToUrl('/login')).toBe('/login?redirect=%2Fprofile%3Fq%3Da%5Cb%23section');
    });

    it.for([
        {
            expected: '/login?redirect=%2Forders%3Ftab%3Dsettings%23section',
            pathname: '//orders',
        },
        {
            expected: '/login?redirect=%2Fa%2Fb%3Ftab%3Dsettings%23section',
            pathname: '///a/b',
        },
    ])(
        'should collapse leading slashes of $pathname into a single slash',
        ({ expected, pathname }, { expect }) => {
            window.location.pathname = pathname;

            expect(appendRedirectParamFromCurrentLocationToUrl('/login')).toBe(expected);
        },
    );
});

describe('assignUrlWithRedirectParamFromCurrentLocation', () => {
    it('should assign immediately when no delay is provided', ({ expect }) => {
        const result = assignUrlWithRedirectParamFromCurrentLocation('/login');

        expect(result).toBeUndefined();
        expect(assign).toHaveBeenCalledExactlyOnceWith('/login?redirect=%2Fprofile%3Ftab%3Dsettings%23section');
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should defer navigation when the supplied delay is zero', ({ expect }) => {
        const timer = assignUrlWithRedirectParamFromCurrentLocation('/login', 0);

        expect(timer).toBeDefined();
        expect(vi.getTimerCount()).toBe(1);
        expect(assign).not.toHaveBeenCalled();
        vi.advanceTimersByTime(0);

        expect(assign).toHaveBeenCalledExactlyOnceWith('/login?redirect=%2Fprofile%3Ftab%3Dsettings%23section');
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should read the latest location only after the requested delay', ({ expect }) => {
        assignUrlWithRedirectParamFromCurrentLocation('/login', 1000);

        expect(assign).not.toHaveBeenCalled();
        vi.advanceTimersByTime(999);

        expect(assign).not.toHaveBeenCalled();
        window.location.pathname = '/updated';
        vi.advanceTimersByTime(1);

        expect(assign).toHaveBeenCalledExactlyOnceWith('/login?redirect=%2Fupdated%3Ftab%3Dsettings%23section');
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should return a handle that cancels the pending navigation', ({ expect }) => {
        clearTimeout(assignUrlWithRedirectParamFromCurrentLocation('/login', 1000));
        vi.advanceTimersByTime(1000);

        expect(assign).not.toHaveBeenCalled();
    });
});
