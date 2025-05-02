/**
 * @jest-environment jsdom
 */

import { appendRedirectParamToUrl } from '../src/url';
import { appendRedirectParamFromCurrentLocationToUrl } from '../src/web';

jest.mock('../src/url', () => ({ appendRedirectParamToUrl: jest.fn(() => 'mocked-result') }));

describe('appendRedirectParamFromCurrentLocationToUrl', () => {
    const originalLocation = window.location;
    beforeAll(() => {
        delete (window as any).location;
        (window as any).location = {
            hash: '#section',
            pathname: '/profile',
            search: '?tab=settings',
        };
    });

    // @ts-expect-error Ignore this error.
    afterAll(() => window.location = originalLocation);

    it('should append current location as redirect param to the given URL', () => {
        const result = appendRedirectParamFromCurrentLocationToUrl('/login');
        expect(appendRedirectParamToUrl).toHaveBeenCalledWith('/login', '/profile?tab=settings#section');
        expect(result).toBe('mocked-result');
    });
});
