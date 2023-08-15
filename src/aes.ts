import cryptoJs from 'crypto-js';

export type BlockCipherMode = typeof cryptoJs.mode.ECB | typeof cryptoJs.mode.CBC;

export class AesCrypt {
	private config: {
		iv: cryptoJs.lib.WordArray,
		mode: BlockCipherMode,
		padding: typeof cryptoJs.pad.Pkcs7
	};

	private format: typeof cryptoJs.format.Hex;
	private key: cryptoJs.lib.WordArray;

	constructor(key: string, iv: string, mode: BlockCipherMode = cryptoJs.mode.CBC) {
		this.config = {
			iv: cryptoJs.enc.Utf8.parse(iv),
			mode,
			padding: cryptoJs.pad.Pkcs7
		};

		this.format = cryptoJs.format.Hex;
		this.key = cryptoJs.enc.Utf8.parse(key);
	}

	encrypt(data: any) {
		if (typeof data !== 'string') data = JSON.stringify(data);
		return cryptoJs.AES.encrypt(data, this.key, this.config).toString(this.format);
	}

	decrypt(data: string) {
		const cipherParams = this.format.parse(data);
		const decryptedData = cryptoJs.AES.decrypt(cipherParams, this.key, this.config).toString(cryptoJs.enc.Utf8);

		try {
			return JSON.parse(decryptedData);
		} catch (_) {
			return decryptedData;
		}
	}
}

export default AesCrypt;
