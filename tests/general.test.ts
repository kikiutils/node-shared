import {
    describe,
    it,
} from 'vitest';

import { extractFirstValue } from '../src/general';

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
