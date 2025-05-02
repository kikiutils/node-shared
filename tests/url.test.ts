import { appendRedirectParamToUrl } from '../src/url';

describe('appendRedirectParamToUrl', () => {
    it('should append redirect param to URL with no existing query', () => {
        const result = appendRedirectParamToUrl('/login', '/dashboard');
        expect(result).toBe('/login?redirect=%2Fdashboard');
    });

    it('should append redirect param to URL with existing query', () => {
        const result = appendRedirectParamToUrl('/login?foo=bar', '/dashboard');
        expect(result).toBe('/login?foo=bar&redirect=%2Fdashboard');
    });

    it('should overwrite existing redirect param', () => {
        const result = appendRedirectParamToUrl('/login?redirect=/home', '/dashboard');
        expect(result).toBe('/login?redirect=%2Fdashboard');
    });

    it('should preserve hash in URL (even though split ignores it)', () => {
        const result = appendRedirectParamToUrl('/login#section', '/dashboard');
        expect(result).toBe('/login#section?redirect=%2Fdashboard');
    });

    it('should handle empty redirectPath', () => {
        const result = appendRedirectParamToUrl('/login', '');
        expect(result).toBe('/login?redirect=');
    });
});
