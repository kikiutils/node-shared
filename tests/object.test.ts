import {
    describe,
    it,
} from 'vitest';

import { stringifyObjectDeterministically } from '../src/object';

describe('stringifyObjectDeterministically', () => {
    describe('flattening and conversion', () => {
        it.for([
            {
                expected: 'active=true&count=0&missing=undefined&name=New York&value=null',
                input: {
                    active: true,
                    count: 0,
                    missing: undefined,
                    name: 'New York',
                    value: null,
                },
                name: 'primitive values',
            },
            {
                expected: 'a.x=1&a.y.0=3&a.y.1=4&b=2',
                input: {
                    a: {
                        x: 1,
                        y: [
                            3,
                            4,
                        ],
                    },
                    b: 2,
                },
                name: 'nested objects and arrays',
            },
            {
                expected: 'items.0.id=1&items.1.id=2',
                input: {
                    items: [
                        { id: 1 },
                        { id: 2 },
                    ],
                },
                name: 'objects in arrays',
            },
            {
                expected: 'matrix.0.0=1&matrix.1.0=2',
                input: {
                    matrix: [
                        [1],
                        [2],
                    ],
                },
                name: 'nested arrays',
            },
            {
                expected: '',
                input: {},
                name: 'an empty object',
            },
            {
                expected: 'value=1',
                input: {
                    array: [],
                    object: {},
                    value: 1,
                },
                name: 'empty nested containers',
            },
            {
                expected: 'infinity=Infinity&nan=NaN&negative=-Infinity',
                input: {
                    infinity: Infinity,
                    nan: Number.NaN,
                    negative: -Infinity,
                },
                name: 'non-finite numbers',
            },
        ])(
            'should flatten $name into deterministic key-value pairs',
            ({ expected, input }, { expect }) => expect(stringifyObjectDeterministically(input)).toBe(expected),
        );

        it('should stringify non-plain leaf objects and symbols', ({ expect }) => {
            const input = {
                regex: /test/g,
                symbol: Symbol.for('test'),
                value: {
                    [Symbol.toStringTag]: 'Value',
                    toString: () => 'leaf',
                },
            };

            expect(stringifyObjectDeterministically(input)).toBe('regex=/test/g&symbol=Symbol(test)&value=leaf');
        });
    });

    describe('ordering and separators', () => {
        it('should sort nested keys independently of insertion order without mutating the input', ({ expect }) => {
            /* eslint-disable perfectionist/sort-objects -- Reverse insertion order protects deterministic sorting. */
            const nested = Object.freeze({
                b: 2,
                a: 1,
            });

            const input = Object.freeze({
                z: nested,
                y: 3,
            });
            /* eslint-enable perfectionist/sort-objects */

            expect(stringifyObjectDeterministically(input)).toBe('y=3&z.a=1&z.b=2');
            expect(Object.keys(input)).toEqual([
                'z',
                'y',
            ]);

            expect(Object.keys(nested)).toEqual([
                'b',
                'a',
            ]);
        });

        it.for([
            {
                expected: 'a:1&b:2',
                keyValue: ':',
                pair: '&',
            },
            {
                expected: 'a=1|b=2',
                keyValue: '=',
                pair: '|',
            },
            {
                expected: 'a->1, b->2',
                keyValue: '->',
                pair: ', ',
            },
            {
                expected: 'a1b2',
                keyValue: '',
                pair: '',
            },
        ])(
            'should join pairs with key separator $keyValue and pair separator $pair',
            (
                {
                    expected,
                    keyValue,
                    pair,
                },
                { expect },
            ) => {
                expect(
                    stringifyObjectDeterministically(
                        {
                            a: 1,
                            b: 2,
                        },
                        keyValue,
                        pair,
                    ),
                ).toBe(expected);
            },
        );

        it('should preserve empty keys and separator characters without escaping them', ({ expect }) => {
            const input = {
                '': 'empty',
                'key&amps': 'a=b',
                'key.dots': 1,
            };

            expect(stringifyObjectDeterministically(input)).toBe('=empty&key&amps=a=b&key.dots=1');
        });
    });
});
