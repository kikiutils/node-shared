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
     * @param {T} [value] - Optional value to resolve the awaiting promises with
     */
    trigger(key: string, value?: T) {
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
     * Multiple consumers can wait on the same key; all of them will be notified when triggered.
     *
     * @param {string} [key] - Identifier for the awaited event
     * @param {number} [timeoutMs] - Optional timeout (in milliseconds).
     * If reached, the promise resolves with `undefined`
     *
     * @returns {Promise<T | undefined>} A promise that resolves with the triggered value
     * or `undefined` if timeout occurs
     */
    wait(key: string, timeoutMs?: number) {
        return new Promise<T | undefined>((resolve) => {
            const resolvers = this.#promiseResolvers.get(key) || [];
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
}
