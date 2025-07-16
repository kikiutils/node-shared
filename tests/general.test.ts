import {
    describe,
    it,
} from 'vitest';

import { extractFirstValue } from '../src/general';

describe.concurrent('extractFirstValue', () => {
    it('should return the first element of an array', ({ expect }) => {
        const input = [
            1,
            2,
        ];

        const result = extractFirstValue(input);

        expect(result).toBe(1);
    });

    it('should return the value itself if it is not an array', ({ expect }) => {
        const input = 42;
        const result = extractFirstValue(input);

        expect(result).toBe(42);
    });

    it('should return undefined if the array is empty and no default value is provided', ({ expect }) => {
        const input: number[] = [];
        const result = extractFirstValue(input);

        expect(result).toBeUndefined();
    });

    it('should return the default value if the array is empty and default value is provided', ({ expect }) => {
        const input: number[] = [];
        const defaultValue = 100;
        const result = extractFirstValue(input, defaultValue);

        expect(result).toBe(defaultValue);
    });

    it('should return the first element if the array is non-empty, ignoring default value', ({ expect }) => {
        const input = [
            'a',
            'b',
        ];

        const defaultValue = 'z';
        const result = extractFirstValue(input, defaultValue);

        expect(result).toBe('a');
    });

    it('should return the value itself if it is not an array, even if default value is provided', ({ expect }) => {
        const input = 'test';
        const defaultValue = 'default';
        const result = extractFirstValue(input, defaultValue);

        expect(result).toBe('test');
    });

    it('should return default value if value is null or undefined', ({ expect }) => {
        const input: undefined = undefined;
        const defaultValue = 'default';
        const result = extractFirstValue(input, defaultValue);

        expect(result).toBe(defaultValue);
    });
});
