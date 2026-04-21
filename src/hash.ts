import {
    sha3_224,
    sha3_256,
    sha3_384,
    sha3_512,
} from '@noble/hashes/sha3.js';
import {
    bytesToHex,
    utf8ToBytes,
} from '@noble/hashes/utils.js';

/**
 * Computes the SHA-3 hash of the given data using the 224-bit digest.
 *
 * @param {string | Uint8Array} data - The input data to hash
 *
 * @returns {string} The hexadecimal hash digest
 *
 * @example
 * ```typescript
 * import { sha3224 } from '@kikiutils/shared/hash';
 *
 * console.log(sha3224('test')); // 0qW8FoqDcFmkpuqR9J3uT8YXVb3pWnLYgA4JqyprhqZ5H...
 * ```
 */
export function sha3224(data: string | Uint8Array) {
    return bytesToHex(sha3_224(typeof data === 'string' ? utf8ToBytes(data) : data));
}

/**
 * Computes the SHA-3 hash of the given data using the 256-bit digest.
 *
 * @param {string | Uint8Array} data - The input data to hash
 *
 * @returns {string} The hexadecimal hash digest
 *
 * @example
 * ```typescript
 * import { sha3256 } from '@kikiutils/shared/hash';
 *
 * console.log(sha3256('test')); // 36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80
 * ```
 */
export function sha3256(data: string | Uint8Array) {
    return bytesToHex(sha3_256(typeof data === 'string' ? utf8ToBytes(data) : data));
}

/**
 * Computes the SHA-3 hash of the given data using the 384-bit digest.
 *
 * @param {string | Uint8Array} data - The input data to hash
 *
 * @returns {string} The hexadecimal hash digest
 *
 * @example
 * ```typescript
 * import { sha3384 } from '@kikiutils/shared/hash';
 *
 * console.log(sha3384('test')); // 1Q2wQAYaZ4o8vWX5bEB2n3Y...
 * ```
 */
export function sha3384(data: string | Uint8Array) {
    return bytesToHex(sha3_384(typeof data === 'string' ? utf8ToBytes(data) : data));
}

/**
 * Computes the SHA-3 hash of the given data using the 512-bit digest.
 *
 * @param {string | Uint8Array} data - The input data to hash
 *
 * @returns {string} The hexadecimal hash digest
 *
 * @example
 * ```typescript
 * import { sha3512 } from '@kikiutils/shared/hash';
 *
 * console.log(sha3512('test')); // b_NQJ8FJBY9dIjm1q7...
 * ```
 */
export function sha3512(data: string | Uint8Array) {
    return bytesToHex(sha3_512(typeof data === 'string' ? utf8ToBytes(data) : data));
}
