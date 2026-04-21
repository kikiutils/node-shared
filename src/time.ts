/**
 * Creates a delay that can be aborted via AbortSignal.
 *
 * @param {number} ms - Delay duration in milliseconds
 * @param {AbortSignal} [signal] - Optional AbortSignal to cancel the delay
 *
 * @returns {Promise<undefined>} A promise that resolves after ms or resolves immediately on abort
 *
 * @example
 * ```typescript
 * import { abortableDelay } from '@kikiutils/shared/time';
 *
 * const controller = new AbortController();
 * setTimeout(() => controller.abort(), 1000);
 * await abortableDelay(5000, controller.signal); // resolves after ~1s when aborted
 * ```
 */
export function abortableDelay(ms: number, signal?: AbortSignal) {
    return new Promise((resolve) => {
        const timeout = setTimeout(resolve, ms);
        if (signal) {
            signal.addEventListener(
                'abort',
                () => {
                    clearTimeout(timeout);
                    resolve(undefined);
                },
            );
        }
    });
}
