import { hash } from 'node:crypto';

/**
 * An asynchronous Lua script runner with caller-declared results.
 *
 * @remarks
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
 * A caller-owned Redis client exposing raw command execution.
 *
 * @remarks
 * The client manages connections and command routing. `SCRIPT LOAD` and `EVALSHA` must target the same server
 * for script-cache recovery to succeed. Missing-script rejections must be `Error` instances whose messages
 * begin with the Redis error code `NOSCRIPT`, followed by whitespace or the end of the message.
 */
export interface RedisLikeScriptClient {
    send: (command: string, args: string[]) => Promise<unknown>;
}

/**
 * Creates a Lua script runner that reloads missing cached scripts before retrying execution.
 *
 * @remarks
 * Calls use `EVALSHA` with the SHA-1 digest of the source. A `NOSCRIPT` rejection loads the script with
 * `SCRIPT LOAD` before another execution attempt, provided the attempt limit has not been reached.
 * Concurrent cache misses on the same runner share an in-flight load; reuse the runner to share that load.
 * Load failures and errors other than `NOSCRIPT` propagate without retries. The final execution error is
 * preserved when the attempt limit is reached. Results are not cached. The runner never closes `client`.
 * `maxAttempts` counts `EVALSHA` attempts per invocation, including the initial one; `1` disables script loading
 * and retries.
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
