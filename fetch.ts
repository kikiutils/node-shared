import { IDict } from './typing';

type RequestData = FormData | IDict<any>;

export async function request(
	url: string,
	method: string,
	params: IDict<any> = {},
	data: RequestData = {},
	config: RequestInit = {}
) {
	const urlObject = new URL(url);
	for (const name in params) urlObject.searchParams.append(name, params[name]);

	return await fetch(
		urlObject.toString(),
		{
			body: <BodyInit>data,
			method,
			...config
		}
	);
}

/**
 * 使用Delete請求
 */
export const useDelete = async (url: string, params: IDict<any> = {}, config: RequestInit = {}) => {
	return await request(url, 'delete', params, {}, config);
}

export const $useDelete = async (url: string, params: IDict<any> = {}, config: RequestInit = {}) => {
	return await (await useDelete(url, params, config)).text();
}

/**
 * 使用Get請求
 */
export const useGet = async (url: string, params: IDict<any> = {}, config: RequestInit = {}) => {
	return await request(url, 'get', params, {}, config);
}

export const $useGet = async (url: string, params: IDict<any> = {}, config: RequestInit = {}) => {
	return await (await useGet(url, params, config)).text();
}

/**
 * 使用Patch請求
 */
export const usePatch = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await request(url, 'patch', {}, data, config);
}

export const $usePatch = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await (await usePatch(url, data, config)).text();
}

/**
 * 使用Post請求
 */
export const usePost = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await request(url, 'post', {}, data, config);
}

export const $usePost = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await (await usePost(url, data, config)).text();
}

/**
 * 使用Put請求
 */
export const usePut = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await request(url, 'put', {}, data, config);
}

export const $usePut = async (url: string, data: RequestData = {}, config: RequestInit = {}) => {
	return await (await usePut(url, data, config)).text();
}
