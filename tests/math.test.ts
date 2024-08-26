import Decimal from 'decimal.js';

import { calculateToPercentageString } from '../src/math';

describe('calculateToPercentageString', () => {
	it('should return percentage with 2 decimal places and symbol by default', () => {
		const result = calculateToPercentageString(50, 200);
		expect(result).toBe('25.00%');
	});

	it('should return percentage without symbol when withSymbol is set to false', () => {
		const result = calculateToPercentageString(50, 200, { withSymbol: false });
		expect(result).toBe('25.00');
	});

	it('should return percentage with custom decimal places', () => {
		const result = calculateToPercentageString(50, 200, { decimalPlaces: 1 });
		expect(result).toBe('25.0%');
	});

	it('should handle Decimal.js values correctly', () => {
		const molecular = new Decimal(75);
		const denominator = new Decimal(300);
		const result = calculateToPercentageString(molecular, denominator);
		expect(result).toBe('25.00%');
	});

	it('should handle objects with toString method correctly', () => {
		const molecular = { toString: () => '40' };
		const denominator = { toString: () => '160' };
		const result = calculateToPercentageString(molecular, denominator);
		expect(result).toBe('25.00%');
	});

	it('should return 0.00% if division result is NaN', () => {
		const result = calculateToPercentageString(0, 0);
		expect(result).toBe('0.00%');
	});

	it('should handle string inputs correctly', () => {
		const result = calculateToPercentageString('30', '120');
		expect(result).toBe('25.00%');
	});

	it('should handle large numbers correctly', () => {
		const result = calculateToPercentageString(5000000, 20000000);
		expect(result).toBe('25.00%');
	});

	it('should handle decimal numbers correctly', () => {
		const result = calculateToPercentageString(0.5, 2);
		expect(result).toBe('25.00%');
	});
});
