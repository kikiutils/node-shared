import {
    describe,
    it,
} from 'vitest';

import { generateWithNestedRandomLength } from '@/random';

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
});
