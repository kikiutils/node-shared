import {
    describe,
    expectTypeOf,
    it,
    vi,
} from 'vitest';

import { createRedisScriptRunner } from '../../src/redis/script-runner';

const source = 'return 1';
const digest = 'e0e1f9fabfc9d4800c877a703b823ac0578ff8db';

// Emulates a server script cache: `EVALSHA` raises NOSCRIPT until `SCRIPT LOAD` completes.
function createCachingClient() {
    let loaded = false;
    let loadError: Error | undefined;
    const send = vi.fn(async (command: string) => {
        if (command === 'SCRIPT') {
            await Promise.resolve();
            if (loadError) throw loadError;
            loaded = true;
            return digest;
        }

        if (!loaded) throw new Error('NOSCRIPT No matching script');
        return 1;
    });

    return {
        count: (command: string) => send.mock.calls.filter(([name]) => name === command).length,
        flush: () => loaded = false,
        send,
        setLoadError: (error?: Error) => loadError = error,
    };
}

describe('createRedisScriptRunner', () => {
    it('should encode keys and arguments without caching results', async ({ expect }) => {
        const keys = [
            'session:1',
            'session:2',
        ];

        const args = [
            42,
            'value',
            -1,
        ];

        const firstResult = { count: 1 };
        const secondResult = { count: 2 };
        const send = vi.fn().mockResolvedValueOnce(firstResult).mockResolvedValueOnce(secondResult);
        const execute = createRedisScriptRunner<{ count: number }>({ send }, source);

        const result = await execute(keys, args);

        expectTypeOf(result).toEqualTypeOf<{ count: number }>();
        expect(result).toBe(firstResult);
        await expect(execute(keys, args)).resolves.toBe(secondResult);
        expect(send).toHaveBeenNthCalledWith(
            1,
            'EVALSHA',
            [
                digest,
                '2',
                'session:1',
                'session:2',
                '42',
                'value',
                '-1',
            ],
        );
    });

    it('should load a missing script before retrying with zero keys and arguments', async ({ expect }) => {
        const send = vi.fn()
            .mockRejectedValueOnce(new Error('NOSCRIPT No matching script'))
            .mockResolvedValueOnce(digest)
            .mockResolvedValueOnce(1);

        const execute = createRedisScriptRunner<number>({ send }, source);

        await expect(execute([], [])).resolves.toBe(1);
        expect(send.mock.calls).toEqual([
            [
                'EVALSHA',
                [
                    digest,
                    '0',
                ],
            ],
            [
                'SCRIPT',
                [
                    'LOAD',
                    source,
                ],
            ],
            [
                'EVALSHA',
                [
                    digest,
                    '0',
                ],
            ],
        ]);
    });

    it('should share an in-flight load and reload after a later cache miss', async ({ expect }) => {
        const client = createCachingClient();
        const execute = createRedisScriptRunner<number>(client, source);

        await expect(
            Promise.all([
                execute([], []),
                execute([], []),
            ]),
        ).resolves.toEqual([
            1,
            1,
        ]);

        expect(client.count('SCRIPT')).toBe(1);

        client.flush();

        await expect(execute([], [])).resolves.toBe(1);
        expect(client.count('SCRIPT')).toBe(2);
    });

    it('should reject all callers on load failure and allow a later load', async ({ expect }) => {
        const loadError = new Error('SCRIPT LOAD failed');
        const client = createCachingClient();
        client.setLoadError(loadError);
        const execute = createRedisScriptRunner<number>(client, source);

        const results = await Promise.allSettled([
            execute([], []),
            execute([], []),
        ]);

        expect(results).toEqual([
            {
                reason: loadError,
                status: 'rejected',
            },
            {
                reason: loadError,
                status: 'rejected',
            },
        ]);

        expect(client.count('SCRIPT')).toBe(1);
        expect(client.count('EVALSHA')).toBe(2);

        // The failed load must not stay cached as the in-flight promise.
        client.setLoadError();

        await expect(execute([], [])).resolves.toBe(1);
        expect(client.count('SCRIPT')).toBe(2);
    });

    it.for([
        undefined,
        1,
        5,
    ])(
        'should stop at the total attempt limit %s and preserve the final error',
        async (maxAttempts, { expect }) => {
            const limit = maxAttempts ?? 3;
            const errors = Array.from({ length: limit }, (_, index) => new Error(`NOSCRIPT attempt ${index + 1}`));
            let attempts = 0;
            const send = vi.fn(async (command: string) => {
                if (command === 'SCRIPT') return digest;
                throw errors[attempts++]!;
            });

            const execute = createRedisScriptRunner({ send }, source, maxAttempts);

            await expect(execute([], [])).rejects.toBe(errors[limit - 1]);
            expect(send.mock.calls.map(([command]) => command)).toEqual([
                ...Array
                    .from(
                        { length: limit - 1 },
                        () => [
                            'EVALSHA',
                            'SCRIPT',
                        ],
                    )
                    .flat(),
                'EVALSHA',
            ]);
        },
    );

    it.for([
        new Error('Redis unavailable'),
        new Error('ERR Lua failure mentioning NOSCRIPT'),
        new Error('NOSCRIPTED is not a missing-script error'),
        'NOSCRIPT No matching script',
    ])(
        'should preserve unrelated or unsupported rejections without retrying: %s',
        async (error, { expect }) => {
            const send = vi.fn().mockRejectedValue(error);
            const execute = createRedisScriptRunner({ send }, source);

            await expect(execute([], [])).rejects.toBe(error);
            expect(send).toHaveBeenCalledExactlyOnceWith(
                'EVALSHA',
                [
                    digest,
                    '0',
                ],
            );
        },
    );

    it.for([
        0,
        1.5,
        Number.NaN,
        Number.MAX_SAFE_INTEGER + 1,
    ])(
        'should reject invalid attempt limit %s before sending commands',
        (maxAttempts, { expect }) => {
            const send = vi.fn();

            expect(() => createRedisScriptRunner({ send }, source, maxAttempts)).toThrow(RangeError);
            expect(send).not.toHaveBeenCalled();
        },
    );
});
