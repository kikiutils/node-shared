import { Buffer } from 'node:buffer';

import {
    describe,
    it,
} from 'vitest';

import {
    cryptoMd5,
    cryptoSha256,
    cryptoSha3224,
    cryptoSha3256,
    cryptoSha3384,
    cryptoSha3512,
} from '../src/crypto-hash';

describe.each([
    {
        expected: '098f6bcd4621d373cade4e832627b4f6',
        hash: cryptoMd5,
        name: 'cryptoMd5',
    },
    {
        expected: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        hash: cryptoSha256,
        name: 'cryptoSha256',
    },
    {
        expected: '3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b',
        hash: cryptoSha3224,
        name: 'cryptoSha3224',
    },
    {
        expected: '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80',
        hash: cryptoSha3256,
        name: 'cryptoSha3256',
    },
    {
        expected: 'e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd',
        hash: cryptoSha3384,
        name: 'cryptoSha3384',
    },
    {
        expected: '9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14',
        hash: cryptoSha3512,
        name: 'cryptoSha3512',
    },
])(
    '$name',
    ({ expected, hash }) => {
        it('should produce the known hexadecimal digest and raw bytes', ({ expect }) => {
            expect(hash('test')).toBe(expected);
            expect(hash('test', 'buffer')).toEqual(Buffer.from(expected, 'hex'));
        });
    },
);

describe('crypto hash input and output handling', () => {
    const expected = '098f6bcd4621d373cade4e832627b4f6';

    it('should accept a byte view without hashing bytes outside its offset and length', ({ expect }) => {
        expect(cryptoMd5(Buffer.from('!test!').subarray(1, 5))).toBe(expected);
    });

    it('should hash an ArrayBuffer, which Node hash functions reject directly', ({ expect }) => {
        const bytes = Buffer.from('test');

        expect(cryptoMd5(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength))).toBe(expected);
    });

    it('should use the requested output encoding', ({ expect }) => {
        expect(cryptoMd5('test', 'base64')).toBe(Buffer.from(expected, 'hex').toString('base64'));
    });
});
