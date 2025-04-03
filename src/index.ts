export function extractFirstValue<T>(value: T | T[]): T | undefined;
export function extractFirstValue<T, D>(value: T | T[], defaultValue: D): D | NonNullable<T>;
export function extractFirstValue<T, D>(value: T | T[], defaultValue?: D) {
    return (Array.isArray(value) ? value[0] : value) ?? defaultValue;
}
