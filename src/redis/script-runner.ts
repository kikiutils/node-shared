import { hash } from 'node:crypto';

/**
 * Numeric arguments are converted to strings before execution.
 *
 * @typeParam T - The expected Lua result type, without runtime validation.
 *
 * @param keys - The script's Redis keys, in `KEYS` order.
 * @param args - The script's arguments, in `ARGV` order.
 */
export type RedisScriptRunner<T = unknown> = (keys: readonly string[], args: ReadonlyArray<number | string>) => Promise<
    T
>;

/**
 * The client manages connections and command routing. `SCRIPT LOAD` and `EVALSHA` must target the same server
 * for script-cache recovery to succeed. Missing-script rejections must be `Error` instances whose messages
 * begin with the Redis error code `NOSCRIPT`, followed by whitespace or the end of the message.
 */
export interface RedisLikeScriptClient {
    send: (command: string, args: string[]) => Promise<unknown>;
}

/**
 * Calls use `EVALSHA` with the SHA-1 digest of the source; a `NOSCRIPT` rejection runs `SCRIPT LOAD` and retries.
 * `maxAttempts` counts `EVALSHA` attempts per invocation, including the initial one, so `1` disables loading; once it
 * is reached, the last `NOSCRIPT` error propagates. Load failures and other errors propagate without retries.
 * Concurrent cache misses on the same runner share one in-flight load. The runner never closes `client`.
 *
 * @throws RangeError if `maxAttempts` is not a positive safe integer.
 */
export function createRedisScriptRunner<T = unknown>(
    client: RedisLikeScriptClient,
    source: string,
    maxAttempts: number = 3,
): RedisScriptRunner<T> {
    if (!Number.isSafeInteger(maxAttempts) || maxAttempts < 1) {
        throw new RangeError('maxAttempts must be a positive safe integer');
    }

    const digest = hash('sha1', source);
    let loadingPromise: Promise<unknown> | undefined;

    return async (keys, args) => {
        for (let attempt = 1; ; attempt += 1) {
            try {
                return await client.send(
                    'EVALSHA',
                    [
                        digest,
                        String(keys.length),
                        ...keys,
                        ...args.map(String),
                    ],
                ) as T;
            } catch (error) {
                if (
                    !(error instanceof Error)
                    || !/^NOSCRIPT(?:\s|$)/.test(error.message)
                    || attempt >= maxAttempts
                ) throw error;

                if (loadingPromise === undefined) {
                    loadingPromise = client
                        .send(
                            'SCRIPT',
                            [
                                'LOAD',
                                source,
                            ],
                        )
                        .finally(() => loadingPromise = undefined);
                }

                await loadingPromise;
            }
        }
    };
}
