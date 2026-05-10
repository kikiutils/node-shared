/**
 * @vitest-environment jsdom
 */

import {
    afterAll,
    beforeAll,
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

// Mocks
vi.mock('../src/url', () => ({ appendRedirectParamToUrl: vi.fn(() => 'mocked-result') }));

// Tests
describe('web redirect helpers', () => {
    const originalLocation = window.location;
    const assign = vi.fn();

    beforeAll(() => {
        delete (window as any).location;
        (window as any).location = {
            assign,
            hash: '#section',
            pathname: '/profile',
            search: '?tab=settings',
        };
    });

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    afterAll(() => {
        vi.useRealTimers();
        // @ts-expect-error Ignore this error.
        window.location = originalLocation;
    });

    it('should append current location as redirect param to the given URL', ({ expect }) => {
        const result = appendRedirectParamFromCurrentLocationToUrl('/login');
        expect(appendRedirectParamToUrl).toHaveBeenCalledWith('/login', '/profile?tab=settings#section');
        expect(result).toBe('mocked-result');
    });

    it('should assign immediately when no delay is provided', ({ expect }) => {
        const result = assignUrlWithRedirectParamFromCurrentLocation('/login');

        expect(result).toBeUndefined();
        expect(assign).toHaveBeenCalledWith('mocked-result');
    });

    it('should assign after the requested delay', ({ expect }) => {
        vi.useFakeTimers();

        const timer = assignUrlWithRedirectParamFromCurrentLocation('/login', 1000);

        expect(timer).toBeDefined();
        expect(assign).not.toHaveBeenCalled();
        vi.advanceTimersByTime(999);
        expect(assign).not.toHaveBeenCalled();
        vi.advanceTimersByTime(1);
        expect(assign).toHaveBeenCalledWith('mocked-result');
    });
});
