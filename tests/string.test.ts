import { randomAlphabeticString, randomLowerCaseAlphabeticString } from '../src/string';

describe('randomAlphabeticString', () => {
	it('should generate a string of default length (8)', () => {
		const result = randomAlphabeticString();
		expect(result).toHaveLength(8);
		expect(/^[a-zA-Z]+$/.test(result)).toBe(true);
	});

	it('should generate a string of specified length', () => {
		const length = 12;
		const result = randomAlphabeticString(length);
		expect(result).toHaveLength(length);
		expect(/^[a-zA-Z]+$/.test(result)).toBe(true);
	});

	it('should generate different strings on subsequent calls', () => {
		const result1 = randomAlphabeticString();
		const result2 = randomAlphabeticString();
		expect(result1).not.toBe(result2);
	});
});

describe('randomLowerCaseAlphabeticString', () => {
	it('should generate a string of default length (8)', () => {
		const result = randomLowerCaseAlphabeticString();
		expect(result).toHaveLength(8);
		expect(/^[a-z]+$/.test(result)).toBe(true);
	});

	it('should generate a string of specified length', () => {
		const length = 15;
		const result = randomLowerCaseAlphabeticString(length);
		expect(result).toHaveLength(length);
		expect(/^[a-z]+$/.test(result)).toBe(true);
	});

	it('should generate different strings on subsequent calls', () => {
		const result1 = randomLowerCaseAlphabeticString();
		const result2 = randomLowerCaseAlphabeticString();
		expect(result1).not.toBe(result2);
	});
});
