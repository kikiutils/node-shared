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
    Negative = -1,
    One = 1,
    Zero = 0,
}

enum StringEnum {
    Same = 'Same',
    Unknown = 'unknown',
}

describe('enum value helpers', () => {
    it.for([
        {
            all: [
                0,
                'Same',
                1,
                'unknown',
            ],
            input: MixedEnum,
            name: 'a mixed enum',
            numbers: [
                0,
                1,
            ],
            strings: [
                'Same',
                'unknown',
            ],
        },
        {
            all: [
                -1,
                1,
                0,
            ],
            input: NumericEnum,
            name: 'a numeric enum',
            numbers: [
                -1,
                1,
                0,
            ],
            strings: [],
        },
        {
            all: [
                'Same',
                'unknown',
            ],
            input: StringEnum,
            name: 'a string enum',
            numbers: [],
            strings: [
                'Same',
                'unknown',
            ],
        },
        {
            all: [
                'not-found',
                200,
            ],
            input: {
                404: 'not-found',
                Ok: 200,
            },
            name: 'an object with a numeric key that is not a reverse mapping',
            numbers: [200],
            strings: ['not-found'],
        },
        {
            all: [],
            input: {},
            name: 'an empty object',
            numbers: [],
            strings: [],
        },
    ])(
        'should select values from $name without numeric reverse mappings',
        (
            {
                all,
                input,
                numbers,
                strings,
            },
            { expect },
        ) => {
            expect(getEnumValues(input)).toEqual(all);
            expect(getEnumNumberValues(input)).toEqual(numbers);
            expect(getEnumStringValues(input)).toEqual(strings);
        },
    );
});
