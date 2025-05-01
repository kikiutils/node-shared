import { appendRedirectParamToUrl } from './url';

/**
 * Appends the current browser URL (including path, query, and hash) as the `redirect` query parameter to the given URL.
 *
 * @param {string} url - The base URL to modify.
 *
 * @returns {string} A new URL with the current location as the `redirect` parameter.
 */
export function appendRedirectParamFromCurrentLocationToUrl(url: string) {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return appendRedirectParamToUrl(url, currentPath);
}
