/**
 * Attempts to copy a blob to the browser clipboard and resolves to whether it succeeded.
 *
 * @remarks
 * Requires a browser environment with clipboard support, a secure context, and any user activation required
 * by the browser. Unsupported environments and Clipboard API failures resolve to `false` instead of rejecting.
 *
 * @param blob - The blob whose MIME type identifies the clipboard format; browsers only write supported types such as
 * `text/plain` or `image/png`, so an untyped blob resolves to `false`.
 * @param options - Options passed to the `ClipboardItem` constructor.
 *
 * @example
 *
 * ```ts
 * import { copyBlobToClipboard } from '@kikiutils/shared/clipboard';
 *
 * button.addEventListener('click', async () => {
 *     const copied = await copyBlobToClipboard(new Blob(['Hello world'], { type: 'text/plain' }));
 * });
 * ```
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
 * Attempts to copy text to the browser clipboard and resolves to whether it succeeded.
 *
 * @remarks
 * Requires a browser environment with clipboard support, a secure context, and any user activation required
 * by the browser. Unsupported environments and Clipboard API failures resolve to `false` instead of rejecting.
 *
 * @example
 *
 * ```ts
 * import { copyTextToClipboard } from '@kikiutils/shared/clipboard';
 *
 * button.addEventListener('click', async () => {
 *     if (await copyTextToClipboard('Hello world')) console.log('Copied!');
 * });
 * ```
 */
export async function copyTextToClipboard(text: string) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}
