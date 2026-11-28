import { objectKeys } from 'ts-extras';
import type { ValueOf } from 'type-fest';

/** Excludes numeric enum reverse mappings. */
export function getEnumNumberValues<T extends Record<string, any>>(enumObject: T): Array<Extract<ValueOf<T>, number>> {
    return getEnumValues(enumObject).filter((value) => typeof value === 'number');
}

/** Excludes numeric enum reverse mappings. */
export function getEnumStringValues<T extends Record<string, any>>(enumObject: T): Array<Extract<ValueOf<T>, string>> {
    return getEnumValues(enumObject).filter((value) => typeof value === 'string');
}

/**
 * Values follow property order, which is declaration order for enums. Entries that map a numeric key back to the name
 * of a member holding that number are the reverse mappings TypeScript emits for numeric enum members and are skipped;
 * other numeric keys are kept.
 */
export function getEnumValues<T extends Record<string, any>>(enumObject: T): Array<ValueOf<T>> {
    return objectKeys(enumObject)
        .filter((key) => {
            const value = enumObject[key];
            return typeof value !== 'string' || enumObject[value] !== Number(key);
        })
        .map((key) => enumObject[key]);
}
