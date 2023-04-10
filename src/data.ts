import { random, shuffle } from 'lodash';
import { sleep } from 'sleep-ts';

import { AesCrypt } from './aes';
import { request } from './fetch';
import { randomStr } from './string';
import { Dict } from './typing';
import { getUUID } from './uuid';

interface RequestOptions {
	dataAddUUID?: boolean;
	files?: Dict<Blob | File>;
	method?: 'delete' | 'get' | 'patch' | 'post' | 'put';
	requestConfig?: RequestInit;
	waitForSuccess?: boolean;
}

export class DataTransmission {
	aes?: AesCrypt;
	apiBaseUrl?: string;

	hashData(data: Dict<any>) {
		const randomCount = random(random(2, 5), random(6, 16));

		for (let i = 1; i < randomCount; i++) {
			data[randomStr(random(8, 16), random(17, 128))] = randomStr(
				random(8, 32),
				random(33, 256)
			);
		}

		const dataList = Object.entries(data);
		return this.aes?.encrypt(shuffle(dataList)) || '';
	}

	processHashData(hashText: string) {
		const data: Dict<any> = {};
		const decryptedData: [string, any][] = this.aes?.decrypt(hashText);
		decryptedData.forEach(([k, v]) => data[k] = v);
		return data;
	}

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
				const response = await request(
					url,
					options?.method || 'post',
					{},
					formData,
					options?.requestConfig
				);

				if (response.status > 210) throw new Error();
				const rpIsText = response.headers.get('content-type')?.includes('text/');
				const result = rpIsText ? this.processHashData(await response.text()) : await response.blob();
				if (options.waitForSuccess && (result === null || (result?.constructor === Object && !result.success))) throw new Error();
				return result;
			} catch(_) {
				if (!options.waitForSuccess) return null;
				await sleep(1000);
			}
		}
	}
}
