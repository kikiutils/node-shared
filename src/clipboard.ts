type CopyResult =
  | { error: unknown; ok: false }
  | { ok: true };

/**
 * Attempts to copy a blob to the browser clipboard.
 *
 * @remarks
 * Requires a browser environment with clipboard support, a secure context, and any user activation required
 * by the browser. Clipboard API failures are returned as results rather than rethrown.
 *
 * @param blob - The blob whose MIME type identifies the clipboard format.
 * @param options - Options passed to the `ClipboardItem` constructor.
 *
 * @returns A promise resolving after the copy attempt to `{ ok: true }` on success, or
 * `{ ok: false, error }` with the failure reason.
 *
 * @example
 *
 * ```ts
 * import { copyBlobToClipboard } from '@kikiutils/shared/clipboard';
 *
 * // Call from a user interaction in a supported browser.
 * const blob = new Blob(['Hello world'], { type: 'text/plain' });
 * const result = await copyBlobToClipboard(blob);
 * if (result.ok) {
 *     console.log('Copied!');
 * } else {
 *     console.error('Copy failed:', result.error);
 * }
 * ```
 */
export async function copyBlobToClipboard(blob: Blob, options?: ClipboardItemOptions): Promise<CopyResult> {
    if (!navigator.clipboard?.write) {
        return {
            error: new Error('Clipboard.write is not supported in this browser'),
            ok: false,
        };
    }

    try {
        const item = new ClipboardItem({ [blob.type]: blob }, options);
        await navigator.clipboard.write([item]);
        return { ok: true };
    } catch (error) {
        return {
            error,
            ok: false,
        };
    }
}

/**
 * Attempts to copy text to the browser clipboard.
 *
 * @remarks
 * Requires a browser environment with clipboard support, a secure context, and any user activation required
 * by the browser. Clipboard API failures are returned as results rather than rethrown.
 *
 * @param text - The text to copy.
 *
 * @returns A promise resolving after the copy attempt to `{ ok: true }` on success, or
 * `{ ok: false, error }` with the failure reason.
 *
 * @example
 *
 * ```ts
 * import { copyTextToClipboard } from '@kikiutils/shared/clipboard';
 *
 * // Call from a user interaction in a supported browser.
 * const result = await copyTextToClipboard('Hello world');
 * if (result.ok) {
 *     console.log('Copied!');
 * } else {
 *     console.error('Copy failed:', result.error);
 * }
 * ```
 */
export async function copyTextToClipboard(text: string): Promise<CopyResult> {
    try {
        await navigator.clipboard.writeText(text);
        return { ok: true };
    } catch (error) {
        return {
            error,
            ok: false,
        };
    }
}
