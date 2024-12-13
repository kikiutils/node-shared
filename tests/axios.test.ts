import {
    $axiosDelete,
    $axiosGet,
    $axiosPatch,
    $axiosPost,
    $axiosPut,
    axiosDelete,
    axiosGet,
    axiosInstance,
    axiosPatch,
    axiosPost,
    axiosPut,
    axiosRequest,
} from '../src/axios';

const mockConfig = { headers: { 'Content-Type': 'application/json' } };
const mockData = { key: 'value' };
const mockParams = { param1: 'value1' };
const mockResponse = { data: 'mocked data' };
const mockURL = '/mock-url';

describe('http utility functions', () => {
    beforeEach(() => axiosInstance.request = jest.fn().mockResolvedValue(mockResponse));
    // DELETE
    it('should make a DELETE request using axiosDelete', async () => {
        await axiosDelete(mockURL, mockParams, mockConfig);
        expect(axiosInstance.request).toHaveBeenCalledWith({
            ...mockConfig,
            data: {},
            method: 'delete',
            params: mockParams,
            url: mockURL,
        });
    });

    it('should return data directly from DELETE request using $axiosDelete', async () => {
        const data = await $axiosDelete(mockURL, mockParams, mockConfig);
        expect(data).toBe(mockResponse.data);
    });

    // GET
    it('should make a GET request using axiosGet', async () => {
        await axiosGet(mockURL, mockParams, mockConfig);
        expect(axiosInstance.request).toHaveBeenCalledWith({
            ...mockConfig,
            data: {},
            method: 'get',
            params: mockParams,
            url: mockURL,
        });
    });

    it('should return data directly from GET request using $axiosGet', async () => {
        const result = await $axiosGet(mockURL, mockParams, mockConfig);
        expect(result).toBe(mockResponse.data);
    });

    // PATCH
    it('should make a PATCH request using axiosPatch', async () => {
        await axiosPatch(mockURL, mockData, mockConfig);
        expect(axiosInstance.request).toHaveBeenCalledWith({
            ...mockConfig,
            data: mockData,
            method: 'patch',
            params: {},
            url: mockURL,
        });
    });

    it('should return data directly from PATCH request using $axiosPatch', async () => {
        const result = await $axiosPatch(mockURL, mockData, mockConfig);
        expect(result).toBe(mockResponse.data);
    });

    // POST
    it('should make a POST request using axiosPost', async () => {
        await axiosPost(mockURL, mockData, mockConfig);
        expect(axiosInstance.request).toHaveBeenCalledWith({
            ...mockConfig,
            data: mockData,
            method: 'post',
            params: {},
            url: mockURL,
        });
    });

    it('should return data directly from POST request using $axiosPost', async () => {
        const result = await $axiosPost(mockURL, mockData, mockConfig);
        expect(result).toBe(mockResponse.data);
    });

    // PUT
    it('should make a PUT request using axiosPut', async () => {
        await axiosPut(mockURL, mockData, mockConfig);
        expect(axiosInstance.request).toHaveBeenCalledWith({
            ...mockConfig,
            data: mockData,
            method: 'put',
            params: {},
            url: mockURL,
        });
    });

    it('should return data directly from PUT request using $axiosPut', async () => {
        const result = await $axiosPut(mockURL, mockData, mockConfig);
        expect(result).toBe(mockResponse.data);
    });

    // request
    it('should make a PUT request using axiosRequest', async () => {
        await axiosRequest(mockURL, 'put', mockParams, mockData, mockConfig);
        expect(axiosInstance.request).toHaveBeenCalledWith({
            ...mockConfig,
            data: mockData,
            method: 'put',
            params: mockParams,
            url: mockURL,
        });
    });
});
