import {
    describe,
    it,
} from 'vitest';

import { joinCjkText } from '../src/string';

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
