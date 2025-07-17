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
        expect(result).toBe(input[0]);
    });

    it('should return the value itself if it is not an array', ({ expect }) => {
        const input = 42;

        const result = extractFirstValue(input);
        expect(result).toBe(input);
    });

    it('should return undefined if the array is empty and no default value is provided', ({ expect }) => {
        const result = extractFirstValue([]);
        expect(result).toBeUndefined();
    });

    it('should return the default value if the array is empty and default value is provided', ({ expect }) => {
        const defaultValue = 100;

        const result = extractFirstValue([], defaultValue);
        expect(result).toBe(defaultValue);
    });

    it('should return the first element if the array is non-empty, ignoring default value', ({ expect }) => {
        const input = [
            'a',
            'b',
        ];

        const result = extractFirstValue(input, 'z');
        expect(result).toBe(input[0]);
    });

    it('should return the value itself if it is not an array, even if default value is provided', ({ expect }) => {
        const input = 'test';

        const result = extractFirstValue(input, 'default');
        expect(result).toBe(input);
    });

    it('should return default value if value is null or undefined', ({ expect }) => {
        const defaultValue = 'default';

        const result = extractFirstValue(undefined, defaultValue);
        expect(result).toBe(defaultValue);
    });
});
