import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import { randomString } from '../src/string';
import type { RandomStringMode } from '../src/string';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('randomString', () => {
    it('should use the alphabetic character set by default', ({ expect }) => {
        vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValueOnce(1 - Number.EPSILON);

        expect(randomString(2)).toBe('aZ');
    });

    it.for([
        {
            expected: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            mode: 'alphabetic',
        },
        {
            expected: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
            mode: 'alphanumeric',
        },
        {
            expected: 'abcdefghijklmnopqrstuvwxyz',
            mode: 'lowercase',
        },
        {
            expected: '0123456789abcdefghijklmnopqrstuvwxyz',
            mode: 'lowercase-numeric',
        },
        {
            expected: '0123456789',
            mode: 'numeric',
        },
        {
            expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            mode: 'uppercase',
        },
        {
            expected: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            mode: 'uppercase-numeric',
        },
    ] satisfies Array<{ expected: string; mode: RandomStringMode }>)(
        'should select exactly the configured character set for $mode',
        ({ expected, mode }, { expect }) => {
            let index = 0;
            // Sample one value inside every character bucket without relying on chance.
            vi.spyOn(Math, 'random').mockImplementation(() => (index++ + 0.5) / expected.length);

            const result = randomString(expected.length, mode);

            expect(result).toHaveLength(expected.length);
            expect(new Set(result)).toEqual(new Set(expected));
        },
    );

    it('should sample each character and accept a length of one', ({ expect }) => {
        const random = vi.spyOn(Math, 'random').mockReturnValue(0);

        expect(randomString(1, 'numeric')).toBe('0');
        expect(randomString(3, 'numeric')).toBe('000');
        expect(random).toHaveBeenCalledTimes(4);
    });

    it.for([
        0,
        -1,
        1.5,
        Number.NaN,
        Infinity,
    ])(
        'should reject invalid length %s',
        (length, { expect }) => {
            const random = vi.spyOn(Math, 'random');

            expect(() => randomString(length)).toThrow('Must be a positive integer');
            expect(random).not.toHaveBeenCalled();
        },
    );

    it('should reject an unsupported mode before sampling', ({ expect }) => {
        const random = vi.spyOn(Math, 'random');

        // @ts-expect-error Exercise runtime validation of an unsupported mode.
        expect(() => randomString(1, 'invalid-mode')).toThrow('Unsupported mode');
        expect(random).not.toHaveBeenCalled();
    });
});
