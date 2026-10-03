import {
    afterEach,
    beforeEach,
    describe,
    it,
    vi,
} from 'vitest';

import { EventAwaiter } from '../src/event-awaiter';

let awaiter: EventAwaiter<string>;

beforeEach(() => {
    vi.useFakeTimers();
    awaiter = new EventAwaiter<string>();
});

afterEach(() => {
    awaiter.triggerAll();
    vi.clearAllTimers();
    vi.useRealTimers();
});

describe('class EventAwaiter', () => {
    describe('trigger', () => {
        it('should deliver a value to all current waiters for only the matching key', async ({ expect }) => {
            const first = awaiter.wait('key');
            const second = awaiter.wait('key');
            const otherSettled = vi.fn();
            const other = awaiter.wait('other').then(otherSettled);

            awaiter.trigger('key', 'value');

            await expect(
                Promise.all([
                    first,
                    second,
                ]),
            ).resolves.toEqual([
                'value',
                'value',
            ]);

            expect(otherSettled).not.toHaveBeenCalled();
            awaiter.trigger('other', 'separate');
            await other;
            expect(otherSettled).toHaveBeenCalledExactlyOnceWith('separate');
        });

        it('should resolve with undefined when explicitly triggered without a result', async ({ expect }) => {
            const promise = awaiter.wait('key');

            awaiter.trigger('key', undefined);

            await expect(promise).resolves.toBeUndefined();
        });

        it('should discard unmatched triggers and allow the key to be reused', async ({ expect }) => {
            awaiter.trigger('key', 'stale');
            const settled = vi.fn();
            const first = awaiter.wait('key').then(settled);
            await Promise.resolve();
            expect(settled).not.toHaveBeenCalled();

            awaiter.trigger('key', 'first');
            await first;
            expect(settled).toHaveBeenCalledExactlyOnceWith('first');
            const next = awaiter.waitExclusive('key');
            awaiter.trigger('key', 'next');
            await expect(next).resolves.toBe('next');
        });
    });

    describe('triggerAll', () => {
        it.for([
            undefined,
            'shutdown',
        ])(
            'should resolve every pending key with %s and clear registrations',
            async (value, { expect }) => {
                const first = awaiter.wait('first');
                const second = awaiter.wait('second');

                awaiter.triggerAll(value);
                awaiter.triggerAll('stale');

                await expect(
                    Promise.all([
                        first,
                        second,
                    ]),
                ).resolves.toEqual([
                    value,
                    value,
                ]);

                const next = awaiter.waitExclusive('first');
                awaiter.trigger('first', 'next');
                await expect(next).resolves.toBe('next');
            },
        );
    });

    describe('wait', () => {
        it.for([
            0,
            100,
        ])(
            'should expire only the timed waiter after %s milliseconds',
            async (timeout, { expect }) => {
                const timedSettled = vi.fn();
                const timed = awaiter.wait('key', timeout).then(timedSettled);
                const survivor = awaiter.wait('key');
                if (timeout > 0) {
                    await vi.advanceTimersByTimeAsync(timeout - 1);
                    expect(timedSettled).not.toHaveBeenCalled();
                }

                await vi.advanceTimersByTimeAsync(timeout > 0 ? 1 : 0);

                await expect(timed).resolves.toBeUndefined();
                expect(timedSettled).toHaveBeenCalledExactlyOnceWith(undefined);
                awaiter.trigger('key', 'survivor');
                await expect(survivor).resolves.toBe('survivor');
            },
        );

        it('should cancel only the waiter associated with an aborted signal', async ({ expect }) => {
            const controller = new AbortController();
            const canceled = awaiter.wait('key', undefined, undefined, controller.signal);
            const survivor = awaiter.wait('key');

            controller.abort();

            await expect(canceled).resolves.toBeUndefined();
            awaiter.trigger('key', 'survivor');
            await expect(survivor).resolves.toBe('survivor');
        });

        it('should release an expired exclusive registration for the next waiter', async ({ expect }) => {
            const expired = awaiter.waitExclusive('key', 100);

            await vi.advanceTimersByTimeAsync(100);

            await expect(expired).resolves.toBeUndefined();
            const next = awaiter.waitExclusive('key');
            awaiter.trigger('key', 'next');
            await expect(next).resolves.toBe('next');
        });

        it('should not cancel a replacement waiter when an earlier timeout fires', async ({ expect }) => {
            const replaced = awaiter.wait('key', 100);
            const latest = awaiter.waitLatest('key');

            await expect(replaced).resolves.toBeUndefined();
            await vi.advanceTimersByTimeAsync(100);
            awaiter.trigger('key', 'latest');

            await expect(latest).resolves.toBe('latest');
        });

        it('should not cancel a later registration when an earlier signal aborts', async ({ expect }) => {
            const controller = new AbortController();
            const first = awaiter.wait('key', undefined, undefined, controller.signal);
            awaiter.trigger('key', 'first');
            await expect(first).resolves.toBe('first');
            const next = awaiter.waitExclusive('key');

            controller.abort();
            awaiter.trigger('key', 'next');

            await expect(next).resolves.toBe('next');
        });

        it('should reject a strict duplicate without disturbing the original waiter', async ({ expect }) => {
            const original = awaiter.wait('key');

            await expect(awaiter.wait('key', undefined, 'strict'))
                .rejects
                .toThrow('Duplicate wait detected for key: key');

            awaiter.trigger('key', 'original');

            await expect(original).resolves.toBe('original');
        });

        it('should resolve all replaced waiters with undefined in override mode', async ({ expect }) => {
            const first = awaiter.wait('key');
            const second = awaiter.wait('key');
            const latest = awaiter.wait('key', undefined, 'override');

            await expect(
                Promise.all([
                    first,
                    second,
                ]),
            ).resolves.toEqual([
                undefined,
                undefined,
            ]);

            awaiter.trigger('key', 'latest');

            await expect(latest).resolves.toBe('latest');
        });
    });

    describe('waitExclusive', () => {
        it('should reject duplicate registrations and forward cancellation', async ({ expect }) => {
            const controller = new AbortController();
            const original = awaiter.waitExclusive('key', undefined, controller.signal);

            await expect(awaiter.waitExclusive('key')).rejects.toThrow('Duplicate wait detected for key: key');
            controller.abort();
            await expect(original).resolves.toBeUndefined();
        });
    });

    describe('waitLatest', () => {
        it('should replace the previous waiter and forward the timeout', async ({ expect }) => {
            const first = awaiter.waitLatest('key');
            const latest = awaiter.waitLatest('key', 100);

            await expect(first).resolves.toBeUndefined();
            await vi.advanceTimersByTimeAsync(100);

            await expect(latest).resolves.toBeUndefined();
        });
    });
});
