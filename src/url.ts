/**
 * Appends or updates the `redirect` query parameter on a given URL.
 *
 * Typically used to preserve the user's current path for post-login navigation.
 *
 * @param {string} url - The target URL to modify
 * @param {string} redirectPath - The path to use as the redirect destination
 * (must be an absolute path starting with '/')
 *
 * @returns {string} A new URL string with the `redirect` query parameter
 *
 * @throws {Error} If redirectPath is not a valid relative path (must start with '/')
 */
export function appendRedirectParamToUrl(url: string, redirectPath: string) {
    if (!redirectPath.startsWith('/')) {
        throw new Error(
            `Invalid redirect path: "${redirectPath}". Redirect paths must be absolute paths starting with '/'.`,
        );
    }

    const [base, rawQuery = ''] = url.split('?');
    const searchParams = new URLSearchParams(rawQuery);
    searchParams.set('redirect', redirectPath);
    return `${base}?${searchParams.toString()}`;
}
