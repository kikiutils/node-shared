/**
 * Delays execution until the specified duration elapses or the signal is aborted.
 *
 * Aborting the signal resolves the promise normally without throwing.
 *
 * @param {number} ms - Delay duration in milliseconds
 * @param {AbortSignal} [signal] - Optional signal used to end the delay early
 *
 * @returns {Promise<void>} Resolves when the delay completes or the signal is aborted
 *
 * @example
 * ```typescript
 * import { delay } from '@kikiutils/shared/time';
 *
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 1000);
 * await delay(5000, controller.signal); // resolves after ~1s
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
 * Delays execution until the specified duration elapses or the signal is aborted.
 *
 * Aborting the signal rejects the promise with the signal's abort reason.
 *
 * @param {number} ms - Delay duration in milliseconds
 * @param {AbortSignal} [signal] - Optional signal used to abort the delay
 *
 * @returns {Promise<void>} Resolves when the delay completes or rejects when the signal is aborted
 *
 * @example
 * ```typescript
 * import { delayOrThrow } from '@kikiutils/shared/time';
 *
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 1000);
 * await delayOrThrow(5000, controller.signal); // rejects after ~1s
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
