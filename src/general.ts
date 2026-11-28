/** Selects the fallback when the value, or the first element of an array, is nullish, including for an empty array. */
export function extractFirstValue<T>(value: readonly T[] | T): T | undefined;
export function extractFirstValue<T, D>(value: readonly T[] | T, fallback: D): D | NonNullable<T>;
export function extractFirstValue<T, D>(value: readonly T[] | T, fallback?: D) {
    return (Array.isArray(value) ? value[0] : value) ?? fallback;
}

export function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error);
}
