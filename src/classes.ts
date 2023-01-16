import { random, shuffle } from 'lodash';
import logger from 'node-color-log';
import { sleep } from 'sleep-ts';
import { v1 as uuidV1 } from 'uuid';
import WebSocket, { ClientOptions } from 'ws';

import { AesCrypt } from './aes';
import { request } from './fetch';
import { randomStr } from './string';
import { IDict } from './typing';

export class DataTransmission {
	aes?: AesCrypt;
	apiBaseUrl?: string;

	hashData(data: IDict<any>) {
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
		const data: IDict<any> = {};
		const decryptedData: [string, any][] = this.aes?.decrypt(hashText);
		for(const d of decryptedData) data[d[0]] = d[1];
		return data;
	}

	async request(
		url: string,
		data: IDict<any> = {},
		files: IDict<Blob | File> = {},
		method = 'post',
		dataAddUUID = false,
		waitForSuccess = true,
		requestConfig: RequestInit = {}
	) {
		if (!url.match(/https?:\/\//)) url = `${this.apiBaseUrl}${url}`;
		if (dataAddUUID) data.uuid = uuidV1();

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

				let result: Blob | IDict<any> | null = null;
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

type eventCallback = (args?: any[], kwargs?: IDict<any>) => void | Promise<void>;

export class WebsocketClient {
	aes: AesCrypt;
	checkInterval: number;
	code: string;
	connectionOptions: ClientOptions;
	disconnecting: boolean;
	eventHandlers: IDict<eventCallback>;
	name: string;
	url: string;
	waitingEvents: IDict<IDict<Promise<any>>>;
	ws?: WebSocket;

	constructor(
		aes: AesCrypt,
		name: string,
		url: string,
		checkInterval = 3000,
		extraData: IDict<any> = {},
		connectionOptions: ClientOptions = {}
	) {
		this.aes = aes;
		this.checkInterval = checkInterval;
		this.code = randomStr();
		this.connectionOptions = {
			headers: {
				'extra-info': this.aes.encrypt(extraData)
			},
			...connectionOptions
		};

		this.disconnecting = false;
		this.eventHandlers = {}
		this.name = name;
		this.url = url;
		this.waitingEvents = {};
	}

	protected async checkConnection() {
		try {
			this.ws?.ping();
			if (this.ws?.readyState != 1) throw new Error();
			setTimeout(() => this.checkConnection(), this.checkInterval);
		} catch(_) {
			logger.error('Websocket connection error.');
			this.connect(true);
		}
	}

	connect(waitForSuccess = false) {
		if (this.disconnecting) return;
		this.ws = new WebSocket(this.url, this.connectionOptions);

		if (waitForSuccess) {
			this.ws.onerror = () => {
				logger.error('Connect websocket error.');
				setTimeout(() => this.connect(true), 1000);
			}
		}

		this.ws.onclose = () => {
			this.disconnecting = false;
		}

		this.ws.onmessage = ({ data }) => {
			const decryptedData = this.aes.decrypt(<string>data);
			const eventName = decryptedData[0];

			if (this.eventHandlers[eventName]) {
				this.eventHandlers[eventName](decryptedData[1], decryptedData[2]);
			}
		}

		this.ws.onopen = () => {
			logger.success('Websocket success connected.');
			this.emit('init', [], { code: this.code });
			this.checkConnection();
		}
	}

	disconnect() {
		this.disconnecting = true;
		this.ws?.close();
	}

	emit(event: string, args: any[] = [], kwargs: IDict<any> = {}) {
		this.ws?.send(this.aes.encrypt([event, args, kwargs]));
	}

	registerEvent(eventName: string, callback: eventCallback) {
		this.eventHandlers[eventName] = callback;
	}
}
