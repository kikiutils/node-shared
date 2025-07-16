/**
 * @vitest-environment jsdom
 */

import {
    afterAll,
    beforeAll,
    describe,
    it,
    vi,
} from 'vitest';

import { appendRedirectParamToUrl } from '../src/url';
import { appendRedirectParamFromCurrentLocationToUrl } from '../src/web';

vi.mock('../src/url', () => ({ appendRedirectParamToUrl: vi.fn(() => 'mocked-result') }));

describe.concurrent('appendRedirectParamFromCurrentLocationToUrl', () => {
    const originalLocation = window.location;
    beforeAll(() => {
        delete (window as any).location;
        (window as any).location = {
            hash: '#section',
            pathname: '/profile',
            search: '?tab=settings',
        };
    });

    afterAll(() => {
        // @ts-expect-error Ignore this error.
        window.location = originalLocation;
    });

    it('should append current location as redirect param to the given URL', ({ expect }) => {
        const result = appendRedirectParamFromCurrentLocationToUrl('/login');

        expect(appendRedirectParamToUrl).toHaveBeenCalledWith('/login', '/profile?tab=settings#section');
        expect(result).toBe('mocked-result');
    });
});
