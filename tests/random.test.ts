import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { generateWithNestedRandomLength } from '../src/random';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('generateWithNestedRandomLength', () => {
    it.for([
        {
            expected: 15,
            inner: 0,
            name: 'lower endpoints',
            outer: 0,
        },
        {
            expected: 40,
            inner: 1 - Number.EPSILON,
            name: 'upper endpoints',
            outer: 1 - Number.EPSILON,
        },
        {
            expected: 20,
            inner: 1 - Number.EPSILON,
            name: 'sampled minimum above maxMin',
            outer: 0,
        },
    ])(
        'should sample inclusive nested bounds for $name',
        (
            {
                expected,
                inner,
                outer,
            },
            { expect },
        ) => {
            vi.spyOn(Math, 'random').mockReturnValueOnce(inner).mockReturnValueOnce(outer);
            const value = { size: expected };
            const generator = vi.fn(() => value);

            const result = generateWithNestedRandomLength(generator, 10, 20, 15, 40);

            expect(generator).toHaveBeenCalledExactlyOnceWith(expected);
            expect(result).toBe(value);
        },
    );

    it('should pass equal bounds to the generator and return its promise unchanged', async ({ expect }) => {
        const value = Promise.resolve('value');
        const generator = vi.fn(() => value);

        const result = generateWithNestedRandomLength(generator, 10, 10, 10, 10);

        expect(generator).toHaveBeenCalledExactlyOnceWith(10);
        expect(result).toBe(value);
        await expect(result).resolves.toBe('value');
    });

    it.for([
        {
            bounds: [
                20,
                10,
                30,
                40,
            ],
            name: 'inverted inner bounds',
        },
        {
            bounds: [
                10,
                20,
                40,
                30,
            ],
            name: 'inverted outer bounds',
        },
    ] as const)(
        'should reject $name without calling the generator',
        ({ bounds }, { expect }) => {
            const generator = vi.fn();

            const generate = () => generateWithNestedRandomLength(
                generator,
                bounds[0],
                bounds[1],
                bounds[2],
                bounds[3],
            );

            expect(generate).toThrow('Invalid range');
            expect(generator).not.toHaveBeenCalled();
        },
    );

    it('should propagate a synchronous generator error unchanged', ({ expect }) => {
        const error = new Error('Generator failed');

        expect(
            () => generateWithNestedRandomLength(
                () => {
                    throw error;
                },
                1,
                1,
                1,
                1,
            ),
        ).toThrow(error);
    });
});
