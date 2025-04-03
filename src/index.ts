export function flattenToSingleValue<T>(value: T | T[]): T | undefined;
export function flattenToSingleValue<T, D>(value: T | T[], defaultValue: D): D | NonNullable<T>;
export function flattenToSingleValue<T, D>(value: T | T[], defaultValue?: D) {
    return (Array.isArray(value) ? value[0] : value) ?? defaultValue;
}
