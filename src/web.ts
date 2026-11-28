import { appendRedirectParamToUrl } from './url';

/** Uses the current path, query, and hash as the `redirect` query parameter. */
export function appendRedirectParamFromCurrentLocationToUrl(url: string) {
    // Leading slashes are collapsed because a `//` prefix would form a protocol-relative URL, which redirect paths
    // reject; this keeps 401 redirects working on malformed links such as `https://app//orders`.
    const pathname = window.location.pathname.replace(/^\/{2,}/, '/');
    const currentPath = `${pathname}${window.location.search}${window.location.hash}`;
    return appendRedirectParamToUrl(url, currentPath);
}

/**
 * Omitting `delayMs` navigates immediately. A delay, including `0`, schedules navigation and returns the timer handle;
 * the current location is read when the timer fires, not when the timer is created.
 */
export function assignUrlWithRedirectParamFromCurrentLocation(url: string, delayMs?: number) {
    if (delayMs === undefined) window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url));
    else return setTimeout(() => window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url)), delayMs);
}
