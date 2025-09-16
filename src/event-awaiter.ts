/**
 * EventAwaiter provides a mechanism to wait for events (by key) asynchronously.
 *
 * This class allows multiple consumers to `wait` for a specific key
 * and be resolved when `trigger` is called for that key, or automatically
 * resolved with `undefined` if a timeout occurs.
 *
 * Typical use cases include long-polling, request coordination,
 * or implementing event-driven primitives in applications or services.
 *
 * @template T - The type of value that will be resolved when the event is triggered
 */
export class EventAwaiter<T> {
    #promiseResolvers = new Map<string, ((value: PromiseLike<T | undefined> | T | undefined) => void)[]>();

    /**
     * Triggers all pending promises waiting for the given key.
     * Each promise will be resolved with the provided value.
     *
     * @param {string} [key] - Identifier for the awaited event
     * @param {T | undefined} value - The value to resolve the awaiting promises with.
     * May be `undefined` to indicate no result or a timeout-like behavior.
     */
    trigger(key: string, value: T | undefined) {
        const resolvers = this.#promiseResolvers.get(key);
        if (resolvers) {
            this.#promiseResolvers.delete(key);
            resolvers?.forEach((resolve) => resolve(value));
        }
    }

    /**
     * Waits for an event associated with the given key.
     *
     * The returned promise will resolve when:
     *  - `trigger(key)` is called, in which case it resolves with the provided value.
     *  - The optional timeout is reached, in which case it resolves with `undefined`.
     *
     * Behavior when multiple waiters exist for the same key:
     *  - Default (no mode): multiple waiters are allowed, all will be resolved when triggered.
     *  - `strict` mode: throws an error if a waiter already exists for the given key.
     *  - `override` mode: cancels all existing waiters (resolving them with `undefined`)
     *    and only keeps the latest one.
     *
     * @param {string} key - Identifier for the awaited event
     * @param {number} [timeoutMs] - Optional timeout (in milliseconds).
     * If reached, the promise resolves with `undefined`.
     * @param {'override' | 'strict'} [mode] - Optional behavior mode for handling multiple waiters.
     *
     * @returns {Promise<T | undefined>} A promise that resolves with the triggered value
     * or `undefined` if timeout occurs
     */
    wait(key: string, timeoutMs?: number, mode?: 'override' | 'strict') {
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
            if (timeoutMs) {
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
        });
    }

    /**
     * Waits for an event in strict mode.
     * Only one waiter is allowed per key. If another waiter already exists,
     * this method will throw an error.
     *
     * @param {string} key - Identifier for the awaited event
     * @param {number} [timeoutMs] - Optional timeout (in milliseconds).
     * If reached, the promise resolves with `undefined`.
     */
    waitExclusive(key: string, timeoutMs?: number) {
        return this.wait(key, timeoutMs, 'strict');
    }

    /**
     * Waits for an event in override mode.
     * If another waiter already exists for the given key, it will be canceled
     * (resolved with `undefined`) and replaced by the new waiter.
     *
     * @param {string} key - Identifier for the awaited event
     * @param {number} [timeoutMs] - Optional timeout (in milliseconds).
     * If reached, the promise resolves with `undefined`.
     */
    waitLatest(key: string, timeoutMs?: number) {
        return this.wait(key, timeoutMs, 'override');
    }
}
