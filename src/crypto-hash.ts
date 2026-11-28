import { Buffer } from 'node:buffer';
import {
    hash,
    timingSafeEqual,
} from 'node:crypto';
import type { BinaryLike } from 'node:crypto';

/** Output defaults to a hex digest; `'buffer'` returns raw bytes. */
export interface CryptoHashFunction {
    (data: BinaryLike, outputEncoding?: BufferEncoding): string;
    (data: BinaryLike, outputEncoding: 'buffer'): Buffer<ArrayBuffer>;
    (data: BinaryLike, outputEncoding: 'buffer' | BufferEncoding): Buffer<ArrayBuffer> | string;
}

/**
 * Compares the strings as UTF-8 bytes. Only equal-length inputs compare in constant time; a length mismatch returns
 * `false` early, so use it for values whose length is not secret, such as digests, MACs, and tokens of a fixed format.
 */
export function timingSafeEqualStrings(a: string, b: string) {
    const aBytes = Buffer.from(a);
    const bBytes = Buffer.from(b);
    return aBytes.length === bBytes.length && timingSafeEqual(aBytes, bBytes);
}

export const cryptoMd5 = /* @__PURE__ */ createCryptoHashFunction('md5');
export const cryptoSha256 = /* @__PURE__ */ createCryptoHashFunction('sha256');
export const cryptoSha3224 = /* @__PURE__ */ createCryptoHashFunction('sha3-224');
export const cryptoSha3256 = /* @__PURE__ */ createCryptoHashFunction('sha3-256');
export const cryptoSha3384 = /* @__PURE__ */ createCryptoHashFunction('sha3-384');
export const cryptoSha3512 = /* @__PURE__ */ createCryptoHashFunction('sha3-512');

function createCryptoHashFunction(algorithm: string) {
    return ((data: BinaryLike, outputEncoding: 'buffer' | BufferEncoding = 'hex') => {
        // `BinaryLike` admits `ArrayBuffer`, but Node's hash functions reject it at runtime.
        const input = typeof data === 'string' || ArrayBuffer.isView(data) ? data : Buffer.from(data);
        return hash(algorithm, input, outputEncoding);
    }) as CryptoHashFunction;
}
