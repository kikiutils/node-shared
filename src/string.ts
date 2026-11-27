// Alternation instead of a character class: V8 fails to match `[\p{...}]$` against supplementary-plane characters.
/* eslint-disable regexp/prefer-character-class */
const cjkEndRegExp = /(?:\p{Script=Bopomofo}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})$/u;
const cjkStartRegExp = /^(?:\p{Script=Bopomofo}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})/u;
/* eslint-enable regexp/prefer-character-class */

const latinEndRegExp = /[\da-z]$/i;
const latinStartRegExp = /^[\da-z]/i;

/**
 * Joins text parts, inserting a space where a CJK character meets an ASCII letter or digit at a joint.
 *
 * @remarks
 * CJK characters are Han, Hiragana, Katakana, and Bopomofo; Hangul is excluded because Korean already separates words
 * with spaces. Only the characters on each side of a joint are checked; spacing inside each part is left unchanged.
 * Empty parts are skipped without affecting the joints around them.
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
