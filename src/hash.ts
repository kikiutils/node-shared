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

// Functions
export const sha3224 = /* @__PURE__ */ createHexHashFunction(sha3_224);
export const sha3256 = /* @__PURE__ */ createHexHashFunction(sha3_256);
export const sha3384 = /* @__PURE__ */ createHexHashFunction(sha3_384);
export const sha3512 = /* @__PURE__ */ createHexHashFunction(sha3_512);

function createHexHashFunction(hash: (data: Uint8Array) => Uint8Array) {
    // Strings are hashed as UTF-8.
    return (data: string | Uint8Array) => bytesToHex(hash(typeof data === 'string' ? utf8ToBytes(data) : data));
}
