import { Buffer } from 'node:buffer';

import type { BinaryInput } from './types';

/**
 * Converts binary input to a Node.js `Buffer`.
 *
 * @remarks
 * An existing `Buffer` is returned unchanged. `ArrayBuffer` and `Uint8Array` inputs share their backing memory
 * with the result, so changes are visible through both views. `Blob` and `File` inputs are read asynchronously.
 *
 * @param input - The binary data to convert.
 *
 * @returns A promise resolving to the original buffer or a new buffer view after the input is available.
 *
 * @throws TypeError through promise rejection if the input is unsupported.
 *
 * @example
 *
 * ```ts
 * import { toBuffer } from '@kikiutils/shared/buffer';
 *
 * const bytes = new Uint8Array([
 *     10,
 *     20,
 *     30,
 * ]);
 *
 * const buffer = await toBuffer(bytes);
 * bytes[0] = 40;
 * console.log(buffer[0]); // => 40
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
