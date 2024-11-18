/**
 * This file provides utility functions for making HTTP requests using Axios.
 * It includes types and helper methods to facilitate various HTTP methods (GET, POST, PUT, PATCH, DELETE).
 * The main functions are:
 * - `axiosRequest`: A generic function to make a customizable Axios request.
 * - Specific methods for each HTTP verb (`axiosGet`, `axiosPost`, `axiosPut`, `axiosPatch`, `axiosDelete`),
 *   and their shorthand variants (`$axiosGet`, `$axiosPost`, `$axiosPut`, `$axiosPatch`, `$axiosDelete`),
 *   which directly return the `data` property from the response.
 */

import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, Method } from 'axios';

export { AxiosError } from 'axios';

export type AxiosRequestData = AxiosRequestParams | FormData;
export type AxiosRequestParams = Record<number | string, any>;

export const axiosInstance: AxiosInstance = axios.create({});
export const axiosDelete = async <T = string>(url: string, params?: AxiosRequestParams, config?: AxiosRequestConfig) => await axiosRequest<T>(url, 'delete', params, {}, config);
export const $axiosDelete = async <T = string>(url: string, params?: AxiosRequestParams, config?: AxiosRequestConfig) => (await axiosDelete<T>(url, params, config)).data;
export const axiosGet = async <T = any>(url: string, params?: AxiosRequestParams, config?: AxiosRequestConfig) => await axiosRequest<T>(url, 'get', params, {}, config);
export const $axiosGet = async <T = any>(url: string, params?: AxiosRequestParams, config?: AxiosRequestConfig) => (await axiosGet<T>(url, params, config)).data;
export const axiosPatch = async <T = string>(url: string, data?: AxiosRequestData, config?: AxiosRequestConfig<AxiosRequestData>) => await axiosRequest<T>(url, 'patch', {}, data, config);
export const $axiosPatch = async <T = string>(url: string, data?: AxiosRequestData, config?: AxiosRequestConfig<AxiosRequestData>) => (await axiosPatch<T>(url, data, config)).data;
export const axiosPost = async <T = string>(url: string, data?: AxiosRequestData, config?: AxiosRequestConfig<AxiosRequestData>) => await axiosRequest<T>(url, 'post', {}, data, config);
export const $axiosPost = async <T = string>(url: string, data?: AxiosRequestData, config?: AxiosRequestConfig<AxiosRequestData>) => (await axiosPost<T>(url, data, config)).data;
export const axiosPut = async <T = string>(url: string, data?: AxiosRequestData, config?: AxiosRequestConfig<AxiosRequestData>) => await axiosRequest<T>(url, 'put', {}, data, config);
export const $axiosPut = async <T = string>(url: string, data?: AxiosRequestData, config?: AxiosRequestConfig<AxiosRequestData>) => (await axiosPut<T>(url, data, config)).data;

export async function axiosRequest<T = any, R extends AxiosResponse<T> = AxiosResponse<T>, D extends AxiosRequestData = any>(url: string, method: Method, params?: AxiosRequestData, data?: D, config?: AxiosRequestConfig) {
	return await axiosInstance.request<T, R, D>({ ...config, data, method, params, url });
}
