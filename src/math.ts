import Decimal from 'decimal.js';

type CalculableValue = Decimal.Value | { toString: () => string };

/**
 * Options for configuring the output of `toPercentageString`.
 */
export interface ToPercentageStringOptions {
    /**
     * Number of decimal places to include in the result.
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
 * Converts a fraction (numerator / denominator) into a percentage string.
 *
 * - Uses `decimal.js` for precise decimal calculations.
 * - Supports custom decimal places and optional percentage symbol.
 * - Returns `'0.00%'` if result is `NaN` or division is invalid.
 *
 * @param {CalculableValue} molecular - The numerator of the fraction.
 * @param {CalculableValue} denominator - The denominator of the fraction.
 * @param {ToPercentageStringOptions} [options] - Optional output settings.
 * @returns {string} Formatted percentage string.
 *
 * @example
 * ```typescript
 * import { toPercentageString } from '@kikiutils/node/math';
 *
 * console.log(toPercentageString(50, 200)); // 25.00%
 * console.log(toPercentageString(50, 200, { withSymbol: false })); // 25.00
 * console.log(toPercentageString(50, 200, { decimalPlaces: 1 })); // 25.0%
 * ```
 */
export function toPercentageString(
    molecular: CalculableValue,
    denominator: CalculableValue,
    options?: ToPercentageStringOptions,
) {
    const molecularDecimal = new Decimal(molecular.toString());
    const denominatorDecimal = new Decimal(denominator.toString());
    const calculationResult = molecularDecimal.div(denominatorDecimal);
    const result = calculationResult.isNaN()
        ? '0.00'
        : calculationResult.times(100).toFixed(options?.decimalPlaces ?? 2);

    return options?.withSymbol ?? true ? `${result}%` : result;
}
