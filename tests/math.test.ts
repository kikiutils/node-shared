import { Decimal } from 'decimal.js';
import {
    describe,
    it,
} from 'vitest';

import { PrecisionNumber } from '../src/classes/precision-number';
import { toPercentageString } from '../src/math';

describe('toPercentageString', () => {
    it.for([
        {
            denominator: 2,
            name: 'numbers',
            numerator: 0.5,
        },
        {
            denominator: '120',
            name: 'strings',
            numerator: '30',
        },
        {
            denominator: new Decimal(300),
            name: 'Decimal instances',
            numerator: new Decimal(75),
        },
        {
            denominator: new PrecisionNumber(160),
            name: 'PrecisionNumber instances',
            numerator: new PrecisionNumber(40),
        },
        {
            denominator: 8n,
            name: 'bigints',
            numerator: 2n,
        },
    ])(
        'should format $name with the default precision and symbol',
        ({ denominator, numerator }, { expect }) => {
            expect(toPercentageString(numerator, denominator)).toBe('25.00%');
        },
    );

    it('should apply custom precision and omit the symbol when requested', ({ expect }) => {
        expect(
            toPercentageString(
                1,
                3,
                {
                    decimalPlaces: 1,
                    withSymbol: false,
                },
            ),
        ).toBe('33.3');

        expect(toPercentageString(1, 3, { decimalPlaces: 0 })).toBe('33%');
    });

    it.for([
        {
            denominator: 0,
            name: 'NaN',
            numerator: 0,
        },
        {
            denominator: 0,
            name: 'infinity',
            numerator: 1,
        },
    ])(
        'should format the $name fallback as zero with the configured precision',
        ({ denominator, numerator }, { expect }) => {
            expect(toPercentageString(numerator, denominator)).toBe('0.00%');
            expect(
                toPercentageString(
                    numerator,
                    denominator,
                    {
                        decimalPlaces: 4,
                        withSymbol: false,
                    },
                ),
            ).toBe('0.0000');
        },
    );

    it('should round negative percentages and drop the sign when they round to zero', ({ expect }) => {
        expect(toPercentageString(-1, 3)).toBe('-33.33%');
        expect(toPercentageString('-0.00001', 1)).toBe('0.00%');
    });

    it('should ignore the global Decimal rounding configuration', ({ expect }) => {
        const rounding = Decimal.rounding;
        Decimal.set({ rounding: Decimal.ROUND_DOWN });
        try {
            expect(toPercentageString(2, 3)).toBe('66.67%');
        } finally {
            Decimal.set({ rounding });
        }
    });

    it('should accept the maximum decimal places', ({ expect }) => {
        expect(toPercentageString(1, 3, { decimalPlaces: 20 })).toBe(`33.${'3'.repeat(20)}%`);
    });

    it.for([
        -1,
        0.5,
        21,
        1e9,
        Number.NaN,
        Number.POSITIVE_INFINITY,
    ])(
        'should reject decimalPlaces %s',
        (decimalPlaces, { expect }) => {
            expect(() => toPercentageString(1, 3, { decimalPlaces })).toThrow(RangeError);
        },
    );

    it('should reject invalid decimal input as a TypeError instead of returning the non-finite fallback', ({ expect }) => {
        expect(() => toPercentageString('not-a-number', 1)).toThrow(TypeError);
        expect(() => toPercentageString(1, 'not-a-number')).toThrow(TypeError);
        // @ts-expect-error Untyped callers can pass configuration strings.
        expect(() => toPercentageString(1, 3, { decimalPlaces: '2' })).toThrow(TypeError);
    });
});
