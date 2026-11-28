import {
    fileTypeFromBlob,
    fileTypeFromBuffer,
} from 'file-type';

import type { BinaryInput } from './types';

/**
 * Detects from content only, through `file-type`, so text formats are not recognized and a match does not mean the
 * file is safe. Blobs are read incrementally, but the amount read depends on the format, with no fixed limit.
 */
export async function getFileMimeType(input: BinaryInput) {
    // The tokenizer only uses size, slice, and arrayBuffer; Node/DOM Blob stream typings differ.
    const result = input instanceof ArrayBuffer || input instanceof Uint8Array
        ? await fileTypeFromBuffer(input)
        : await fileTypeFromBlob(input as Blob);

    return result?.mime.toLowerCase();
}
