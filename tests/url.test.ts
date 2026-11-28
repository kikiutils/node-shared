import {
    describe,
    it,
} from 'vitest';

import {
    appendRedirectParamToUrl,
    normalizeRedirectPath,
} from '../src/url';

describe('appendRedirectParamToUrl', () => {
    it.for([
        {
            expected: '/login?redirect=%2Fdashboard',
            url: '/login',
        },
        {
            expected: '/login?foo=bar&redirect=%2Fdashboard',
            url: '/login?foo=bar',
        },
        {
            expected: '/login?redirect=%2Fdashboard',
            url: '/login?redirect=/home',
        },
        {
            expected: '/login?redirect=%2Fdashboard&foo=bar',
            url: '/login?redirect=/a&foo=bar&redirect=/b',
        },
        {
            expected: '/login?redirect=%2Fdashboard#section',
            url: '/login#section',
        },
        {
            expected: '?foo=bar&redirect=%2Fdashboard',
            url: '?foo=bar',
        },
        {
            expected: '/login?foo=bar&redirect=%2Fdashboard#section',
            url: '/login?foo=bar#section',
        },
        {
            expected: '/login?foo=bar%3Fbaz&redirect=%2Fdashboard',
            url: '/login?foo=bar?baz',
        },
        {
            expected: '/login?redirect=%2Fdashboard#section?tab=home',
            url: '/login#section?tab=home',
        },
    ])(
        'should update the redirect parameter of $url',
        ({ expected, url }, { expect }) => {
            expect(appendRedirectParamToUrl(url, '/dashboard')).toBe(expected);
        },
    );

    it('should store the normalized form of the redirect destination', ({ expect }) => {
        expect(appendRedirectParamToUrl('/login', '/x/..//evil.com')).toBe('/login?redirect=%2Fevil.com');
    });

    it('should encode query and fragment characters within the redirect destination', ({ expect }) => {
        expect(appendRedirectParamToUrl('/login', '/dashboard?tab=home#section'))
            .toBe('/login?redirect=%2Fdashboard%3Ftab%3Dhome%23section');
    });

    it('should reject an unsafe redirect destination', ({ expect }) => {
        expect(() => appendRedirectParamToUrl('/login', '//evil.com')).toThrow(TypeError);
    });
});

describe('normalizeRedirectPath', () => {
    it.for([
        {
            expected: '/',
            input: '/',
        },
        {
            expected: '/dashboard?tab=home#section',
            input: '/dashboard?tab=home#section',
        },
        {
            expected: '/search?q=a\\b',
            input: '/search?q=a\\b',
        },
        {
            expected: '/page#a\\b',
            input: '/page#a\\b',
        },
        {
            expected: '/a/b?q=1',
            input: '/a\\b?q=1',
        },
        {
            expected: '/y',
            input: '/x/../y',
        },
        {
            expected: '/evil.com',
            input: '/x/..//evil.com',
        },
        {
            expected: '/a%20b',
            input: '/a b',
        },
        {
            expected: '/ab',
            input: '/a\tb',
        },
        {
            expected: '/evil.com',
            input: '/.//evil.com',
        },
        {
            expected: '/evil.com',
            input: '/%2e%2e//evil.com',
        },
        {
            expected: '/%2F/evil.com',
            input: '/%2F/evil.com',
        },
        {
            expected: '/',
            input: '/a/../..',
        },
    ])(
        'should return the browser-resolved path for $input',
        ({ expected, input }, { expect }) => {
            const result = normalizeRedirectPath(input);

            expect(result).toBe(expected);
            // The returned path must stay on the current origin when navigated to.
            expect(new URL(result, 'https://app.test').origin).toBe('https://app.test');
        },
    );

    it.for([
        '',
        'dashboard',
        'https://evil.com',
        '//evil.com',
        '/\\evil.com',
        '/\n/evil.com',
        '/\t/evil.com',
        '//[',
        123,
        undefined,
        [],
        [
            '//evil.com',
            '/safe',
        ],
    ])(
        'should select the default or custom fallback for %j',
        (input, { expect }) => {
            expect(normalizeRedirectPath(input)).toBe('/');
            expect(normalizeRedirectPath(input, '/fallback')).toBe('/fallback');
        },
    );

    it('should use the first array element', ({ expect }) => {
        expect(
            normalizeRedirectPath([
                '/dashboard',
                '//evil.com',
            ]),
        ).toBe('/dashboard');
    });

    it('should return the caller-supplied fallback without validating it', ({ expect }) => {
        expect(normalizeRedirectPath(undefined, 'custom')).toBe('custom');
    });
});
