import {
    describe,
    it,
} from 'vitest';

import { generateWithNestedRandomLength } from '../src/random';

describe.concurrent('generateWithNestedRandomLength', () => {
    it('should work with string generator', ({ expect }) => {
        const generator = (len: number) => 'x'.repeat(len);

        for (let i = 0; i < 20; i++) {
            const result = generateWithNestedRandomLength(generator, 10, 20, 30, 40);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThanOrEqual(30);
            expect(result.length).toBeLessThanOrEqual(40);
        }
    });

    it('should work with number[] generator', ({ expect }) => {
        const generator = (len: number) => Array.from({ length: len }, (_, i) => i);

        const result = generateWithNestedRandomLength<number[]>(generator, 5, 5, 10, 10);
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(10);
        expect(result).toEqual([
            0,
            1,
            2,
            3,
            4,
            5,
            6,
            7,
            8,
            9,
        ]);
    });

    it('should work with object generator (returning typed object)', ({ expect }) => {
        const generator = (len: number) => ({
            code: '*'.repeat(len),
            size: len,
        });

        const result = generateWithNestedRandomLength(generator, 8, 8, 12, 12);
        expect(typeof result).toBe('object');
        expect(result.size).toBe(12);
        expect(result.code.length).toBe(12);
    });

    it('should handle equal bounds correctly', ({ expect }) => {
        const generator = (len: number) => len;

        const result = generateWithNestedRandomLength(generator, 10, 10, 10, 10);
        expect(result).toBe(10);
    });

    it('should throw if minMin is greater than minMax', ({ expect }) => {
        const generator = (len: number) => len;

        expect(() => generateWithNestedRandomLength(generator, 20, 10, 30, 40)).toThrow(
            'Invalid range: minMin (20) cannot be greater than minMax (10)',
        );
    });

    it('should throw if maxMin is greater than maxMax', ({ expect }) => {
        const generator = (len: number) => len;

        expect(() => generateWithNestedRandomLength(generator, 10, 20, 40, 30)).toThrow(
            'Invalid range: maxMin (40) cannot be greater than maxMax (30)',
        );
    });
});
