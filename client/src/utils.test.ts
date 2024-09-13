import { fetchData, getTimeElapsedInMinutes } from './utils';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.Mock;

describe('fetchData', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    it('should throw an error if response is not ok', async () => {
        jest.spyOn(console, 'error').mockImplementationOnce(() => {});
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 404,
        });

        await expect(fetchData('https://test.com')).resolves.toBeUndefined();
        expect(console.error).toHaveBeenCalledWith('Fetch Error:', new Error('HTTP Error, Status: 404'));
    });

    it('should return JSON with the data from the server if response is ok', async () => {
        const mockData = { loadAverage: 0.5 };
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValueOnce(mockData),
        });

        const result = await fetchData('https://test.com');
        expect(result).toEqual(mockData);
    });
});

describe('getTimeElapsedInMinutes', () => {
    it('should calculate the time elapsed since a given starting time and now', () => {
        const timeElapsed = getTimeElapsedInMinutes(Date.now() - 120000);
        expect(timeElapsed).toBeGreaterThanOrEqual(2);
    });

    it('should return 0 if not given a starting timestamp', () => {
        const timeElapsed = getTimeElapsedInMinutes();
        expect(timeElapsed).toStrictEqual(0);
    });
});
