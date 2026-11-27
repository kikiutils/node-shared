import { Decimal } from 'decimal.js';

import type { PrecisionNumber } from './classes/precision-number';

type CalculableValue = bigint | Decimal.Value | PrecisionNumber;

export interface ToPercentageStringOptions {
    /**
     * @defaultValue 2
     */
    decimalPlaces?: number;

    /**
     * @defaultValue true
     */
    withSymbol?: boolean;
}

// Isolated from `Decimal.set` calls elsewhere, with enough precision that only the final rounding affects results.
const PercentageDecimal = Decimal.clone({
    defaults: true,
    precision: 100,
});

/**
 * Converts a numerator and denominator into a formatted percentage.
 *
 * @remarks
 * Values are read through their string form. A `NaN` or infinite quotient, such as a zero denominator, formats as
 * zero, and results that round to zero never carry a minus sign. Rounding is half up. Invalid decimal input and
 * formatting options propagate decimal.js exceptions.
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
    numerator: CalculableValue,
    denominator: CalculableValue,
    options?: ToPercentageStringOptions,
) {
    const decimalPlaces = options?.decimalPlaces ?? 2;
    // Scaling before dividing leaves the division as the only inexact step.
    const percentage = new PercentageDecimal(numerator.toString()).times(100).div(denominator.toString());
    const rounded = percentage.isFinite() ? percentage.toDecimalPlaces(decimalPlaces) : new PercentageDecimal(0);
    const result = (rounded.isZero() ? rounded.absoluteValue() : rounded).toFixed(decimalPlaces);

    return options?.withSymbol ?? true ? `${result}%` : result;
}
