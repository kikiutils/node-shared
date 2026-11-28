import { appendRedirectParamToUrl } from './url';

export function appendRedirectParamFromCurrentLocationToUrl(url: string) {
    // Leading slashes are collapsed because a `//` prefix would be read as a host; this keeps 401 redirects working
    // on malformed links such as `https://app//orders`.
    const pathname = window.location.pathname.replace(/^\/{2,}/, '/');
    const currentPath = `${pathname}${window.location.search}${window.location.hash}`;
    return appendRedirectParamToUrl(url, currentPath);
}

export function assignUrlWithRedirectParamFromCurrentLocation(url: string, delayMs?: number) {
    if (delayMs === undefined) window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url));
    else return setTimeout(() => window.location.assign(appendRedirectParamFromCurrentLocationToUrl(url)), delayMs);
}
