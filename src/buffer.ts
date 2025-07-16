import { Buffer } from 'node:buffer';

/**
 * Converts a Blob, Buffer, or File to a Buffer.
 *
 * This function provides a unified way to convert various binary data types
 * to Node.js Buffer. If the input is already a Buffer, it returns it as-is.
 * For Blob or File inputs, it converts them to Buffer via ArrayBuffer.
 *
 * @param {Blob | Buffer | File} input - The input to convert to Buffer
 *
 * @returns {Promise<Buffer>} A Promise that resolves to a Buffer
 *
 * @example
 * ```typescript
 * import { toBuffer } from '@kikiutils/shared/general';
 *
 * // Convert a Buffer (returns as-is)
 * const buffer = Buffer.from('Hello World');
 * const result1 = await toBuffer(buffer);
 * console.log(result1); // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64>
 *
 * // Convert a Blob
 * const blob = new Blob(['Hello from Blob'], { type: 'text/plain' });
 * const result2 = await toBuffer(blob);
 * console.log(result2.toString()); // 'Hello from Blob'
 *
 * // Convert a File
 * const file = new File(['File content'], 'test.txt', { type: 'text/plain' });
 * const result3 = await toBuffer(file);
 * console.log(result3.toString()); // 'File content'
 * ```
 */
export async function toBuffer(input: Blob | Buffer | File) {
    if (Buffer.isBuffer(input)) return input;
    return Buffer.from(await input.arrayBuffer());
}
