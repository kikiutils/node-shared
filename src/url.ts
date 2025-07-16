/**
 * Appends or updates the `redirect` query parameter on a given URL.
 *
 * Typically used to preserve the user's current path for post-login navigation.
 *
 * @param {string} url - The target URL to modify
 * @param {string} redirectPath - The path to use as the redirect destination
 *
 * @returns {string} A new URL string with the `redirect` query parameter
 */
export function appendRedirectParamToUrl(url: string, redirectPath: string) {
    const [base, rawQuery = ''] = url.split('?');
    const searchParams = new URLSearchParams(rawQuery);
    searchParams.set('redirect', redirectPath);
    return `${base}?${searchParams.toString()}`;
}
