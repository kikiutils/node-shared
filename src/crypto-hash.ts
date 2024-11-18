/**
 * This file provides a set of functions for creating hash digests using different algorithms and bit lengths.
 * It includes functions for generating SHA-3 hash digests with bit lengths of 224, 256, 384, and 512,
 * as well as a function for generating MD5 hash digests.
 * These functions use the Node.js crypto module to generate the hashes.
 * Can only be used in Node.js/Deno/Bun runtimes.
 *
 * @example
 * ```typescript
 * import { cryptoSHA3256 } from '@kikiutils/node/crypto-hash';
 *
 * console.log(cryptoSHA3256('test')); // Output: '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80'
 * ```
 */

import { createHash } from 'node:crypto';
import type { BinaryLike, BinaryToTextEncoding } from 'node:crypto';

export const cryptoMD5 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('md5').update(data).digest(outputEncoding);
export const cryptoMD5ToBuffer = (data: BinaryLike) => createHash('md5').update(data).digest();
export const cryptoSHA3224 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-224').update(data).digest(outputEncoding);
export const cryptoSHA3224ToBuffer = (data: BinaryLike) => createHash('sha3-224').update(data).digest();
export const cryptoSHA3256 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-256').update(data).digest(outputEncoding);
export const cryptoSHA3256ToBuffer = (data: BinaryLike) => createHash('sha3-256').update(data).digest();
export const cryptoSHA3384 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-384').update(data).digest(outputEncoding);
export const cryptoSHA3384ToBuffer = (data: BinaryLike) => createHash('sha3-384').update(data).digest();
export const cryptoSHA3512 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-512').update(data).digest(outputEncoding);
export const cryptoSHA3512ToBuffer = (data: BinaryLike) => createHash('sha3-512').update(data).digest();
