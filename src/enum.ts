import { objectKeys } from 'ts-extras';
import type { ValueOf } from 'type-fest';

export function getEnumNumberValues<T extends Record<string, any>>(enumObject: T): Array<Extract<ValueOf<T>, number>> {
    return getEnumValues(enumObject).filter((value) => typeof value === 'number');
}

export function getEnumStringValues<T extends Record<string, any>>(enumObject: T): Array<Extract<ValueOf<T>, string>> {
    return getEnumValues(enumObject).filter((value) => typeof value === 'string');
}

/**
 * Skips the reverse mappings TypeScript emits for numeric members: numeric keys whose value names a member holding that
 * number. Other numeric keys are kept.
 */
export function getEnumValues<T extends Record<string, any>>(enumObject: T): Array<ValueOf<T>> {
    return objectKeys(enumObject)
        .filter((key) => {
            const value = enumObject[key];
            return typeof value !== 'string' || enumObject[value] !== Number(key);
        })
        .map((key) => enumObject[key]);
}
