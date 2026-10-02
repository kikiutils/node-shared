import { millify } from 'millify';

/**
 * Converts a large number into a compact, human-readable string using `millify`.
 *
 * @remarks
 * Uses lowercase units, for example `k` and `m`, and a precision of `2` unless overridden.
 *
 * @param value - The number to format.
 * @param options - Optional configuration passed to `millify`.
 *
 * @returns The compact number string.
 *
 * @example
 *
 * ```ts
 * import { toCompactNumberString } from '@kikiutils/shared/number';
 *
 * console.log(toCompactNumberString(1234567)); // => 1.23m
 * console.log(toCompactNumberString(1234567, { precision: 3 })); // => 1.235m
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
