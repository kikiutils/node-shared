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

const testData = 'test';

describe.concurrent('cryptoMd5', () => {
    const hashResult = '098f6bcd4621d373cade4e832627b4f6';
    it('should generate correct string hash', ({ expect }) => expect(cryptoMd5(testData)).toBe(hashResult));
    it('should generate correct buffer hash', ({ expect }) => {
        expect(cryptoMd5ToBuffer(testData)).toEqual(Buffer.from(hashResult, 'hex'));
    });
});

describe.concurrent('cryptoSha3224', () => {
    const hashResult = '3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b';
    it('should generate correct string hash', ({ expect }) => expect(cryptoSha3224(testData)).toBe(hashResult));
    it('should generate correct buffer hash', ({ expect }) => {
        expect(cryptoSha3224ToBuffer(testData)).toEqual(Buffer.from(hashResult, 'hex'));
    });
});

describe.concurrent('cryptoSha3256', () => {
    const hashResult = '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80';
    it('should generate correct string hash', ({ expect }) => expect(cryptoSha3256(testData)).toBe(hashResult));
    it('should generate correct buffer hash', ({ expect }) => {
        expect(cryptoSha3256ToBuffer(testData)).toEqual(Buffer.from(hashResult, 'hex'));
    });
});

describe.concurrent('cryptoSha3384', () => {
    // eslint-disable-next-line style/max-len
    const hashResult = 'e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd';
    it('should generate correct string hash', ({ expect }) => expect(cryptoSha3384(testData)).toBe(hashResult));
    it('should generate correct buffer hash', ({ expect }) => {
        expect(cryptoSha3384ToBuffer(testData)).toEqual(Buffer.from(hashResult, 'hex'));
    });
});

describe.concurrent('cryptoSha3512', () => {
    // eslint-disable-next-line style/max-len
    const hashResult = '9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14';
    it('should generate correct string hash', ({ expect }) => expect(cryptoSha3512(testData)).toBe(hashResult));
    it('should generate correct buffer hash', ({ expect }) => {
        expect(cryptoSha3512ToBuffer(testData)).toEqual(Buffer.from(hashResult, 'hex'));
    });
});
