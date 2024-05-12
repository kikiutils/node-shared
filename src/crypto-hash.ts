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
