import { Buffer } from 'node:buffer';

import {
    describe,
    it,
} from 'vitest';

import {
    cryptoMd5,
    cryptoMd5ToBuffer,
    cryptoSha3224,
    cryptoSha3224ToBuffer,
    cryptoSha3256,
    cryptoSha3256ToBuffer,
    cryptoSha3384,
    cryptoSha3384ToBuffer,
    cryptoSha3512,
    cryptoSha3512ToBuffer,
} from '../src/crypto-hash';

describe.each([
    {
        expected: '098f6bcd4621d373cade4e832627b4f6',
        hash: cryptoMd5,
        name: 'cryptoMd5',
        raw: cryptoMd5ToBuffer,
    },
    {
        expected: '3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b',
        hash: cryptoSha3224,
        name: 'cryptoSha3224',
        raw: cryptoSha3224ToBuffer,
    },
    {
        expected: '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80',
        hash: cryptoSha3256,
        name: 'cryptoSha3256',
        raw: cryptoSha3256ToBuffer,
    },
    {
        expected: 'e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd',
        hash: cryptoSha3384,
        name: 'cryptoSha3384',
        raw: cryptoSha3384ToBuffer,
    },
    {
        // eslint-disable-next-line style/max-len -- Keep the fixed reference digest intact.
        expected: '9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14',
        hash: cryptoSha3512,
        name: 'cryptoSha3512',
        raw: cryptoSha3512ToBuffer,
    },
])(
    '$name',
    ({
        expected,
        hash,
        raw,
    }) => {
        it('should produce the known hexadecimal digest and raw bytes', ({ expect }) => {
            expect(hash('test')).toBe(expected);
            expect(raw('test')).toEqual(Buffer.from(expected, 'hex'));
        });

        it('should accept a byte view without hashing bytes outside its offset and length', ({ expect }) => {
            const bytes = Buffer.from('!test!');
            const view = bytes.subarray(1, 5);

            expect(hash(view)).toBe(expected);
            expect(raw(view)).toEqual(Buffer.from(expected, 'hex'));
        });

        it('should use the requested output encoding', ({ expect }) => {
            expect(hash('test', 'base64')).toBe(Buffer.from(expected, 'hex').toString('base64'));
        });
    },
);
