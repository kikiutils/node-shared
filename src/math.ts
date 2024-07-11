import Decimal from 'decimal.js';

type CalculableValue = Decimal.Value | { toString(): string };

/**
 * Options for configuring the output of the `calculateToPercentageString` function.
 */
export interface CalculateToPercentageStringOptions {
	/**
	 * The number of decimal places to include in the result.
	 * @default 2
	 */
	decimalPlaces?: number;

	/**
	 * Whether to include the '%' symbol in the result.
	 * @default true
	 */
	withSymbol?: boolean;
}

/**
 * Converts a fraction to a percentage string with optional configuration.
 *
 * @param {CalculableValue} molecular - The numerator of the fraction.
 * @param {CalculableValue} denominator - The denominator of the fraction.
 * @param {CalculateToPercentageStringOptions} [options] - Optional configuration for the result.
 * @returns {string} The percentage string.
 *
 * @example
 * ```typescript
 * import { calculateToPercentageString } from '@kikiutils/node/math';
 *
 * // With symbol
 * const percentWithSymbol = calculateToPercentageString(50, 200);
 * console.log(percentWithSymbol); // Output: '25.00%'
 *
 * // Without symbol
 * const percentWithoutSymbol = calculateToPercentageString(50, 200, { withSymbol: false });
 * console.log(percentWithoutSymbol); // Output: '25.00'
 *
 * // With custom decimal places
 * const percentCustomDecimal = calculateToPercentageString(50, 200, { decimalPlaces: 1 });
 * console.log(percentCustomDecimal); // Output: '25.0%'
 * ```
 */
export const calculateToPercentageString = (molecular: CalculableValue, denominator: CalculableValue, options?: CalculateToPercentageStringOptions) => {
	const molecularDecimal = new Decimal(molecular.toString());
	const denominatorDecimal = new Decimal(denominator.toString());
	const calculationResult = molecularDecimal.div(denominatorDecimal);
	const result = calculationResult.isNaN() ? '0.00' : calculationResult.times(100).toFixed(options?.decimalPlaces || 2);
	return options?.withSymbol ?? true ? `${result}%` : result;
};
