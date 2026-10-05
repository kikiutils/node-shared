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

describe.each([
    {
        expected: '3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b',
        hash: sha3224,
        name: 'sha3224',
    },
    {
        expected: '36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80',
        hash: sha3256,
        name: 'sha3256',
    },
    {
        expected: 'e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd',
        hash: sha3384,
        name: 'sha3384',
    },
    {
        // eslint-disable-next-line style/max-len -- Keep the fixed reference digest intact.
        expected: '9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14',
        hash: sha3512,
        name: 'sha3512',
    },
])(
    '$name',
    ({ expected, hash }) => {
        it('should produce the known hexadecimal digest for text and raw bytes', ({ expect }) => {
            expect(hash('test')).toBe(expected);
            expect(hash(new TextEncoder().encode('test'))).toBe(expected);
        });
    },
);

describe('sha3256', () => {
    describe('unicode input', () => {
        it('should hash Unicode text as UTF-8 rather than UTF-16 code units', ({ expect }) => {
            expect(sha3256('世界')).toBe('cd055ec40460aa5c58e3bbeeff26a75f91bc739ba79e95af7a8cc804f8ad3645');
        });
    });
});
