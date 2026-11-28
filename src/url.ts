// Constants
const redirectPathBaseOrigin = 'http://redirect-path.invalid';

// Functions

/**
 * Appends or updates the `redirect` query parameter on a given URL.
 *
 * @remarks
 * Typically used to preserve the user's current path for post-login navigation. Existing query parameters and the
 * fragment are kept.
 *
 * @throws TypeError if `redirectPath` is not a safe same-origin application path.
 */
export function appendRedirectParamToUrl(url: string, redirectPath: string) {
    if (!isSafeRedirectPath(redirectPath)) throw new TypeError(`Invalid redirect path: "${redirectPath}". Redirect paths must be safe same-origin paths starting with '/'.`);

    const hashIndex = url.indexOf('#');
    const fragment = hashIndex === -1 ? '' : url.slice(hashIndex);
    const urlWithoutFragment = hashIndex === -1 ? url : url.slice(0, hashIndex);
    const queryIndex = urlWithoutFragment.indexOf('?');
    const base = queryIndex === -1 ? urlWithoutFragment : urlWithoutFragment.slice(0, queryIndex);
    const searchParams = new URLSearchParams(queryIndex === -1 ? '' : urlWithoutFragment.slice(queryIndex + 1));
    searchParams.set('redirect', redirectPath);
    return `${base}?${searchParams.toString()}${fragment}`;
}

/**
 * Returns whether a value is a safe same-origin redirect path.
 *
 * @remarks
 * Safe redirect paths are absolute application paths such as `/dashboard`.
 * Protocol-relative URLs (`//example.com`), absolute URLs, backslash paths,
 * paths containing control characters, and non-string values are rejected.
 *
 * URL parsers remove tabs and line breaks before parsing, so `/\n/example.com`
 * would otherwise be read as `//example.com`. The path is therefore also
 * resolved the way a browser would, and must stay on the base origin.
 */
export function isSafeRedirectPath(value: unknown): value is string {
    if (typeof value !== 'string') return false;
    if (!value.startsWith('/')) return false;
    if (value.startsWith('//')) return false;
    if (value.includes('\\')) return false;
    // eslint-disable-next-line no-control-regex
    if (/[\0-\x1F\x7F]/.test(value)) return false;
    // Parsing cannot fail here: a single-slash path relative to a valid base only reaches the path state.
    return new URL(value, redirectPathBaseOrigin).origin === redirectPathBaseOrigin;
}

/**
 * Normalizes a redirect value into a safe same-origin application path.
 *
 * @remarks
 * If an array is provided, the first value is checked. Unsafe values fall back
 * to `fallback`, which is returned unchanged and not validated.
 */
export function normalizeRedirectPath(value: unknown, fallback = '/') {
    const redirectPath = Array.isArray(value) ? value[0] : value;
    return isSafeRedirectPath(redirectPath) ? redirectPath : fallback;
}
