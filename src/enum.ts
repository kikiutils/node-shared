/**
 * Extracts the numeric values from an enumeration-like object.
 *
 * @param {Record<number | string, number | string>} data - The enumeration-like object to extract numeric values from.
 * The keys can be numbers or strings, and the values can be numbers or strings.
 * @returns {number[]} An array of numeric values extracted from the object.
 *
 * @example
 * ```typescript
 * import { getEnumNumberValues } from '@kikiutils/shared/enum';
 *
 * enum RecordType {
 *   Receive = 0,
 *   Send = 1,
 *   Unknown = 'unknown'
 * }
 *
 * console.log(getEnumNumberValues(RecordType)); // [0, 1]
 * ```
 */
export function getEnumNumberValues(data: Record<number | string, number | string>) {
    return Object.values(data).filter((value) => typeof value === 'number');
}

/**
 * Extracts the string values from an enumeration-like object.
 *
 * @param {Record<number | string, number | string>} data - The enumeration-like object to extract string values from.
 * The keys can be numbers or strings, and the values can be numbers or strings.
 * @returns {string[]} An array of string values extracted from the object.
 *
 * @example
 * ```typescript
 * import { getEnumStringValues } from '@kikiutils/shared/enum';
 *
 * enum RecordType {
 *   Receive = 0,
 *   Send = 1,
 *   Unknown = 'unknown'
 * }
 *
 * console.log(getEnumStringValues(RecordType)); // ['unknown']
 * ```
 */
export function getEnumStringValues(data: Record<number | string, number | string>) {
    const keys: string[] = [];
    const keysCount: Record<string, number> = {};
    const values: any[] = [];
    Object.entries(data).forEach(([key, value]) => {
        keys.push(key);
        values.push(value);
        if (typeof value !== 'string') return;
        keysCount[key] = (keysCount[key] ?? 0) + 1;
        keysCount[value] = (keysCount[value] ?? 0) + 1;
    });

    return values.filter((value) => {
        return typeof value === 'string' && (!keys.includes(value) || (keysCount[value] && keysCount[value] > 1));
    });
}
