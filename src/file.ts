import {
    fileTypeFromBlob,
    fileTypeFromBuffer,
} from 'file-type';

import type { BinaryInput } from './types';

/**
 * Detects a lowercase MIME type from binary content rather than its name or declared type.
 *
 * @remarks
 * Requires the optional `file-type` peer dependency. Only formats supported by its binary detection
 * are recognized; this is not a general text-file detector or a guarantee that a file is safe.
 * Blob and File inputs are read through the detector's tokenizer instead of being fully buffered up front.
 * The amount of content inspected depends on its format; this does not impose a fixed read limit.
 * Detection and input-reading errors propagate to the caller.
 *
 * @param input - The binary content to inspect.
 *
 * @returns The detected lowercase MIME type, or `undefined` when the content is not recognized.
 *
 * @example
 *
 * ```ts
 * import { getFileMimeType } from '@kikiutils/shared/file';
 *
 * const mimeType = await getFileMimeType(file);
 * ```
 */
export async function getFileMimeType(input: BinaryInput) {
    // The tokenizer only uses size, slice, and arrayBuffer; Node/DOM Blob stream typings differ.
    const result = input instanceof ArrayBuffer || input instanceof Uint8Array
        ? await fileTypeFromBuffer(input)
        : await fileTypeFromBlob(input as Blob);

    return result?.mime.toLowerCase();
}
