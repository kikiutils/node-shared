const redirectPathBaseOrigin = 'http://redirect-path.invalid';

export function appendRedirectParamToUrl(url: string, redirectPath: string) {
    const safeRedirectPath = toSafeRedirectPath(redirectPath);
    if (safeRedirectPath === undefined) {
        throw new TypeError(`Invalid redirect path: "${redirectPath}". Redirect paths must be same-origin paths starting with '/'.`);
    }

    const hashIndex = url.indexOf('#');
    const fragment = hashIndex === -1 ? '' : url.slice(hashIndex);
    const urlWithoutFragment = hashIndex === -1 ? url : url.slice(0, hashIndex);
    const queryIndex = urlWithoutFragment.indexOf('?');
    const base = queryIndex === -1 ? urlWithoutFragment : urlWithoutFragment.slice(0, queryIndex);
    const searchParams = new URLSearchParams(queryIndex === -1 ? '' : urlWithoutFragment.slice(queryIndex + 1));
    searchParams.set('redirect', safeRedirectPath);
    return `${base}?${searchParams.toString()}${fragment}`;
}

/**
 * Returns the browser-resolved form so the navigation target is exactly what was checked. `fallback` is returned
 * unvalidated.
 */
export function normalizeRedirectPath(value: unknown, fallback = '/') {
    return toSafeRedirectPath(Array.isArray(value) ? value[0] : value) ?? fallback;
}

// Parsing the way browsers do, instead of rejecting known-dangerous characters, also covers what parsers rewrite:
// `\` becomes `/` in the path, and tabs and line breaks are removed anywhere.
function toSafeRedirectPath(value: unknown) {
    if (typeof value !== 'string' || !value.startsWith('/')) return;
    let url: URL;
    try {
        url = new URL(value, redirectPathBaseOrigin);
    } catch {
        // A `//` prefix makes the rest a host, which can fail to parse.
        return;
    }

    if (url.origin !== redirectPathBaseOrigin) return;
    // Dot segments can leave a `//` prefix, as in `/x/..//evil.com`, which would navigate to another host.
    return `/${url.pathname.replace(/^\/+/, '')}${url.search}${url.hash}`;
}
