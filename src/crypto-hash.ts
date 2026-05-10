import { createHash } from 'node:crypto';
import type {
    BinaryLike,
    BinaryToTextEncoding,
} from 'node:crypto';

/**
 * Computes the MD5 hash of the given data.
 *
 * @param {BinaryLike} data - The input data to hash
 * @param {BinaryToTextEncoding} [outputEncoding] - The output encoding (default: `'hex'`)
 *
 * @returns {string | Buffer} The hash digest in the specified encoding
 *
 * @example
 * ```typescript
 * import { cryptoMd5 } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoMd5('test')); // 098f6bcd4621d373cade4e832627b4f6
 * ```
 */
export function cryptoMd5(data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') {
    return createHash('md5').update(data).digest(outputEncoding);
}

/**
 * Computes the MD5 hash of the given data and returns the raw buffer.
 *
 * @param {BinaryLike} data - The input data to hash
 *
 * @returns {Buffer} The raw hash digest as a Buffer
 *
 * @example
 * ```typescript
 * import { cryptoMd5ToBuffer } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoMd5ToBuffer('test')); // <Buffer 33 ed 9a ...>
 * ```
 */
export function cryptoMd5ToBuffer(data: BinaryLike) {
    return createHash('md5').update(data).digest();
}

/**
 * Computes the SHA-3 hash of the given data using the 224-bit digest.
 *
 * @param {BinaryLike} data - The input data to hash
 * @param {BinaryToTextEncoding} [outputEncoding] - The output encoding (default: `'hex'`)
 *
 * @returns {string | Buffer} The hash digest in the specified encoding
 *
 * @example
 * ```typescript
 * import { cryptoSha3224 } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3224('test')); // 3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b
 * ```
 */
export function cryptoSha3224(data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') {
    return createHash('sha3-224').update(data).digest(outputEncoding);
}

/**
 * Computes the SHA-3 hash of the given data using the 224-bit digest and returns the raw buffer.
 *
 * @param {BinaryLike} data - The input data to hash
 *
 * @returns {Buffer} The raw hash digest as a Buffer
 *
 * @example
 * ```typescript
 * import { cryptoSha3224ToBuffer } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3224ToBuffer('test')); // <Buffer 37 97 bf 0a ...>
 * ```
 */
export function cryptoSha3224ToBuffer(data: BinaryLike) {
    return createHash('sha3-224').update(data).digest();
}

/**
 * Computes the SHA-3 hash of the given data using the 256-bit digest.
 *
 * @param {BinaryLike} data - The input data to hash
 * @param {BinaryToTextEncoding} [outputEncoding] - The output encoding (default: `'hex'`)
 *
 * @returns {string | Buffer} The hash digest in the specified encoding
 *
 * @example
 * ```typescript
 * import { cryptoSha3256 } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3256('test')); // 36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80
 * ```
 */
export function cryptoSha3256(data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') {
    return createHash('sha3-256').update(data).digest(outputEncoding);
}

/**
 * Computes the SHA-3 hash of the given data using the 256-bit digest and returns the raw buffer.
 *
 * @param {BinaryLike} data - The input data to hash
 *
 * @returns {Buffer} The raw hash digest as a Buffer
 *
 * @example
 * ```typescript
 * import { cryptoSha3256ToBuffer } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3256ToBuffer('test')); // <Buffer 36 f0 28 ...>
 * ```
 */
export function cryptoSha3256ToBuffer(data: BinaryLike) {
    return createHash('sha3-256').update(data).digest();
}

/**
 * Computes the SHA-3 hash of the given data using the 384-bit digest.
 *
 * @param {BinaryLike} data - The input data to hash
 * @param {BinaryToTextEncoding} [outputEncoding] - The output encoding (default: `'hex'`)
 *
 * @returns {string | Buffer} The hash digest in the specified encoding
 *
 * @example
 * ```typescript
 * import { cryptoSha3384 } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3384('test')); // e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7f...
 * ```
 */
export function cryptoSha3384(data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') {
    return createHash('sha3-384').update(data).digest(outputEncoding);
}

/**
 * Computes the SHA-3 hash of the given data using the 384-bit digest and returns the raw buffer.
 *
 * @param {BinaryLike} data - The input data to hash
 *
 * @returns {Buffer} The raw hash digest as a Buffer
 *
 * @example
 * ```typescript
 * import { cryptoSha3384ToBuffer } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3384ToBuffer('test')); // <Buffer e5 16 da bb ...>
 * ```
 */
export function cryptoSha3384ToBuffer(data: BinaryLike) {
    return createHash('sha3-384').update(data).digest();
}

/**
 * Computes the SHA-3 hash of the given data using the 512-bit digest.
 *
 * @param {BinaryLike} data - The input data to hash
 * @param {BinaryToTextEncoding} [outputEncoding] - The output encoding (default: `'hex'`)
 *
 * @returns {string | Buffer} The hash digest in the specified encoding
 *
 * @example
 * ```typescript
 * import { cryptoSha3512 } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3512('test')); // 9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7...
 * ```
 */
export function cryptoSha3512(data: BinaryLike, outputEncoding: BinaryToTextEncoding = 'hex') {
    return createHash('sha3-512').update(data).digest(outputEncoding);
}

/**
 * Computes the SHA-3 hash of the given data using the 512-bit digest and returns the raw buffer.
 *
 * @param {BinaryLike} data - The input data to hash
 *
 * @returns {Buffer} The raw hash digest as a Buffer
 *
 * @example
 * ```typescript
 * import { cryptoSha3512ToBuffer } from '@kikiutils/shared/crypto-hash';
 *
 * console.log(cryptoSha3512ToBuffer('test')); // <Buffer 9e ce 08 6e ...>
 * ```
 */
export function cryptoSha3512ToBuffer(data: BinaryLike) {
    return createHash('sha3-512').update(data).digest();
}
