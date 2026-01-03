import { Buffer } from 'node:buffer';

import type { BinaryInput } from './types';

/**
 * Converts various binary data types to a Node.js Buffer.
 *
 * This function provides a unified, efficient way to convert different binary formats
 * (Blob, Buffer, File, ArrayBuffer, or Uint8Array) into a Node.js Buffer.
 * It prioritizes zero-copy conversions for TypedArrays and ArrayBuffers to ensure
 * optimal performance.
 *
 * @param {ArrayBuffer | Blob | Buffer | File | Uint8Array} input - The binary data input to convert.
 * Supports Blob, Buffer, File, ArrayBuffer, and Uint8Array.
 *
 * @returns {Promise<Buffer>} A promise that resolves to a Node.js Buffer.
 *
 * @example
 * ```typescript
 * import { toBuffer } from '@kikiutils/shared/buffer';
 *
 * // From ArrayBuffer
 * const ab = new ArrayBuffer(8);
 * const bufferFromAB = await toBuffer(ab);
 *
 * // From Uint8Array (Zero-copy)
 * const u8 = new Uint8Array([10, 20, 30]);
 * const bufferFromU8 = await toBuffer(u8);
 *
 * // From Blob or File
 * const blob = new Blob(['data'], { type: 'text/plain' });
 * const bufferFromBlob = await toBuffer(blob);
 * ```
 */
export async function toBuffer(input: BinaryInput) {
    if (Buffer.isBuffer(input)) return input;
    if (input instanceof ArrayBuffer) return Buffer.from(input);
    if (input instanceof Uint8Array) return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
    if (typeof input.arrayBuffer === 'function') return Buffer.from(await input.arrayBuffer());
    // eslint-disable-next-line style/max-len
    throw new TypeError('The provided input is not a supported binary type (Blob, Buffer, File, ArrayBuffer, or Uint8Array).');
}
