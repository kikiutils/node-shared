import Decimal from 'decimal.js';
import { millify } from 'millify';

type CalculableValue = Decimal.Value | { toString(): string };

export interface CalculateToPercentageStringOptions {
	decimalPlaces?: number;
	withSymbol?: boolean;
}

export const calculateToPercentageString = (molecular: CalculableValue, denominator: CalculableValue, options?: CalculateToPercentageStringOptions) => {
	const molecularDecimal = new Decimal(molecular.toString());
	const denominatorDecimal = new Decimal(denominator.toString());
	const calculationResult = molecularDecimal.div(denominatorDecimal);
	const result = calculationResult.isNaN() ? '0.00' : calculationResult.times(100).toFixed(options?.decimalPlaces || 2);
	return options?.withSymbol ?? true ? `${result}%` : result;
};

export const prettyNumberToString = (value: number, options?: Parameters<typeof millify>[1]) => millify(value, { lowercase: true, precision: 2, ...options });
