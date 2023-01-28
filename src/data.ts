import { random, shuffle } from 'lodash';
import { sleep } from 'sleep-ts';

import { AesCrypt } from './aes';
import { request } from './fetch';
import { randomStr } from './string';
import { Dict } from './typing';
import { getUUID } from './uuid';

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
		for(const d of decryptedData) data[d[0]] = d[1];
		return data;
	}

	async request(
		url: string,
		data: Dict<any> = {},
		files: Dict<Blob | File> = {},
		method = 'post',
		dataAddUUID = false,
		waitForSuccess = true,
		requestConfig: RequestInit = {}
	) {
		if (!url.match(/https?:\/\//)) url = `${this.apiBaseUrl}${url}`;
		if (dataAddUUID) data.uuid = getUUID();

		const formData = new FormData();
		for (const f in files) formData.append(f, files[f]);
		const hashFile = new Blob([this.hashData(data)]);
		formData.append('hash_file', hashFile, 'hash_file');

		while (true) {
			try {
				const response = await request(
					url,
					method,
					{},
					formData,
					requestConfig
				);

				let result: Blob | Dict<any> | null = null;
				if (response.status > 210) throw new Error();
				const contentType = response.headers.get('content-type');

				if (contentType?.includes('text/')) {
					result = this.processHashData(await response.text());
				} else {
					result = await response.blob();
				}

				if (result?.constructor === Object) {
					if (!result.success && waitForSuccess) throw new Error();
				} else if (result === null && waitForSuccess) {
					throw new Error();
				}

				return result;
			} catch(_) {
				if (!waitForSuccess) return null;
				await sleep(1000);
			}
		}
	}
}
