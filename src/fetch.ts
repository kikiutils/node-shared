import { Dict } from './types';

type RequestData = FormData | Dict<any>;

export async function request(url: string, method: string, params: Dict<any> = {}, data: RequestData = {}, config: RequestInit = {}) {
	const urlObject = new URL(url);
	for (const name in params) urlObject.searchParams.append(name, params[name]);
	const options: RequestInit = {
		method,
		...config
	};

	if (!['get', 'head'].includes(method.toLowerCase())) options.body = data as BodyInit;
	return await fetch(urlObject.toString(), options);
}

/**
 * Use delete method request.
 */
export const useDelete = async (url: string, params: Dict<any> = {}, config: RequestInit = {}) => {
	return await request(url, 'delete', params, {}, config);
};

/**
 * Use delete method request (return text).
 */
export const $useDelete = async (url: string, params: Dict<any> = {}, config: RequestInit = {}) => {
	return await (await useDelete(url, params, config)).text();
};

/**
 * Use get method request.
 */
export const useGet = async (url: string, params: Dict<any> = {}, config: RequestInit = {}) => {
	return await request(url, 'get', params, {}, config);
};

/**
 * Use get method request (return text).
 */
export const $useGet = async (url: string, params: Dict<any> = {}, config: RequestInit = {}) => {
	return await (await useGet(url, params, config)).text();
};

/**
 * Use patch method request.
 */
export const usePatch = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await request(url, 'patch', {}, data, config);
};

/**
 * Use patch method request (return text).
 */
export const $usePatch = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await (await usePatch(url, data, config)).text();
};

/**
 * Use post method request.
 */
export const usePost = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await request(url, 'post', {}, data, config);
};

/**
 * Use post method request (return text).
 */
export const $usePost = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await (await usePost(url, data, config)).text();
};

/**
 * Use put method request.
 */
export const usePut = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await request(url, 'put', {}, data, config);
};

/**
 * Use put method request (return text).
 */
export const $usePut = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await (await usePut(url, data, config)).text();
};
