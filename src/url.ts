/**
 * Appends or updates the `redirect` query parameter on a given URL.
 *
 * @remarks
 * Typically used to preserve the user's current path for post-login navigation.
 *
 * @param url - The target URL to modify.
 * @param redirectPath - The safe same-origin application path starting with `/` to use as the redirect destination.
 *
 * @returns A new URL string with the `redirect` query parameter.
 *
 * @throws Error if `redirectPath` is not a safe same-origin application path.
 */
export function appendRedirectParamToUrl(url: string, redirectPath: string) {
    // eslint-disable-next-line style/max-len
    if (!isSafeRedirectPath(redirectPath)) throw new Error(`Invalid redirect path: "${redirectPath}". Redirect paths must be safe same-origin paths starting with '/'.`);

    const [baseAndHash, rawQuery = ''] = url.split('?');
    const [base, hash] = (baseAndHash || '').split('#');
    const searchParams = new URLSearchParams(rawQuery);
    searchParams.set('redirect', redirectPath);
    const queryString = searchParams.toString();
    return hash ? `${base}?${queryString}#${hash}` : `${base}?${queryString}`;
}

/**
 * Returns whether a value is a safe same-origin redirect path.
 *
 * @remarks
 * Safe redirect paths are absolute application paths such as `/dashboard`.
 * Protocol-relative URLs (`//example.com`), absolute URLs, backslash paths,
 * and non-string values are rejected.
 *
 * @param value - The value to check.
 *
 * @returns Whether the value is safe to use as an application redirect path.
 */
export function isSafeRedirectPath(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    if (!value.startsWith('/')) return false;
    if (value.startsWith('//')) return false;
    if (value.includes('\\')) return false;
    return true;
}

/**
 * Normalizes a redirect value into a safe same-origin application path.
 *
 * @remarks
 * If an array is provided, the first value is checked. Unsafe values fall back
 * to the provided fallback path.
 *
 * @param value - The redirect value to normalize.
 * @param fallback - The caller-supplied safe fallback path; it is returned unchanged and is not validated.
 *
 * @returns The validated input path, or the unvalidated fallback path.
 */
export function normalizeRedirectPath(value: unknown, fallback = '/') {
    const redirectPath = Array.isArray(value) ? value[0] : value;
    return isSafeRedirectPath(redirectPath) ? redirectPath : fallback;
}
