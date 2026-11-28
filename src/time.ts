// Larger values overflow the 32-bit timer delay, which runtimes silently replace with 1 ms.
const maxDelayMilliseconds = 2 ** 31 - 1;

export async function delay(ms: number, signal?: AbortSignal): Promise<void> {
    try {
        await delayOrThrow(ms, signal);
    } catch (error) {
        if (!signal?.aborted || error !== signal.reason) throw error;
    }
}

export async function delayOrThrow(ms: number, signal?: AbortSignal): Promise<void> {
    // The negated comparison also rejects `NaN`.
    if (!(ms <= maxDelayMilliseconds)) throw new RangeError(`Delay must be a number of milliseconds up to ${maxDelayMilliseconds}, got ${ms}.`);
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
            // Runtimes warn on negative delays, which callers computing `deadline - Date.now()` routinely pass.
            Math.max(ms, 0),
        );

        signal?.addEventListener('abort', onAbort, { once: true });
    });
}
