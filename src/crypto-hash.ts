/**
 * This file provides a set of functions for creating SHA-3 hash digests using different bit lengths (224, 256, 384, 512).
 * These functions use the Node.js crypto module to generate the hashes.
 * Recommended for pure Node.js/Deno/Bun applications.
 *
 * @example
 * ```typescript
 * import { cryptoSha3256 } from '@kikiutils/node/crypto-hash';
 *
 * console.log(cryptoSha3256('test')); // Output: '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80'
 * ```
 */

import { createHash } from 'crypto';
import type { BinaryLike, BinaryToTextEncoding } from 'crypto';

export const cryptoSha3224 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-224').update(data).digest(outputEncoding);
export const cryptoSha3224ToBuffer = (data: BinaryLike) => createHash('sha3-224').update(data).digest();
export const cryptoSha3256 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-256').update(data).digest(outputEncoding);
export const cryptoSha3256ToBuffer = (data: BinaryLike) => createHash('sha3-256').update(data).digest();
export const cryptoSha3384 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-384').update(data).digest(outputEncoding);
export const cryptoSha3384ToBuffer = (data: BinaryLike) => createHash('sha3-384').update(data).digest();
export const cryptoSha3512 = (data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') => createHash('sha3-512').update(data).digest(outputEncoding);
export const cryptoSha3512ToBuffer = (data: BinaryLike) => createHash('sha3-512').update(data).digest();
