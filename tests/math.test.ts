import { Decimal } from 'decimal.js';
import {
    describe,
    it,
} from 'vitest';

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
            denominator: { toString: () => '160' },
            name: 'stringifiable objects',
            numerator: { toString: () => '40' },
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
        'should ignore custom precision for the $name fallback',
        ({ denominator, numerator }, { expect }) => {
            expect(toPercentageString(numerator, denominator, { decimalPlaces: 4 })).toBe('0.00%');
            expect(
                toPercentageString(
                    numerator,
                    denominator,
                    {
                        decimalPlaces: 4,
                        withSymbol: false,
                    },
                ),
            ).toBe('0.00');
        },
    );

    it('should propagate invalid decimal input instead of returning the non-finite fallback', ({ expect }) => {
        expect(() => toPercentageString('not-a-number', 1)).toThrow();
    });
});
