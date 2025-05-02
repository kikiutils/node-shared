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

describe('getEnumNumberValues', () => {
    it('should extract numeric values from an enum', () => {
        expect(getEnumNumberValues(MixedEnum)).toEqual([
            0,
            1,
        ]);
    });

    it('should return an empty array if no numeric values are present', () => {
        enum EnumWithoutNumbers {
            One = 'one',
            Three = 'three',
            Two = 'two',
        }

        expect(getEnumNumberValues(EnumWithoutNumbers)).toEqual([]);
    });

    it('should extract numeric values from mixed object', () => {
        const Mixed = {
            A: 0,
            B: 'string',
            C: 1,
            D: 'anotherString',
        };

        expect(getEnumNumberValues(Mixed)).toEqual([
            0,
            1,
        ]);
    });

    it('should return empty array for empty object', () => expect(getEnumNumberValues({})).toEqual([]));
});

describe('getEnumStringValues', () => {
    it('should extract string values from an enum', () => {
        expect(getEnumStringValues(MixedEnum)).toEqual([
            'Same',
            'unknown',
        ]);
    });

    it('should return an empty array if no string values are present', () => {
        enum EnumWithoutStrings {
            One = 1,
            Two = 2,
            Zero = 0,
        }

        expect(getEnumStringValues(EnumWithoutStrings)).toEqual([]);
    });

    it('should extract string values from mixed object', () => {
        const Mixed = {
            A: 0,
            B: 'string',
            C: 1,
            D: 'anotherString',
        };

        expect(getEnumStringValues(Mixed)).toEqual([
            'string',
            'anotherString',
        ]);
    });

    it('should return empty array for empty object', () => expect(getEnumStringValues({})).toEqual([]));
});
