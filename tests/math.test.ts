import { Decimal } from 'decimal.js';
import {
    describe,
    it,
} from 'vitest';

import { toPercentageString } from '../src/math';

describe.concurrent('toPercentageString', () => {
    it('should return percentage with 2 decimal places and symbol by default', ({ expect }) => {
        const result = toPercentageString(50, 200);
        expect(result).toBe('25.00%');
    });

    it('should return percentage without symbol when withSymbol is set to false', ({ expect }) => {
        const result = toPercentageString(50, 200, { withSymbol: false });
        expect(result).toBe('25.00');
    });

    it('should return percentage with custom decimal places', ({ expect }) => {
        const result = toPercentageString(50, 200, { decimalPlaces: 1 });
        expect(result).toBe('25.0%');
    });

    it('should handle Decimal.js values correctly', ({ expect }) => {
        const molecular = new Decimal(75);
        const denominator = new Decimal(300);

        const result = toPercentageString(molecular, denominator);
        expect(result).toBe('25.00%');
    });

    it('should handle objects with toString method correctly', ({ expect }) => {
        const molecular = { toString: () => '40' };
        const denominator = { toString: () => '160' };

        const result = toPercentageString(molecular, denominator);
        expect(result).toBe('25.00%');
    });

    it('should return 0.00% if division result is NaN', ({ expect }) => {
        const result = toPercentageString(0, 0);
        expect(result).toBe('0.00%');
    });

    it('should handle string inputs correctly', ({ expect }) => {
        const result = toPercentageString('30', '120');
        expect(result).toBe('25.00%');
    });

    it('should handle large numbers correctly', ({ expect }) => {
        const result = toPercentageString(5000000, 20000000);
        expect(result).toBe('25.00%');
    });

    it('should handle decimal numbers correctly', ({ expect }) => {
        const result = toPercentageString(0.5, 2);
        expect(result).toBe('25.00%');
    });
});
