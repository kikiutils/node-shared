import {
    describe,
    it,
} from 'vitest';

import {
    extractFirstValue,
    getErrorMessage,
} from '../src/general';

describe('extractFirstValue', () => {
    it('should select the first array element or scalar without copying it', ({ expect }) => {
        const value = { id: 1 };
        const fallback = { id: 2 };

        expect(
            extractFirstValue([
                value,
                fallback,
            ]),
        ).toBe(value);

        expect(extractFirstValue(value)).toBe(value);
        expect(extractFirstValue([value], fallback)).toBe(value);
        expect(extractFirstValue(value, fallback)).toBe(value);
    });

    it.for([
        {
            input: [],
            name: 'an empty array',
        },
        {
            input: null,
            name: 'null',
        },
        {
            input: undefined,
            name: 'undefined',
        },
        {
            input: [null],
            name: 'a null first element',
        },
        {
            input: [undefined],
            name: 'an undefined first element',
        },
    ])(
        'should use the fallback for $name',
        ({ input }, { expect }) => {
            const fallback = { id: 1 };

            expect(extractFirstValue(input)).toBeUndefined();
            expect(extractFirstValue(input, fallback)).toBe(fallback);
        },
    );

    it.for([
        0,
        false,
        '',
    ])(
        'should preserve the non-nullish value %j',
        (value, { expect }) => {
            expect(extractFirstValue(value, 'fallback')).toBe(value);
            expect(extractFirstValue([value], 'fallback')).toBe(value);
        },
    );
});

describe('getErrorMessage', () => {
    it('should return the message of errors and their subclasses', ({ expect }) => {
        expect(getErrorMessage(new Error('Failed'))).toBe('Failed');
        expect(getErrorMessage(new TypeError('Bad type'))).toBe('Bad type');
    });

    it.for([
        {
            expected: 'timeout',
            input: 'timeout',
        },
        {
            expected: '42',
            input: 42,
        },
        {
            expected: 'undefined',
            input: undefined,
        },
        {
            expected: '[object Object]',
            input: { message: 'not an error' },
        },
    ])(
        'should stringify non-error value $input',
        (
            {
                expected,
                input,
            },
            { expect },
        ) => {
            expect(getErrorMessage(input)).toBe(expected);
        },
    );
});
