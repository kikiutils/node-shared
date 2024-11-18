import { Buffer } from 'node:buffer';

import * as cryptoHash from '../src/crypto-hash';

describe('crypto hash functions', () => {
	const testData = 'test';
	it('should generate correct MD5 hash', () => {
		expect(cryptoHash.cryptoMD5(testData)).toBe('098f6bcd4621d373cade4e832627b4f6');
		expect(cryptoHash.cryptoMD5ToBuffer(testData)).toEqual(Buffer.from('098f6bcd4621d373cade4e832627b4f6', 'hex'));
	});

	it('should generate correct SHA-3-224 hash', () => {
		expect(cryptoHash.cryptoSHA3224(testData)).toBe('3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b');
		expect(cryptoHash.cryptoSHA3224ToBuffer(testData)).toEqual(Buffer.from('3797bf0afbbfca4a7bbba7602a2b552746876517a7f9b7ce2db0ae7b', 'hex'));
	});

	it('should generate correct SHA-3-256 hash', () => {
		expect(cryptoHash.cryptoSHA3256(testData)).toBe('36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80');
		expect(cryptoHash.cryptoSHA3256ToBuffer(testData)).toEqual(Buffer.from('36f028580bb02cc8272a9a020f4200e346e276ae664e45ee80745574e2f5ab80', 'hex'));
	});

	it('should generate correct SHA-3-384 hash', () => {
		expect(cryptoHash.cryptoSHA3384(testData)).toBe('e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd');
		expect(cryptoHash.cryptoSHA3384ToBuffer(testData)).toEqual(Buffer.from('e516dabb23b6e30026863543282780a3ae0dccf05551cf0295178d7ff0f1b41eecb9db3ff219007c4e097260d58621bd', 'hex'));
	});

	it('should generate correct SHA-3-512 hash', () => {
		expect(cryptoHash.cryptoSHA3512(testData)).toBe('9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14');
		expect(cryptoHash.cryptoSHA3512ToBuffer(testData)).toEqual(Buffer.from('9ece086e9bac491fac5c1d1046ca11d737b92a2b2ebd93f005d7b710110c0a678288166e7fbe796883a4f2e9b3ca9f484f521d0ce464345cc1aec96779149c14', 'hex'));
	});
});
