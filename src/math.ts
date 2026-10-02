import { Decimal } from 'decimal.js';

type CalculableValue = Decimal.Value | { toString: () => string };

/**
 * Options for configuring the output of `toPercentageString`.
 */
export interface ToPercentageStringOptions {
    /**
     * The number of decimal places to include in the result.
     *
     * @defaultValue 2
     */
    decimalPlaces?: number;

    /**
     * Whether to include the `%` symbol in the result.
     *
     * @defaultValue true
     */
    withSymbol?: boolean;
}

/**
 * Converts a numerator and denominator into a formatted percentage.
 *
 * @remarks
 * A `NaN` or infinite quotient produces `0.00`, regardless of the configured decimal places;
 * the percent symbol is appended according to `options.withSymbol`.
 * Invalid decimal input and formatting options propagate decimal.js exceptions.
 *
 * @param molecular - The numerator of the fraction.
 * @param denominator - The denominator of the fraction.
 * @param options - Output precision and percent-symbol settings.
 *
 * @returns The formatted percentage string.
 *
 * @example
 *
 * ```ts
 * import { toPercentageString } from '@kikiutils/shared/math';
 *
 * console.log(toPercentageString(50, 200)); // => '25.00%'
 * console.log(toPercentageString(50, 200, { withSymbol: false })); // => '25.00'
 * console.log(toPercentageString(50, 200, { decimalPlaces: 1 })); // => '25.0%'
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

    const result = calculationResult.isNaN() || !calculationResult.isFinite()
        ? '0.00'
        : calculationResult.times(100).toFixed(options?.decimalPlaces ?? 2);

    return options?.withSymbol ?? true ? `${result}%` : result;
}
