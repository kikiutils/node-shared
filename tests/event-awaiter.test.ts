import {
    describe,
    it,
    vi,
} from 'vitest';

import { EventAwaiter } from '../src/event-awaiter';

describe.concurrent('EventAwaiter', () => {
    describe.concurrent('trigger', () => {
        it('should resolve waiting promises with the provided value', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise = eventAwaiter.wait('key');

            eventAwaiter.trigger('key', 'value');

            await expect(promise).resolves.toBe('value');
        });

        it('should resolve with undefined when no value provided', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise = eventAwaiter.wait('key');

            eventAwaiter.trigger('key');

            await expect(promise).resolves.toBeUndefined();
        });

        it('should do nothing if no promises are waiting for the key', ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();

            expect(() => eventAwaiter.trigger('nonexistent', 'value')).not.toThrow();
        });

        it('should resolve multiple waiting promises with the same value', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise1 = eventAwaiter.wait('key');
            const promise2 = eventAwaiter.wait('key');

            eventAwaiter.trigger('key', 'shared');

            await expect(promise1).resolves.toBe('shared');
            await expect(promise2).resolves.toBe('shared');
        });
    });

    describe.concurrent('triggerAll', () => {
        it('should resolve all pending promises with undefined', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise1 = eventAwaiter.wait('key1');
            const promise2 = eventAwaiter.wait('key2');

            eventAwaiter.triggerAll();

            await expect(promise1).resolves.toBeUndefined();
            await expect(promise2).resolves.toBeUndefined();
        });

        it('should resolve all pending promises with custom value', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise1 = eventAwaiter.wait('key1');
            const promise2 = eventAwaiter.wait('key2');

            eventAwaiter.triggerAll('shutdown');

            await expect(promise1).resolves.toBe('shutdown');
            await expect(promise2).resolves.toBe('shutdown');
        });

        it('should clear all resolvers after triggerAll', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise1 = eventAwaiter.wait('key1');

            eventAwaiter.triggerAll();

            // Second triggerAll should do nothing
            expect(() => eventAwaiter.triggerAll()).not.toThrow();

            await expect(promise1).resolves.toBeUndefined();
        });
    });

    describe.concurrent('wait', () => {
        it('should resolve when trigger is called', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise = eventAwaiter.wait('key');

            eventAwaiter.trigger('key', 'result');

            await expect(promise).resolves.toBe('result');
        });

        it('should resolve with undefined on timeout', async ({ expect }) => {
            vi.useFakeTimers();
            const eventAwaiter = new EventAwaiter<string>();
            const promise = eventAwaiter.wait('key', 100);

            vi.advanceTimersByTime(100);

            await expect(promise).resolves.toBeUndefined();
            vi.useRealTimers();
        });

        it('should resolve with undefined on AbortSignal abort', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const controller = new AbortController();
            const promise = eventAwaiter.wait('key', undefined, undefined, controller.signal);

            controller.abort();

            await expect(promise).resolves.toBeUndefined();
        });

        it('should handle timeout of 0', async ({ expect }) => {
            vi.useFakeTimers();
            const eventAwaiter = new EventAwaiter<string>();
            const promise = eventAwaiter.wait('key', 0);

            vi.advanceTimersByTime(0);

            await expect(promise).resolves.toBeUndefined();
            vi.useRealTimers();
        });

        it('should allow multiple waiters for same key by default', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise1 = eventAwaiter.wait('key');
            const promise2 = eventAwaiter.wait('key');

            eventAwaiter.trigger('key', 'both');

            await expect(promise1).resolves.toBe('both');
            await expect(promise2).resolves.toBe('both');
        });

        it('should reject in strict mode if waiter already exists', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            eventAwaiter.wait('key');

            await expect(eventAwaiter.wait('key', undefined, 'strict')).rejects.toThrow('Duplicate wait detected for key: key');
        });

        it('should cancel existing waiters in override mode', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise1 = eventAwaiter.wait('key');
            const promise2 = eventAwaiter.wait('key', undefined, 'override');

            await expect(promise1).resolves.toBeUndefined();
            eventAwaiter.trigger('key', 'second');

            await expect(promise2).resolves.toBe('second');
        });
    });

    describe.concurrent('waitExclusive', () => {
        it('should reject if called twice with same key', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            eventAwaiter.waitExclusive('key');

            await expect(eventAwaiter.waitExclusive('key')).rejects.toThrow('Duplicate wait detected for key: key');
        });

        it('should resolve with trigger', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise = eventAwaiter.waitExclusive('key');

            eventAwaiter.trigger('key', 'exclusive');

            await expect(promise).resolves.toBe('exclusive');
        });
    });

    describe.concurrent('waitLatest', () => {
        it('should cancel previous waiter when called again', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise1 = eventAwaiter.waitLatest('key');
            const promise2 = eventAwaiter.waitLatest('key');

            eventAwaiter.trigger('key', 'latest');

            await expect(promise1).resolves.toBeUndefined();
            await expect(promise2).resolves.toBe('latest');
        });

        it('should resolve with trigger', async ({ expect }) => {
            const eventAwaiter = new EventAwaiter<string>();
            const promise = eventAwaiter.waitLatest('key');

            eventAwaiter.trigger('key', 'newest');

            await expect(promise).resolves.toBe('newest');
        });
    });
});
