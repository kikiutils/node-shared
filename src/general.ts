/* eslint-disable jsdoc/check-param-names */

/**
 * Extracts the first value from an array or returns the value itself if it's not an array.
 *
 * - If `value` is an array, returns the first element.
 * - If `value` is not an array, returns `value` directly.
 * - If the result is `null` or `undefined`, and `defaultValue` is provided, returns `defaultValue` instead.
 *
 * @template T - The type of the input value(s)
 * @template D - The type of the default value (if provided)
 *
 * @param {T | T[]} value - A single value or an array of values
 * @param {D} [defaultValue] - A fallback value if the result is `null` or `undefined`
 *
 * @returns {T | D | undefined} The first value or the fallback
 *
 * @example
 * ```typescript
 * import { extractFirstValue } from '@kikiutils/shared/general';
 *
 * console.log(extractFirstValue([1, 2, 3])); // 1
 * console.log(extractFirstValue('hello'));  // hello
 * console.log(extractFirstValue([], 'default')); // default
 * console.log(extractFirstValue(undefined, 'fallback')); // fallback
 * ```
 */
export function extractFirstValue<T>(value: T | T[]): T | undefined;
export function extractFirstValue<T, D>(value: T | T[], defaultValue: D): D | NonNullable<T>;
export function extractFirstValue<T, D>(value: T | T[], defaultValue?: D) {
    return (Array.isArray(value) ? value[0] : value) ?? defaultValue;
}

/* eslint-enable jsdoc/check-param-names */
