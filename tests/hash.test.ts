import {
    describe,
    it,
} from 'vitest';

import {
    sha3224,
    sha3256,
    sha3384,
    sha3512,
} from '../src/hash';

const testData = 'test';

describe.concurrent('sha3224', () => {
    it('should generate correct string hash', ({ expect }) => {
        expect(sha3224(testData)).toBe('3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b');
    });
});

describe.concurrent('sha3256', () => {
    it('should generate correct string hash', ({ expect }) => {
        expect(sha3256(testData)).toBe('36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80');
    });
});

describe.concurrent('sha3384', () => {
    it('should generate correct string hash', ({ expect }) => {
        expect(sha3384(testData)).toBe(
            'e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd',
        );
    });
});

describe.concurrent('sha3512', () => {
    it('should generate correct string hash', ({ expect }) => {
        // eslint-disable-next-line style/max-len
        expect(sha3512(testData)).toBe('9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14');
    });
});
