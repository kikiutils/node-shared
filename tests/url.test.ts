import {
    describe,
    it,
} from 'vitest';

import {
    appendRedirectParamToUrl,
    isSafeRedirectPath,
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
            expected: '/login?redirect=%2Fdashboard#section',
            url: '/login#section',
        },
        {
            expected: '?foo=bar&redirect=%2Fdashboard',
            url: '?foo=bar',
        },
    ])(
        'should update the redirect parameter of $url',
        ({ expected, url }, { expect }) => {
            expect(appendRedirectParamToUrl(url, '/dashboard')).toBe(expected);
        },
    );

    it('should encode query and fragment characters within the redirect destination', ({ expect }) => {
        expect(appendRedirectParamToUrl('/login', '/dashboard?tab=home#section'))
            .toBe('/login?redirect=%2Fdashboard%3Ftab%3Dhome%23section');
    });

    it.for([
        '',
        'dashboard',
        'https://evil.com',
        'http://evil.com',
        '//evil.com',
        '/\\evil.com',
    ])(
        'should reject unsafe redirect destination %j',
        (redirect, { expect }) => {
            expect(() => appendRedirectParamToUrl('/login', redirect)).toThrow('Invalid redirect path');
        },
    );

    // The current parser includes a trailing fragment in rawQuery; see docs/todo.md.
    it.todo('should preserve the URL fragment when the target already has a query');
});

describe('isSafeRedirectPath', () => {
    it.for([
        '/',
        '/dashboard',
        '/dashboard?tab=home#section',
    ])(
        'should accept application path %j',
        (path, { expect }) => {
            expect(isSafeRedirectPath(path)).toBe(true);
        },
    );

    it.for([
        '',
        'dashboard',
        'https://evil.com',
        'http://evil.com',
        '//evil.com',
        '/\\evil.com',
        123,
        undefined,
        null,
    ])(
        'should reject unsafe or non-string path %j',
        (path, { expect }) => {
            expect(isSafeRedirectPath(path)).toBe(false);
        },
    );
});

describe('normalizeRedirectPath', () => {
    it('should return a safe string or the safe first array element unchanged', ({ expect }) => {
        expect(normalizeRedirectPath('/dashboard')).toBe('/dashboard');
        expect(
            normalizeRedirectPath([
                '/dashboard',
                '//evil.com',
            ]),
        ).toBe('/dashboard');
    });

    it.for([
        {
            input: '//evil.com',
            name: 'a protocol-relative URL',
        },
        {
            input: 'https://evil.com',
            name: 'an absolute URL',
        },
        {
            input: '/\\evil.com',
            name: 'a backslash path',
        },
        {
            input: undefined,
            name: 'an undefined value',
        },
        {
            input: [],
            name: 'an empty array',
        },
        {
            input: [
                '//evil.com',
                '/safe',
            ],
            name: 'an unsafe first element',
        },
    ])(
        'should select the default or custom fallback for $name',
        ({ input }, { expect }) => {
            expect(normalizeRedirectPath(input)).toBe('/');
            expect(normalizeRedirectPath(input, '/fallback')).toBe('/fallback');
        },
    );

    it('should return the caller-supplied fallback without validating it', ({ expect }) => {
        expect(normalizeRedirectPath(undefined, 'custom')).toBe('custom');
    });
});
