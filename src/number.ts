import { millify } from 'millify';

/**
 * Converts a large number to a more readable string format using millify.
 *
 * @param {number} value - The number to be converted.
 * @param {Parameters<typeof millify>[1]} [options] - Optional configuration for millify.
 * @returns {string} The formatted string.
 *
 * @example
 * ```typescript
 * import { toCompactNumberString } from '@kikiutils/node/number';
 *
 * const prettyNumber = toCompactNumberString(1234567);
 * console.log(prettyNumber); // Output: '1.23m'
 *
 * // With custom options
 * const prettyNumberWithOptions = toCompactNumberString(1234567, { precision: 3 });
 * console.log(prettyNumberWithOptions); // Output: '1.235m'
 * ```
 */
export function toCompactNumberString(value: number, options?: Parameters<typeof millify>[1]) {
    return millify(
        value,
        {
            lowercase: true,
            precision: 2,
            ...options,
        },
    );
}
