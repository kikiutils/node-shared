import { Decimal } from 'decimal.js';

import type { PrecisionNumber } from './classes/precision-number';

type CalculableValue = bigint | Decimal.Value | PrecisionNumber;

export interface ToPercentageStringOptions {
    /** Defaults to `2`. */
    decimalPlaces?: number;

    /** Defaults to `true`. */
    withSymbol?: boolean;
}

// Precision counts integer digits too, so it must exceed the decimal places by any realistic integer part.
const maxPercentageDecimalPlaces = 20;

// Isolated from `Decimal.set` calls elsewhere, with enough precision that only the final rounding affects results.
const PercentageDecimal = Decimal.clone({
    defaults: true,
    precision: 100,
});

/**
 * Values are read through their string form. A `NaN` or infinite quotient, such as a zero denominator, formats as
 * zero, and results that round to zero never carry a minus sign. Rounding is half up.
 *
 * @throws TypeError if a value is not a valid decimal or `options.decimalPlaces` is not a number.
 * @throws RangeError if `options.decimalPlaces` is not an integer from 0 to 20.
 */
export function toPercentageString(
    numerator: CalculableValue,
    denominator: CalculableValue,
    options?: ToPercentageStringOptions,
) {
    const decimalPlaces = options?.decimalPlaces ?? 2;
    if (typeof decimalPlaces !== 'number') throw new TypeError(`decimalPlaces must be a number, got ${typeof decimalPlaces}.`);
    if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0 || decimalPlaces > maxPercentageDecimalPlaces) {
        throw new RangeError(`decimalPlaces must be an integer from 0 to ${maxPercentageDecimalPlaces}, got ${decimalPlaces}.`);
    }

    let percentage: Decimal;
    try {
        // Scaling before dividing leaves the division as the only inexact step.
        percentage = new PercentageDecimal(numerator.toString()).times(100).div(denominator.toString());
    } catch (error) {
        throw new TypeError('Invalid decimal value', { cause: error });
    }

    const rounded = percentage.isFinite() ? percentage.toDecimalPlaces(decimalPlaces) : new PercentageDecimal(0);
    const result = (rounded.isZero() ? rounded.absoluteValue() : rounded).toFixed(decimalPlaces);

    return options?.withSymbol ?? true ? `${result}%` : result;
}
