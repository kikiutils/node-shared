/**
 * Waits until a duration elapses or cancellation occurs without rejecting on cancellation.
 *
 * @remarks
 * An already aborted signal resolves immediately. Settling clears the timer and removes the abort listener.
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
export async function delay(ms: number, signal?: AbortSignal): Promise<void> {
    await delayOrThrow(ms, signal).catch(() => {
        // Cancellation is the only rejection, and this variant resolves on it by contract.
    });
}

/**
 * Waits until a duration elapses and rejects on cancellation.
 *
 * @remarks
 * Rejects with `signal.reason` when aborted, immediately for an already aborted signal. Settling clears the timer
 * and removes the abort listener.
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
export async function delayOrThrow(ms: number, signal?: AbortSignal): Promise<void> {
    return await new Promise((resolve, reject) => {
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
