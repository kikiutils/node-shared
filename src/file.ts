import {
    fileTypeFromBlob,
    fileTypeFromBuffer,
} from 'file-type';

import type { BinaryInput } from './types';

/**
 * Detects a lowercase MIME type from binary content rather than its name or declared type. Only formats supported by
 * `file-type` binary detection are recognized; this is not a general text-file detector or a guarantee that a file is
 * safe. Blob and File inputs are read through the detector's tokenizer instead of being fully buffered up front, and
 * the amount of content inspected depends on the format, with no fixed read limit.
 */
export async function getFileMimeType(input: BinaryInput) {
    // The tokenizer only uses size, slice, and arrayBuffer; Node/DOM Blob stream typings differ.
    const result = input instanceof ArrayBuffer || input instanceof Uint8Array
        ? await fileTypeFromBuffer(input)
        : await fileTypeFromBlob(input as Blob);

    return result?.mime.toLowerCase();
}
