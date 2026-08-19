import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { delayOrThrow } from '../src/time';

afterEach(() => {
    vi.useRealTimers();
});

describe.concurrent('delayOrThrow', () => {
    it('should resolve after specified milliseconds', async ({ expect }) => {
        vi.useFakeTimers();

        const promise = delayOrThrow(100);

        await vi.advanceTimersByTimeAsync(100);

        await expect(promise).resolves.toBeUndefined();
    });

    it('should reject with abort reason when aborted', async ({ expect }) => {
        vi.useFakeTimers();

        const controller = new AbortController();
        const reason = new Error('aborted');
        const promise = delayOrThrow(1000, controller.signal);

        controller.abort(reason);

        await expect(promise).rejects.toBe(reason);
    });

    it('should reject immediately when signal is already aborted', async ({ expect }) => {
        vi.useFakeTimers();

        const controller = new AbortController();
        const reason = new Error('aborted');
        controller.abort(reason);

        await expect(delayOrThrow(1000, controller.signal)).rejects.toBe(reason);
    });

    it('should work without signal', async ({ expect }) => {
        vi.useFakeTimers();

        const promise = delayOrThrow(50);

        await vi.advanceTimersByTimeAsync(50);

        await expect(promise).resolves.toBeUndefined();
    });
});
