/* eslint-disable jsdoc/check-param-names */

/**
 * Returns the first array element or the input value, with a nullish fallback.
 *
 * @remarks
 * An empty array, `null`, or `undefined` selects the fallback; omission of a fallback yields `undefined`.
 * The input and selected values are not copied or changed.
 *
 * @typeParam T - The input value or array element type.
 * @typeParam D - The fallback type when the fallback overload is used.
 *
 * @param value - A single value or an array of values.
 * @param defaultValue - The fallback returned when the selected value is nullish.
 *
 * @returns The selected non-nullish value, or the fallback without copying either value.
 *
 * @example
 *
 * ```ts
 * import { extractFirstValue } from '@kikiutils/shared/general';
 *
 * console.log(extractFirstValue([
 *     1,
 *     2,
 *     3,
 * ])); // => 1
 *
 * console.log(extractFirstValue('hello')); // => 'hello'
 * console.log(extractFirstValue([], 'default')); // => 'default'
 * console.log(extractFirstValue(undefined, 'fallback')); // => 'fallback'
 * ```
 */
export function extractFirstValue<T>(value: T | T[]): T | undefined;
export function extractFirstValue<T, D>(value: T | T[], defaultValue: D): D | NonNullable<T>;
export function extractFirstValue<T, D>(value: T | T[], defaultValue?: D) {
    return (Array.isArray(value) ? value[0] : value) ?? defaultValue;
}

/* eslint-enable jsdoc/check-param-names */
