import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import {
    delay,
    delayOrThrow,
} from '../src/time';

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

describe('delay', () => {
    it('should remain pending until the requested duration elapses', async ({ expect }) => {
        const settled = vi.fn();
        const promise = delay(100).then(settled);

        await vi.advanceTimersByTimeAsync(99);
        expect(settled).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);

        await expect(promise).resolves.toBeUndefined();
        expect(settled).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should resolve on abort without keeping the timer', async ({ expect }) => {
        const controller = new AbortController();
        const promise = delay(1000, controller.signal);

        controller.abort(new Error('Canceled'));

        await expect(promise).resolves.toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should resolve an already aborted signal without scheduling a timer', async ({ expect }) => {
        await expect(delay(1000, AbortSignal.abort())).resolves.toBeUndefined();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should remove the abort listener on normal completion', async ({ expect }) => {
        const controller = new AbortController();
        const remove = vi.spyOn(controller.signal, 'removeEventListener');
        const promise = delay(100, controller.signal);

        await vi.advanceTimersByTimeAsync(100);

        await expect(promise).resolves.toBeUndefined();
        expect(remove).toHaveBeenCalledExactlyOnceWith('abort', expect.any(Function));
    });
});

describe('delayOrThrow', () => {
    it('should remain pending until the requested duration elapses', async ({ expect }) => {
        const settled = vi.fn();
        const promise = delayOrThrow(100).then(settled);

        await vi.advanceTimersByTimeAsync(99);
        expect(settled).not.toHaveBeenCalled();
        await vi.advanceTimersByTimeAsync(1);

        await expect(promise).resolves.toBeUndefined();
        expect(settled).toHaveBeenCalledOnce();
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should reject with the original abort reason and clear the timer', async ({ expect }) => {
        const controller = new AbortController();
        const reason = new Error('Canceled');
        const promise = delayOrThrow(1000, controller.signal);
        const rejection = expect(promise).rejects.toBe(reason);

        controller.abort(reason);

        await rejection;
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should reject an already aborted signal without scheduling a timer', async ({ expect }) => {
        const reason = { code: 'Canceled' };

        await expect(delayOrThrow(1000, AbortSignal.abort(reason))).rejects.toBe(reason);
        expect(vi.getTimerCount()).toBe(0);
    });

    it('should remove the abort listener on normal completion', async ({ expect }) => {
        const controller = new AbortController();
        const remove = vi.spyOn(controller.signal, 'removeEventListener');
        const promise = delayOrThrow(100, controller.signal);

        await vi.advanceTimersByTimeAsync(100);

        await expect(promise).resolves.toBeUndefined();
        expect(remove).toHaveBeenCalledExactlyOnceWith('abort', expect.any(Function));
    });
});
