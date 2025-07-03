import {
    describe,
    it,
} from 'vitest';

import {
    getEnumNumberValues,
    getEnumStringValues,
} from '../src/enum';

enum MixedEnum {
    Receive = 0,
    Same = 'Same',
    Send = 1,
    Unknown = 'unknown',
}

describe.concurrent('getEnumNumberValues', () => {
    it('should extract numeric values from an enum', ({ expect }) => {
        const result = getEnumNumberValues(MixedEnum);
        expect(result).toEqual([
            0,
            1,
        ]);
    });

    it('should return an empty array if no numeric values are present', ({ expect }) => {
        enum EnumWithoutNumbers {
            One = 'one',
            Three = 'three',
            Two = 'two',
        }

        const result = getEnumNumberValues(EnumWithoutNumbers);
        expect(result).toEqual([]);
    });

    it('should extract numeric values from mixed object', ({ expect }) => {
        const Mixed = {
            A: 0,
            B: 'string',
            C: 1,
            D: 'anotherString',
        };

        const result = getEnumNumberValues(Mixed);
        expect(result).toEqual([
            0,
            1,
        ]);
    });

    it('should return empty array for empty object', ({ expect }) => expect(getEnumNumberValues({})).toEqual([]));
});

describe.concurrent('getEnumStringValues', () => {
    it('should extract string values from an enum', ({ expect }) => {
        const result = getEnumStringValues(MixedEnum);
        expect(result).toEqual([
            'Same',
            'unknown',
        ]);
    });

    it('should return an empty array if no string values are present', ({ expect }) => {
        enum EnumWithoutStrings {
            One = 1,
            Two = 2,
            Zero = 0,
        }

        const result = getEnumStringValues(EnumWithoutStrings);
        expect(result).toEqual([]);
    });

    it('should extract string values from mixed object', ({ expect }) => {
        const Mixed = {
            A: 0,
            B: 'string',
            C: 1,
            D: 'anotherString',
        };

        const result = getEnumStringValues(Mixed);
        expect(result).toEqual([
            'string',
            'anotherString',
        ]);
    });

    it('should return empty array for empty object', ({ expect }) => {
        const result = getEnumStringValues({});
        expect(result).toEqual([]);
    });
});
