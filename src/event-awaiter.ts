/**
 * An asynchronous keyed event rendezvous for one or more waiting consumers.
 *
 * @remarks
 * Triggers resolve the currently registered waiters; values are not retained for future waits.
 * Timeouts and subsequent abort events resolve affected waiters with `undefined`.
 * Use `triggerAll` to resolve pending waits during cleanup. Timers and abort listeners are not proactively
 * removed by triggers, so they may remain until their timeout or abort event occurs.
 *
 * @typeParam T - The value delivered to waiting consumers.
 */
export class EventAwaiter<T> {
    // Private instance properties
    #promiseResolvers = new Map<string, ((value: PromiseLike<T | undefined> | T | undefined) => void)[]>();

    // Public instance methods

    /**
     * Resolves all currently pending waits for a key with the supplied value.
     *
     * @param key - The event identifier; a key without pending waits has no effect.
     * @param value - The delivered value; `undefined` indicates no result.
     */
    trigger(key: string, value: T | undefined) {
        const resolvers = this.#promiseResolvers.get(key);
        if (resolvers) {
            this.#promiseResolvers.delete(key);
            resolvers?.forEach((resolve) => resolve(value));
        }
    }

    /**
     * Resolves all currently pending waits and clears their registrations.
     *
     * @param value - The delivered value; omission resolves all pending waits with `undefined`.
     */
    triggerAll(value: T | undefined = undefined) {
        for (const [_, resolvers] of this.#promiseResolvers.entries()) resolvers.forEach((resolve) => resolve(value));
        this.#promiseResolvers.clear();
    }

    /**
     * Waits for a trigger associated with a key.
     *
     * @remarks
     * By default, multiple waiters share a key and all receive the next trigger value.
     * `strict` mode rejects duplicate waits; `override` mode resolves existing waits with `undefined` before
     * registering the new wait. Timeout and abort remove only the affected waiter's registration.
     * An already aborted signal is not checked; only an abort event emitted after registration ends the wait.
     * Without a timeout or subsequent abort, the wait remains pending until a trigger arrives.
     *
     * @param key - The event identifier to wait for.
     * @param timeoutMs - The optional timeout in milliseconds, using native `setTimeout` timing rules.
     * @param mode - The policy for existing waiters; omission allows multiple waiters.
     * @param signal - A signal whose subsequent abort event ends this wait.
     *
     * @returns A promise resolving to the triggered value, or `undefined` after timeout, abort, or replacement.
     *
     * @throws Error through promise rejection if `strict` mode encounters an existing waiter.
     */
    wait(key: string, timeoutMs?: number, mode?: 'override' | 'strict', signal?: AbortSignal) {
        return new Promise<T | undefined>((resolve) => {
            const resolvers = this.#promiseResolvers.get(key) || [];
            if (resolvers.length) {
                switch (mode) {
                    case 'override':
                        resolvers.forEach((r) => r(undefined));
                        resolvers.length = 0;
                        break;
                    case 'strict':
                        throw new Error(`Duplicate wait detected for key: ${key}`);
                }
            }

            resolvers.push(resolve);
            this.#promiseResolvers.set(key, resolvers);
            if (timeoutMs != null) {
                setTimeout(
                    () => {
                        const resolvers = this.#promiseResolvers.get(key);
                        if (resolvers?.includes(resolve)) {
                            resolve(undefined);
                            const newResolvers = resolvers.filter((r) => r !== resolve);
                            if (newResolvers.length) this.#promiseResolvers.set(key, newResolvers);
                            else this.#promiseResolvers.delete(key);
                        }
                    },
                    timeoutMs,
                );
            }

            if (signal) {
                signal.addEventListener(
                    'abort',
                    () => {
                        const resolvers = this.#promiseResolvers.get(key);
                        if (resolvers?.includes(resolve)) {
                            resolve(undefined);
                            const newResolvers = resolvers.filter((r) => r !== resolve);
                            if (newResolvers.length) this.#promiseResolvers.set(key, newResolvers);
                            else this.#promiseResolvers.delete(key);
                        }
                    },
                    { once: true },
                );
            }
        });
    }

    /**
     * Waits for a key while rejecting duplicate registrations.
     *
     * @param key - The event identifier to wait for.
     * @param timeoutMs - The optional timeout in milliseconds.
     * @param signal - A signal whose subsequent abort event ends this wait; an already aborted signal is not checked.
     *
     * @returns A promise resolving to the triggered value, or `undefined` on timeout or subsequent abort.
     *
     * @throws Error through promise rejection if the key already has a pending waiter.
     *
     * @see {@link EventAwaiter.wait}
     */
    waitExclusive(key: string, timeoutMs?: number, signal?: AbortSignal) {
        return this.wait(key, timeoutMs, 'strict', signal);
    }

    /**
     * Replaces existing waiters for a key and waits for its next trigger.
     *
     * @remarks
     * Existing waiters resolve with `undefined` before the new waiter is registered.
     *
     * @param key - The event identifier to wait for.
     * @param timeoutMs - The optional timeout in milliseconds.
     * @param signal - A signal whose subsequent abort event ends this wait; an already aborted signal is not checked.
     *
     * @returns A promise resolving to the triggered value, or `undefined` on timeout, subsequent abort, or replacement.
     *
     * @see {@link EventAwaiter.wait}
     */
    waitLatest(key: string, timeoutMs?: number, signal?: AbortSignal) {
        return this.wait(key, timeoutMs, 'override', signal);
    }
}
