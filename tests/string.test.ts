import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import {
    joinCjkText,
    randomString,
} from '../src/string';
import type { RandomStringMode } from '../src/string';

afterEach(() => {
    vi.restoreAllMocks();
});

describe('joinCjkText', () => {
    it.for([
        {
            expected: '新增 IP 存取規則',
            name: 'a Han character followed by a Latin letter',
            parts: [
                '新增',
                'IP 存取規則',
            ],
        },
        {
            expected: 'IP 存取',
            name: 'a Latin letter followed by a Han character',
            parts: [
                'IP',
                '存取',
            ],
        },
        {
            expected: '共 3 筆',
            name: 'digits between Han characters',
            parts: [
                '共',
                '3',
                '筆',
            ],
        },
        {
            expected: 'ログイン ID',
            name: 'Katakana followed by a Latin letter',
            parts: [
                'ログイン',
                'ID',
            ],
        },
        {
            expected: '𠀋 A',
            name: 'a supplementary-plane Han character',
            parts: [
                '𠀋',
                'A',
            ],
        },
        {
            expected: '한국어A',
            name: 'Hangul followed by a Latin letter',
            parts: [
                '한국어',
                'A',
            ],
        },
        {
            expected: '刪除帳號',
            name: 'two Han characters',
            parts: [
                '刪除',
                '帳號',
            ],
        },
        {
            expected: 'ab',
            name: 'two Latin letters',
            parts: [
                'a',
                'b',
            ],
        },
        {
            expected: '新增 IP',
            name: 'empty parts between joints',
            parts: [
                '',
                '新增',
                '',
                'IP',
                '',
            ],
        },
        {
            expected: '新增：IP',
            name: 'punctuation at the joint',
            parts: [
                '新增：',
                'IP',
            ],
        },
    ])(
        'should handle $name',
        (
            {
                expected,
                parts,
            },
            { expect },
        ) => {
            expect(joinCjkText(...parts)).toBe(expected);
        },
    );

    it('should return an empty string without parts', ({ expect }) => {
        expect(joinCjkText()).toBe('');
    });
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
