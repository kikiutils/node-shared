/**
 * Serializes a nested object into a deterministic, flat string format.
 *
 * This function recursively traverses the input object (including nested objects and arrays),
 * flattens it into key paths using dot notation (e.g. "a.b.0.c"), sorts all keys,
 * and joins each key-value pair into a string with customizable separators.
 *
 * It is designed for use cases such as signature generation, cache key construction,
 * or any context requiring consistent and predictable object serialization.
 *
 * @param {Record<string, any>} input - The object to serialize. Can contain nested objects and arrays
 * @param {string} kvSeparator - The string used to separate each key from its value (default: '=')
 * @param {string} pairSeparator - The string used to separate each key-value pair (default: '&')
 * @returns {string} A deterministic string representation of the input object
 *
 * @example
 * ```typescript
 * import { stringifyObjectDeterministically } from '@kikiutils/shared/object';
 *
 * console.log(stringifyObjectDeterministically({ b: 2, a: { x: 1, y: [3, 4] } })); // a.x=1&a.y.0=3&a.y.1=4&b=2
 * console.log(stringifyObjectDeterministically({ foo: 'bar' }, ':', '|')); // foo:bar
 * ```
 */
export function stringifyObjectDeterministically(
    input: Record<string, any>,
    kvSeparator: string = '=',
    pairSeparator: string = '&',
) {
    const entries: string[] = [];

    function walk(object: any, path: string[] = []) {
        if (Array.isArray(object)) {
            object.forEach((value, i) => {
                walk(
                    value,
                    [
                        ...path,
                        i.toString(),
                    ],
                );
            });
        } else if (
            object !== null
            && typeof object === 'object'
            && Object.prototype.toString.call(object) === '[object Object]'
        ) {
            Object.keys(object).sort().forEach((key) => {
                walk(
                    object[key],
                    [
                        ...path,
                        key,
                    ],
                );
            });
        } else entries.push(`${path.join('.')}${kvSeparator}${String(object)}`);
    }

    walk(input);
    return entries.sort().join(pairSeparator);
}
