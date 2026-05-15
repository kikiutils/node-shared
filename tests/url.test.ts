import {
    describe,
    it,
} from 'vitest';

import {
    appendRedirectParamToUrl,
    isSafeRedirectPath,
    normalizeRedirectPath,
} from '../src/url';

describe.concurrent('isSafeRedirectPath', () => {
    it('should accept same-origin application paths', ({ expect }) => {
        expect(isSafeRedirectPath('/')).toBe(true);
        expect(isSafeRedirectPath('/dashboard')).toBe(true);
        expect(isSafeRedirectPath('/dashboard?tab=home#section')).toBe(true);
    });

    it('should reject unsafe redirect paths', ({ expect }) => {
        expect(isSafeRedirectPath('')).toBe(false);
        expect(isSafeRedirectPath('dashboard')).toBe(false);
        expect(isSafeRedirectPath('https://evil.com')).toBe(false);
        expect(isSafeRedirectPath('http://evil.com')).toBe(false);
        expect(isSafeRedirectPath('//evil.com')).toBe(false);
        expect(isSafeRedirectPath('/\\evil.com')).toBe(false);
        expect(isSafeRedirectPath(123)).toBe(false);
        expect(isSafeRedirectPath(undefined)).toBe(false);
    });
});

describe.concurrent('normalizeRedirectPath', () => {
    it('should return safe redirect paths', ({ expect }) => {
        expect(normalizeRedirectPath('/dashboard')).toBe('/dashboard');
        expect(normalizeRedirectPath([
            '/dashboard',
            '//evil.com',
        ])).toBe('/dashboard');
    });

    it('should return fallback for unsafe redirect paths', ({ expect }) => {
        expect(normalizeRedirectPath('//evil.com')).toBe('/');
        expect(normalizeRedirectPath('https://evil.com')).toBe('/');
        expect(normalizeRedirectPath('/\\evil.com')).toBe('/');
        expect(normalizeRedirectPath(undefined, '/fallback')).toBe('/fallback');
    });
});

describe.concurrent('appendRedirectParamToUrl', () => {
    it('should append redirect param to URL with no existing query', ({ expect }) => {
        const result = appendRedirectParamToUrl('/login', '/dashboard');
        expect(result).toBe('/login?redirect=%2Fdashboard');
    });

    it('should append redirect param to URL with existing query', ({ expect }) => {
        const result = appendRedirectParamToUrl('/login?foo=bar', '/dashboard');
        expect(result).toBe('/login?foo=bar&redirect=%2Fdashboard');
    });

    it('should overwrite existing redirect param', ({ expect }) => {
        const result = appendRedirectParamToUrl('/login?redirect=/home', '/dashboard');
        expect(result).toBe('/login?redirect=%2Fdashboard');
    });

    it('should preserve hash in URL', ({ expect }) => {
        const result = appendRedirectParamToUrl('/login#section', '/dashboard');
        expect(result).toBe('/login?redirect=%2Fdashboard#section');
    });

    it('should throw error for empty redirectPath', ({ expect }) => {
        expect(() => appendRedirectParamToUrl('/login', '')).toThrow();
    });

    it('should throw error for absolute URL as redirectPath', ({ expect }) => {
        expect(() => appendRedirectParamToUrl('/login', 'https://evil.com')).toThrow();
        expect(() => appendRedirectParamToUrl('/login', 'http://evil.com')).toThrow();
    });

    it('should throw error for protocol-relative URL as redirectPath', ({ expect }) => {
        expect(() => appendRedirectParamToUrl('/login', '//evil.com')).toThrow();
    });

    it('should throw error for backslash redirectPath', ({ expect }) => {
        expect(() => appendRedirectParamToUrl('/login', '/\\evil.com')).toThrow();
    });

    it('should handle URL starting with question mark', ({ expect }) => {
        const result = appendRedirectParamToUrl('?foo=bar', '/dashboard');
        expect(result).toBe('?foo=bar&redirect=%2Fdashboard');
    });
});
