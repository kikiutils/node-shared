import { millify } from 'millify';

import { prettyNumberToString } from '../src/number';

jest.mock('millify');

describe('prettyNumberToString', () => {
	beforeEach(() => jest.clearAllMocks());
	it('should convert a large number to a readable string using millify with default options', () => {
		(millify as jest.Mock).mockReturnValue('1.23m');
		const result = prettyNumberToString(1234567);
		expect(result).toBe('1.23m');
		expect(millify).toHaveBeenCalledWith(1234567, { lowercase: true, precision: 2 });
	});

	it('should apply custom options to millify', () => {
		(millify as jest.Mock).mockReturnValue('1.235m');
		const result = prettyNumberToString(1234567, { precision: 3 });
		expect(result).toBe('1.235m');
		expect(millify).toHaveBeenCalledWith(1234567, { lowercase: true, precision: 3 });
	});

	it('should handle smaller numbers correctly', () => {
		(millify as jest.Mock).mockReturnValue('123');
		const result = prettyNumberToString(123);
		expect(result).toBe('123');
		expect(millify).toHaveBeenCalledWith(123, { lowercase: true, precision: 2 });
	});

	it('should handle large numbers with custom options', () => {
		(millify as jest.Mock).mockReturnValue('1.235B');
		const result = prettyNumberToString(1234567890, { precision: 3 });
		expect(result).toBe('1.235B');
		expect(millify).toHaveBeenCalledWith(1234567890, { lowercase: true, precision: 3 });
	});
});
