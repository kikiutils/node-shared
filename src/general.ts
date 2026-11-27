/**
 * Returns the first array element or the input value, with a nullish fallback.
 *
 * @remarks
 * An empty array, `null`, or `undefined` selects the fallback; omission of a fallback yields `undefined`.
 * The input and selected values are not copied or changed.
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
export function extractFirstValue<T>(value: readonly T[] | T): T | undefined;
export function extractFirstValue<T, D>(value: readonly T[] | T, defaultValue: D): D | NonNullable<T>;
export function extractFirstValue<T, D>(value: readonly T[] | T, defaultValue?: D) {
    return (Array.isArray(value) ? value[0] : value) ?? defaultValue;
}

/**
 * Returns a readable message for a caught value.
 *
 * @remarks
 * `Error` instances, including subclasses, yield their `message`; any other value is converted with `String`.
 *
 * @example
 *
 * ```ts
 * import { getErrorMessage } from '@kikiutils/shared/general';
 *
 * console.log(getErrorMessage(new Error('Failed'))); // => 'Failed'
 * console.log(getErrorMessage('timeout')); // => 'timeout'
 * console.log(getErrorMessage(undefined)); // => 'undefined'
 * ```
 */
export function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}
