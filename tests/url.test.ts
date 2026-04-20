import {
    describe,
    it,
} from 'vitest';

import { appendRedirectParamToUrl } from '../src/url';

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
});
