import { getEnumNumberValues, getEnumStringValues } from '../src/enum';

describe('enum value extraction functions', () => {
    enum RecordType {
        Receive = 0,
        Same = 'Same',
        Send = 1,
        Unknown = 'unknown',
    }

    it('should extract numeric values from the enumeration', () => {
        const result = getEnumNumberValues(RecordType);
        expect(result).toEqual([0, 1]);
    });

    it('should extract string values from the enumeration', () => {
        const result = getEnumStringValues(RecordType);
        expect(result).toEqual(['Same', 'unknown']);
    });

    it('should return an empty array if no numeric values are present', () => {
        const EnumWithoutNumbers = {
            One: 'one',
            Three: 'three',
            Two: 'two',
        };

        const result = getEnumNumberValues(EnumWithoutNumbers);
        expect(result).toEqual([]);
    });

    it('should return an empty array if no string values are present', () => {
        const EnumWithoutStrings = {
            One: 1,
            Two: 2,
            Zero: 0,
        };

        const result = getEnumStringValues(EnumWithoutStrings);
        expect(result).toEqual([]);
    });

    it('should handle mixed type values in the enumeration', () => {
        const MixedEnum = {
            A: 0,
            B: 'string',
            C: 1,
            D: 'anotherString',
        };

        const numericResult = getEnumNumberValues(MixedEnum);
        const stringResult = getEnumStringValues(MixedEnum);
        expect(numericResult).toEqual([0, 1]);
        expect(stringResult).toEqual(['string', 'anotherString']);
    });

    it('should handle empty enumeration objects', () => {
        const result = getEnumNumberValues({});
        expect(result).toEqual([]);
        const stringResult = getEnumStringValues({});
        expect(stringResult).toEqual([]);
    });
});
