/**
 * This file provides a set of functions for creating SHA-3 hash digests
 * using different bit lengths (224, 256, 384, 512).
 * These functions use the [@noble/hashes](https://github.com/paulmillr/noble-hashes) library to generate the hashes.
 * Can be used in the browser, mainly for Nuxt/Vue and other frameworks compiled and executed in the browser.
 *
 * @example
 * ```typescript
 * import { sha3256 } from '@kikiutils/shared/hash';
 *
 * console.log(sha3256('test')); // 36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80
 * ```
 */

import {
    sha3_224,
    sha3_256,
    sha3_384,
    sha3_512,
} from '@noble/hashes/sha3';
import {
    bytesToHex,
    utf8ToBytes,
} from '@noble/hashes/utils';

export function sha3224(data: string | Uint8Array) {
    return bytesToHex(sha3_224(typeof data === 'string' ? utf8ToBytes(data) : data));
}

export function sha3256(data: string | Uint8Array) {
    return bytesToHex(sha3_256(typeof data === 'string' ? utf8ToBytes(data) : data));
}

export function sha3384(data: string | Uint8Array) {
    return bytesToHex(sha3_384(typeof data === 'string' ? utf8ToBytes(data) : data));
}

export function sha3512(data: string | Uint8Array) {
    return bytesToHex(sha3_512(typeof data === 'string' ? utf8ToBytes(data) : data));
}
