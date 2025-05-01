import { randomString } from '../src/string';
import type { RandomStringMode } from '../src/string';

describe('randomString', () => {
    const DIGITS = '0123456789';
    const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
    const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const CHARSETS: Record<RandomStringMode, string> = {
        'alphabetic': LOWERCASE + UPPERCASE,
        'alphanumeric': DIGITS + LOWERCASE + UPPERCASE,
        'lowercase': LOWERCASE,
        'lowercase-numeric': DIGITS + LOWERCASE,
        'numeric': DIGITS,
        'uppercase': UPPERCASE,
        'uppercase-numeric': DIGITS + UPPERCASE,
    };

    it('should generate a string of the specified length', () => {
        const result = randomString(10);
        expect(result).toHaveLength(10);
    });

    Object.entries(CHARSETS).forEach(([mode, charset]) => {
        it(`should generate a valid ${mode} string of correct length`, () => {
            const result = randomString(20, mode as RandomStringMode);
            expect(result).toHaveLength(20);
            for (const char of result) expect(charset).toContain(char);
        });
    });

    it('should throw if length is zero', () => {
        expect(() => randomString(0)).toThrow('Invalid length: 0. Must be a positive integer.');
    });

    it('should throw if length is negative', () => {
        expect(() => randomString(-5)).toThrow('Invalid length: -5. Must be a positive integer.');
    });

    it('should throw if length is not an integer', () => {
        expect(() => randomString(4.5)).toThrow('Invalid length: 4.5. Must be a positive integer.');
    });

    it('should throw if mode is unsupported', () => {
        expect(() => randomString(5, 'invalid-mode' as any)).toThrow('Unsupported mode: invalid-mode');
    });
});
