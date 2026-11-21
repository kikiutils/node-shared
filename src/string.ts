/**
 * Character-set presets supported by `randomString`.
 */
export type RandomStringMode =
  | 'alphabetic'
  | 'alphanumeric'
  | 'lowercase'
  | 'lowercase-numeric'
  | 'numeric'
  | 'uppercase'
  | 'uppercase-numeric';

// Alternation instead of a character class: V8 fails to match `[\p{...}]$` against supplementary-plane characters.
/* eslint-disable regexp/prefer-character-class */
const cjkEndRegExp = /(?:\p{Script=Bopomofo}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})$/u;
const cjkStartRegExp = /^(?:\p{Script=Bopomofo}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})/u;
/* eslint-enable regexp/prefer-character-class */

const latinEndRegExp = /[\da-z]$/i;
const latinStartRegExp = /^[\da-z]/i;

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

/**
 * Joins text parts, inserting a space where a CJK character meets an ASCII letter or digit at a joint.
 *
 * @remarks
 * CJK characters are Han, Hiragana, Katakana, and Bopomofo; Hangul is excluded because Korean already separates words
 * with spaces. Only the characters on each side of a joint are checked; spacing inside each part is left unchanged.
 * Empty parts are skipped without affecting the joints around them.
 *
 * @param parts - The text parts to join, in order.
 *
 * @returns The joined text.
 *
 * @example
 *
 * ```ts
 * import { joinCjkText } from '@kikiutils/shared/string';
 *
 * console.log(joinCjkText('新增', 'IP 存取規則')); // => '新增 IP 存取規則'
 * console.log(joinCjkText('刪除', '帳號')); // => '刪除帳號'
 * ```
 */
export function joinCjkText(...parts: string[]) {
    return parts.reduce(
        (text, part) => {
            const needsSpace = (cjkEndRegExp.test(text) && latinStartRegExp.test(part))
              || (latinEndRegExp.test(text) && cjkStartRegExp.test(part));

            return needsSpace ? `${text} ${part}` : text + part;
        },
        '',
    );
}

/**
 * Generates a random string of a given length using a predefined character set.
 *
 * @remarks
 * Uses `Math.random`, so this helper is suitable for display tokens, placeholders,
 * and test data, but not for passwords, API keys, or other cryptographic secrets.
 *
 * @param length - The positive integer length of the string to generate.
 * @param mode - The character set to use (default: `'alphabetic'`).
 *
 * @returns The generated random string.
 *
 * @throws Error if the length is not a positive integer or the mode is unsupported.
 *
 * @example
 *
 * ```ts
 * import { randomString } from '@kikiutils/shared/string';
 *
 * randomString(8); // For example, 'aZbXwTyQ'.
 * randomString(6, 'numeric'); // For example, '402398'.
 * randomString(10, 'alphanumeric'); // For example, 'a9Z4pQ8xY2'.
 * ```
 */
export function randomString(length: number, mode: RandomStringMode = 'alphabetic') {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error(`Invalid length: ${length}. Must be a positive integer`);
    }

    const charset = CHARSETS[mode];
    if (!charset) throw new Error(`Unsupported mode: ${mode}`);
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}
