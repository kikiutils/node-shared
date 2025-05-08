type CopyResult =
  | { error: unknown; ok: false }
  | { ok: true };

/**
 * Attempts to copy a Blob (e.g. image, plain text, HTML) to the user's clipboard using the ClipboardItem API.
 *
 * ⚠️ Usage Notes:
 * - Must be called in a **secure context** (HTTPS or localhost).
 * - Must be called **in response to a user interaction** (e.g. click, input).
 * - Not supported in Safari and some older browsers.
 *
 * @param {Blob} blob - The Blob object to copy (e.g. from a File, image, or text content).
 * @param {ClipboardItemOptions} [options] - Optional options passed to the ClipboardItem constructor.
 *
 * @returns {Promise<CopyResult>} A promise resolving to a `CopyResult`:
 *   - `{ ok: true }` if the copy succeeded
 *   - `{ ok: false, error }` if the copy failed, with the error included
 *
 * @example
 * ```typescript
 * import { copyBlobToClipboard } from '@kikiutils/shared/clipboard';
 *
 * const blob = new Blob(['Hello world'], { type: 'text/plain' });
 * const result = await copyBlobToClipboard(blob);
 * if (result.ok) {
 *     console.log('Copied blob!');
 * } else {
 *     console.error('Copy failed:', result.error);
 * }
 * ```
 */
export async function copyBlobToClipboard(blob: Blob, options?: ClipboardItemOptions): Promise<CopyResult> {
    if (!navigator.clipboard?.write) {
        return {
            error: new Error('Clipboard.write is not supported in this browser.'),
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
 * Attempts to copy the given text to the user's clipboard using the modern Clipboard API.
 *
 * ⚠️ Usage Notes:
 * - Must be called in a **secure context** (HTTPS or localhost).
 * - Must be called **in response to a user interaction** (e.g. click, input).
 * - Not supported in some older browsers (especially legacy Safari).
 *
 * @param {string} text - The string to be copied to the clipboard.
 *
 * @returns {Promise<CopyResult>} A promise resolving to a `CopyResult`:
 *   - `{ ok: true }` if the copy succeeded
 *   - `{ ok: false, error }` if the copy failed, with the error included
 *
 * @example
 * ```typescript
 * import { copyTextToClipboard } from '@kikiutils/shared/clipboard';
 *
 * const result = await copyTextToClipboard('Hello!');
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
