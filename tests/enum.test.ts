import {
    describe,
    it,
} from 'vitest';

import {
    getEnumNumberValues,
    getEnumStringValues,
    getEnumValues,
} from '../src/enum';

enum MixedEnum {
    Receive = 0,
    Same = 'Same',
    Send = 1,
    Unknown = 'unknown',
}

enum NumericEnum {
    Zero,
    One,
}

enum StringEnum {
    Same = 'Same',
    Unknown = 'unknown',
}

describe('getEnumNumberValues', () => {
    it.for([
        {
            expected: [
                0,
                1,
            ],
            input: MixedEnum,
            name: 'a mixed enum',
        },
        {
            expected: [
                0,
                1,
            ],
            input: NumericEnum,
            name: 'a numeric enum',
        },
        {
            expected: [],
            input: StringEnum,
            name: 'a string enum',
        },
        {
            expected: [
                0,
                1,
            ],
            input: {
                A: 0,
                B: 'text',
                C: 1,
            },
            name: 'an enum-like object',
        },
        {
            expected: [],
            input: {},
            name: 'an empty object',
        },
    ])(
        'should select values from $name without numeric reverse mappings',
        ({ expected, input }, { expect }) => expect(getEnumNumberValues(input)).toEqual(expected),
    );
});

describe('getEnumStringValues', () => {
    it.for([
        {
            expected: [
                'Same',
                'unknown',
            ],
            input: MixedEnum,
            name: 'a mixed enum',
        },
        {
            expected: [
                'Same',
                'unknown',
            ],
            input: StringEnum,
            name: 'a string enum',
        },
        {
            expected: [],
            input: NumericEnum,
            name: 'a numeric enum',
        },
        {
            expected: ['text'],
            input: {
                A: 0,
                B: 'text',
                C: 1,
            },
            name: 'an enum-like object',
        },
        {
            expected: [],
            input: {},
            name: 'an empty object',
        },
    ])(
        'should select values from $name without numeric reverse mappings',
        ({ expected, input }, { expect }) => expect(getEnumStringValues(input)).toEqual(expected),
    );
});

describe('getEnumValues', () => {
    it.for([
        {
            expected: [
                0,
                'Same',
                1,
                'unknown',
            ],
            input: MixedEnum,
            name: 'a mixed enum',
        },
        {
            expected: [
                0,
                1,
            ],
            input: NumericEnum,
            name: 'a numeric enum',
        },
        {
            expected: [
                'Same',
                'unknown',
            ],
            input: StringEnum,
            name: 'a string enum',
        },
        {
            expected: [
                0,
                'text',
                1,
            ],
            input: {
                A: 0,
                B: 'text',
                C: 1,
            },
            name: 'an enum-like object',
        },
        {
            expected: [],
            input: {},
            name: 'an empty object',
        },
    ])(
        'should select values from $name without numeric reverse mappings',
        ({ expected, input }, { expect }) => expect(getEnumValues(input)).toEqual(expected),
    );
});
