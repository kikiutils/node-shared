import r from 'lodash/random';
import shuffle from 'lodash/shuffle';
import { sleep } from 'sleep-ts';

import { AesCrypt } from './aes';
import { request } from './fetch';
import { randomStr } from './random';
import { Dict } from './typing';
import { getUUID } from './uuid';

export interface RequestOptions {
	dataAddUUID?: boolean;
	files?: Dict<Blob | File>;
	method?: 'delete' | 'get' | 'patch' | 'post' | 'put';
	requestConfig?: RequestInit;
	waitForSuccess?: boolean;
}

export class DataTransmission {
	private aes: AesCrypt;
	private apiBaseUrl: string;

	constructor(aes: AesCrypt, apiBaseUrl: string) {
		this.aes = aes;
		this.apiBaseUrl = apiBaseUrl;
	}

	private hashData(data: Dict<any>) {
		const randomCount = r(r(2, 5), r(6, 16));
		for (let i = 1; i < randomCount; i++) data[randomStr(r(8, 16), r(17, 128))] = randomStr(r(8, 32), r(33, 256));
		const dataList = Object.entries(data);
		return this.aes.encrypt(shuffle(dataList)) || '';
	}

	private processHashData(hashText: string) {
		const data: Dict<any> = {};
		const decryptedData: [string, any][] = this.aes.decrypt(hashText);
		decryptedData.forEach(([k, v]) => data[k] = v);
		return data;
	}

	async request(url: string, data: Dict<any>, options: Omit<RequestOptions, 'waitForSuccess'> & { waitForSuccess: false }): Promise<Dict<any> | Blob | null>;
	async request(url: string, data?: Dict<any>, options?: RequestOptions): Promise<Dict<any> | Blob>;
	async request(url: string, data: Dict<any> = {}, options: RequestOptions = {}) {
		if (options.waitForSuccess === undefined) options.waitForSuccess = true;
		if (!url.match(/https?:\/\//)) url = `${this.apiBaseUrl}${url}`;
		if (options.dataAddUUID) data.uuid = await getUUID();
		const formData = new FormData();
		if (options.files) for (const f in options.files) formData.append(f, options.files[f]);
		const hashFile = new Blob([this.hashData(data)]);
		formData.append('hash_file', hashFile, 'hash_file');

		while (true) {
			try {
				const response = await request(url, options?.method || 'post', {}, formData, options?.requestConfig);
				if (response.status > 210) throw new Error();
				const rpIsText = response.headers.get('content-type')?.includes('text/');
				const result = rpIsText ? this.processHashData(await response.text()) : await response.blob();
				if (options.waitForSuccess && (result === null || !(result instanceof Blob || result.success))) throw new Error();
				return result;
			} catch (_) {
				if (!options.waitForSuccess) return null;
				await sleep(1000);
			}
		}
	}
}
