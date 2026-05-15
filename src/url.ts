/**
 * Appends or updates the `redirect` query parameter on a given URL.
 *
 * Typically used to preserve the user's current path for post-login navigation.
 *
 * @param {string} url - The target URL to modify
 * @param {string} redirectPath - The path to use as the redirect destination
 * (must be a safe same-origin application path starting with `/`)
 *
 * @returns {string} A new URL string with the `redirect` query parameter
 *
 * @throws {Error} If redirectPath is not a safe same-origin application path
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
 * Safe redirect paths are absolute application paths such as `/dashboard`.
 * Protocol-relative URLs (`//example.com`), absolute URLs, backslash paths,
 * and non-string values are rejected.
 *
 * @param {unknown} value - The value to check
 *
 * @returns {boolean} Whether the value is safe to use as an application redirect path
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
 * If an array is provided, the first value is checked. Unsafe values fall back
 * to the provided fallback path.
 *
 * @param {unknown} value - The redirect value to normalize
 * @param {string} fallback - The safe fallback path
 *
 * @returns {string} A safe redirect path
 */
export function normalizeRedirectPath(value: unknown, fallback = '/') {
    const redirectPath = Array.isArray(value) ? value[0] : value;
    return isSafeRedirectPath(redirectPath) ? redirectPath : fallback;
}
