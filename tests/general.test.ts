import {
    describe,
    it,
} from 'vitest';

import { extractFirstValue } from '../src/general';

describe.concurrent('extractFirstValue', () => {
    it('should return the first element of an array', ({ expect }) => {
        const value = [
            1,
            2,
        ];

        expect(extractFirstValue(value)).toBe(1);
    });

    it('should return the value itself if it is not an array', ({ expect }) => {
        const value = 42;
        expect(extractFirstValue(value)).toBe(42);
    });

    it('should return undefined if the array is empty and no default value is provided', ({ expect }) => {
        const value: number[] = [];
        expect(extractFirstValue(value)).toBeUndefined();
    });

    it('should return the default value if the array is empty and default value is provided', ({ expect }) => {
        const value: number[] = [];
        const defaultValue = 100;
        expect(extractFirstValue(value, defaultValue)).toBe(defaultValue);
    });

    it('should return the first element if the array is non-empty, ignoring default value', ({ expect }) => {
        const value = [
            'a',
            'b',
        ];

        const defaultValue = 'z';
        expect(extractFirstValue(value, defaultValue)).toBe('a');
    });

    it('should return the value itself if it is not an array, even if default value is provided', ({ expect }) => {
        const value = 'test';
        const defaultValue = 'default';
        expect(extractFirstValue(value, defaultValue)).toBe('test');
    });

    it('should return default value if value is null or undefined', ({ expect }) => {
        const value: undefined = undefined;
        const defaultValue = 'default';
        expect(extractFirstValue(value, defaultValue)).toBe(defaultValue);
    });
});
