import { appendRedirectParamToUrl } from './url';

/**
 * Appends the current browser path, query, and hash as the `redirect` query parameter of a URL.
 */
export function appendRedirectParamFromCurrentLocationToUrl(url: string) {
    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    return appendRedirectParamToUrl(url, currentPath);
}

/**
 * Navigates to a URL with the current browser path, query, and hash as its redirect parameter.
 *
 * @remarks
 * Omitting `delayMs` navigates immediately. Providing a delay, including `0`, schedules navigation;
 * the current location is read when the timer fires, not when the timer is created.
 * Requires a browser environment. Redirect-path validation errors propagate from the URL helper.
 *
 * @returns A timer handle when delayed, which the caller can cancel with `clearTimeout`.
 */
export function assignUrlWithRedirectParamFromCurrentLocation(url: string, delayMs?: number) {
    if (delayMs === undefined) window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url));
    else return setTimeout(() => window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url)), delayMs);
}
