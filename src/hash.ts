import { sha3_224, sha3_256, sha3_384, sha3_512 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';

export const sha3224 = (data: string | Uint8Array) => bytesToHex(sha3_224(data));
export const sha3256 = (data: string | Uint8Array) => bytesToHex(sha3_256(data));
export const sha3384 = (data: string | Uint8Array) => bytesToHex(sha3_384(data));
export const sha3512 = (data: string | Uint8Array) => bytesToHex(sha3_512(data));
