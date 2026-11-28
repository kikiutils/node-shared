/**
 * Requires a browser environment with clipboard support, a secure context, and any user activation required
 * by the browser. Unsupported environments and Clipboard API failures resolve to `false` instead of rejecting.
 *
 * @param blob - The blob whose MIME type identifies the clipboard format; browsers only write supported types such as
 * `text/plain` or `image/png`, so an untyped blob resolves to `false`.
 */
export async function copyBlobToClipboard(blob: Blob, options?: ClipboardItemOptions) {
    try {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob }, options)]);
        return true;
    } catch {
        return false;
    }
}

/**
 * Requires a browser environment with clipboard support, a secure context, and any user activation required
 * by the browser. Unsupported environments and Clipboard API failures resolve to `false` instead of rejecting.
 */
export async function copyTextToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
