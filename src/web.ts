import { appendRedirectParamToUrl } from '@/url';

/**
 * Appends the current browser URL (including path, query, and hash) as the `redirect` query parameter to the given URL.
 *
 * @param {string} url - The base URL to modify
 *
 * @returns {string} A new URL with the current location as the `redirect` parameter
 */
export function appendRedirectParamFromCurrentLocationToUrl(url: string) {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return appendRedirectParamToUrl(url, currentPath);
}

/**
 * Navigates to the given URL, appending the current browser location
 * (path, query, and hash) as the `redirect` query parameter.
 *
 * Useful for redirecting to login or other gateways while preserving
 * the current location for post-auth navigation.
 *
 * @param {string} url - The destination URL to navigate to
 * @param {number} [delayMs] - Optional delay in milliseconds before navigation
 */
export function assignUrlWithRedirectParamFromCurrentLocation(url: string, delayMs?: number) {
    if (delayMs === undefined) window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url));
    else return setTimeout(() => window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url)), delayMs);
}
