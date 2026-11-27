import { objectKeys } from 'ts-extras';
import type { ValueOf } from 'type-fest';

/**
 * Returns the numeric values of an enum or enum-like object, excluding numeric enum reverse mappings.
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
export function getEnumNumberValues<T extends Record<string, any>>(enumObject: T): Array<Extract<ValueOf<T>, number>> {
    return getEnumValues(enumObject).filter((value) => typeof value === 'number');
}

/**
 * Returns the string values of an enum or enum-like object, excluding numeric enum reverse mappings.
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
export function getEnumStringValues<T extends Record<string, any>>(enumObject: T): Array<Extract<ValueOf<T>, string>> {
    return getEnumValues(enumObject).filter((value) => typeof value === 'string');
}

/**
 * Returns the member values of an enum or enum-like object in property order, which is declaration order for enums.
 *
 * @remarks
 * Entries that map a numeric key back to the name of a member holding that number are the reverse mappings TypeScript
 * emits for numeric enum members and are skipped; other numeric keys are kept.
 *
 * @example
 *
 * ```ts
 * import { getEnumValues } from '@kikiutils/shared/enum';
 *
 * enum RecordType {
 *     Receive = 0,
 *     Send = 1,
 *     Unknown = 'unknown',
 * }
 *
 * console.log(getEnumValues(RecordType)); // => [0, 1, 'unknown']
 * ```
 */
export function getEnumValues<T extends Record<string, any>>(enumObject: T): Array<ValueOf<T>> {
    return objectKeys(enumObject)
        .filter((key) => {
            const value = enumObject[key];
            return typeof value !== 'string' || enumObject[value] !== Number(key);
        })
        .map((key) => enumObject[key]);
}
