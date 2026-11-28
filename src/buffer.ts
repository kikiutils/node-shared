import { Buffer } from 'node:buffer';

import type { BinaryInput } from './types';

/**
 * An existing `Buffer` is returned unchanged. `ArrayBuffer` and `Uint8Array` inputs share their backing memory
 * with the result, so changes are visible through both views.
 *
 * @throws TypeError through promise rejection if the input is unsupported.
 */
export async function toBuffer(input: BinaryInput) {
    if (Buffer.isBuffer(input)) return input;
    if (input instanceof ArrayBuffer) return Buffer.from(input);
    if (input instanceof Uint8Array) return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
    if (typeof input.arrayBuffer === 'function') return Buffer.from(await input.arrayBuffer());
    throw new TypeError('The provided input is not a supported binary type (Blob, Buffer, File, ArrayBuffer, or Uint8Array).');
}
