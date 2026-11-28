import { hash } from 'node:crypto';

/** @typeParam T - The expected Lua result type, without runtime validation. */
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

/** `maxAttempts` counts `EVALSHA` attempts per invocation, including the first, so `1` disables `SCRIPT LOAD`. */
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
