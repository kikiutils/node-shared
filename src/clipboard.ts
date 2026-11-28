/**
 * Requires a secure context and, in most browsers, user activation.
 *
 * @param blob - Its MIME type is the clipboard format; browsers only write supported types such as `text/plain` or
 * `image/png`, so an untyped blob resolves to `false`.
 */
export async function copyBlobToClipboard(blob: Blob, options?: ClipboardItemOptions) {
    try {
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob }, options)]);
        return true;
    } catch {
        return false;
    }
}

/** Requires a secure context and, in most browsers, user activation. */
export async function copyTextToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
