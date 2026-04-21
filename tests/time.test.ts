import {
    describe,
    it,
    vi,
} from 'vitest';

import { abortableDelay } from '../src/time';

describe.concurrent('abortableDelay', () => {
    it('should resolve after specified milliseconds', async ({ expect }) => {
        vi.useFakeTimers();
        const promise = abortableDelay(100);
        vi.advanceTimersByTime(100);
        await expect(promise).resolves.toBeUndefined();
        vi.useRealTimers();
    });

    it('should resolve with undefined when aborted', async ({ expect }) => {
        vi.useFakeTimers();
        const controller = new AbortController();
        const promise = abortableDelay(1000, controller.signal);

        setTimeout(() => controller.abort(), 100);
        vi.advanceTimersByTime(100);

        await expect(promise).resolves.toBeUndefined();
        vi.useRealTimers();
    });

    it('should work without signal', async ({ expect }) => {
        vi.useFakeTimers();
        const promise = abortableDelay(50);

        vi.advanceTimersByTime(50);

        await expect(promise).resolves.toBeUndefined();
        vi.useRealTimers();
    });
});
