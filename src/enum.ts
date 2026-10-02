/**
 * Extracts only the numeric values from an enumeration-like object.
 *
 * @typeParam T - The type of the enum object.
 *
 * @param enumObject - The enumeration-like object to extract numeric values from,
 * the object can contain numeric values, string values, or both.
 *
 * @returns An array of numeric values extracted from the enum object.
 *
 * @example
 *
 * ```ts
 * import { getEnumNumberValues } from '@kikiutils/shared/enum';
 *
 * enum RecordType {
 *     Receive = 0,
 *     Send = 1,
 *     Unknown = 'unknown',
 * }
 *
 * console.log(getEnumNumberValues(RecordType)); // => [0, 1]
 * ```
 */
export function getEnumNumberValues<T extends Record<string, any>>(enumObject: T): Extract<T[keyof T], number>[] {
    return getEnumValues(enumObject).filter((value) => typeof value === 'number');
}

/**
 * Extracts only the string values from an enumeration-like object.
 *
 * @typeParam T - The type of the enum object.
 *
 * @param enumObject - The enumeration-like object to extract string values from,
 * the object can contain numeric values, string values, or both.
 *
 * @returns An array of string values extracted from the enum object.
 *
 * @example
 *
 * ```ts
 * import { getEnumStringValues } from '@kikiutils/shared/enum';
 *
 * enum RecordType {
 *     Receive = 0,
 *     Send = 1,
 *     Unknown = 'unknown',
 * }
 *
 * console.log(getEnumStringValues(RecordType)); // => ['unknown']
 * ```
 */
export function getEnumStringValues<T extends Record<string, any>>(enumObject: T): Extract<T[keyof T], string>[] {
    return getEnumValues(enumObject).filter((value) => typeof value === 'string');
}

/**
 * Extracts all values from an enumeration-like object.
 *
 * @remarks
 * This function handles TypeScript enums correctly by accounting for the reverse mapping
 * that occurs with numeric enums. It works with pure numeric enums, pure string enums,
 * and mixed enums.
 *
 * @typeParam T - The type of the enum object.
 *
 * @param enumObject - The enumeration-like object to extract values from,
 * the object can contain numeric values, string values, or both.
 *
 * @returns An array containing all the values from the enum object.
 *
 * @example
 *
 * ```ts
 * import { getEnumValues } from '@kikiutils/shared/enum';
 *
 * // Numeric enum
 * enum Status {
 *     Active = 0,
 *     Inactive = 1,
 *     Pending = 2,
 * }
 *
 * console.log(getEnumValues(Status)); // => [0, 1, 2]
 *
 * // String enum
 * enum Color {
 *     Red = 'RED',
 *     Green = 'GREEN',
 *     Blue = 'BLUE',
 * }
 *
 * console.log(getEnumValues(Color)); // => ['RED', 'GREEN', 'BLUE']
 *
 * // Mixed enum
 * enum RecordType {
 *     Receive = 0,
 *     Send = 1,
 *     Unknown = 'unknown',
 * }
 *
 * console.log(getEnumValues(RecordType)); // => [0, 1, 'unknown']
 * ```
 */
export function getEnumValues<T extends Record<string, any>>(enumObject: T): (T[keyof T])[] {
    const values = Object.values(enumObject);
    const hasNumberValues = values.some((value) => typeof value === 'number');
    if (!hasNumberValues) return values;
    return Object.keys(enumObject).filter((key) => Number.isNaN(Number(key))).map((key) => enumObject[key]);
}
