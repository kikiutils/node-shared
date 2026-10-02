/**
 * Waits until a duration elapses or cancellation occurs without rejecting on cancellation.
 *
 * @remarks
 * The promise resolves without a value when the timer completes or the signal aborts.
 * An already aborted signal resolves immediately; completion removes the abort listener and clears the timer.
 *
 * @param ms - The delay duration in milliseconds, using native `setTimeout` timing rules.
 * @param signal - The signal that ends the wait early.
 *
 * @example
 *
 * ```ts
 * import { delay } from '@kikiutils/shared/time';
 *
 * const controller = new AbortController();
 * controller.abort();
 * await delay(5000, controller.signal);
 * ```
 */
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        if (signal?.aborted) {
            resolve();
            return;
        }

        const done = () => {
            // eslint-disable-next-line ts/no-use-before-define
            clearTimeout(timeout);
            signal?.removeEventListener('abort', done);
            resolve();
        };

        const timeout = setTimeout(done, ms);
        signal?.addEventListener('abort', done, { once: true });
    });
}

/**
 * Waits until a duration elapses and rejects on cancellation.
 *
 * @remarks
 * The promise resolves without a value when the timer completes and rejects with `signal.reason` if aborted.
 * An already aborted signal rejects immediately. Aborting clears the timer; timer completion removes the listener.
 *
 * @param ms - The delay duration in milliseconds, using native `setTimeout` timing rules.
 * @param signal - The signal that cancels the wait.
 *
 * @example
 *
 * ```ts
 * import { delayOrThrow } from '@kikiutils/shared/time';
 *
 * const controller = new AbortController();
 * controller.abort(new Error('Canceled'));
 * try {
 *     await delayOrThrow(5000, controller.signal);
 * } catch (error) {
 *     console.error(error);
 * }
 * ```
 */
export function delayOrThrow(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(signal.reason);
            return;
        }

        const onAbort = () => {
            // eslint-disable-next-line ts/no-use-before-define
            clearTimeout(timeout);
            reject(signal!.reason);
        };

        const timeout = setTimeout(
            () => {
                signal?.removeEventListener('abort', onAbort);
                resolve();
            },
            ms,
        );

        signal?.addEventListener('abort', onAbort, { once: true });
    });
}
