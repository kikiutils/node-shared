import { flattenToSingleValue } from '../src';

describe('flattenToSingleValue', () => {
	test('should return the first element of an array', () => {
		const value = [1, 2];
		expect(flattenToSingleValue(value)).toBe(1);
	});

	test('should return the value itself if it is not an array', () => {
		const value = 42;
		expect(flattenToSingleValue(value)).toBe(42);
	});

	test('should return undefined if the array is empty and no default value is provided', () => {
		const value: number[] = [];
		expect(flattenToSingleValue(value)).toBeUndefined();
	});

	test('should return the default value if the array is empty and default value is provided', () => {
		const value: number[] = [];
		const defaultValue = 100;
		expect(flattenToSingleValue(value, defaultValue)).toBe(defaultValue);
	});

	test('should return the first element if the array is non-empty, ignoring default value', () => {
		const value = ['a', 'b'];
		const defaultValue = 'z';
		expect(flattenToSingleValue(value, defaultValue)).toBe('a');
	});

	test('should return the value itself if it is not an array, even if default value is provided', () => {
		const value = 'test';
		const defaultValue = 'default';
		expect(flattenToSingleValue(value, defaultValue)).toBe('test');
	});

	test('should return default value if value is null or undefined', () => {
		const value: undefined = undefined;
		const defaultValue = 'default';
		expect(flattenToSingleValue(value, defaultValue)).toBe(defaultValue);
	});
});
