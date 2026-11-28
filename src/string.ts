// Alternation instead of a character class: V8 fails to match `[\p{...}]$` against supplementary-plane characters.
/* eslint-disable regexp/prefer-character-class */
const cjkEndRegExp = /(?:\p{Script=Bopomofo}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})$/u;
const cjkStartRegExp = /^(?:\p{Script=Bopomofo}|\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana})/u;
/* eslint-enable regexp/prefer-character-class */

const latinEndRegExp = /[\da-z]$/i;
const latinStartRegExp = /^[\da-z]/i;

/**
 * Inserts a space at each joint where a CJK character meets an ASCII letter or digit. CJK characters are Han,
 * Hiragana, Katakana, and Bopomofo; Hangul is excluded because Korean already separates words with spaces. Only the
 * characters on each side of a joint are checked; spacing inside each part is left unchanged. Empty parts are skipped
 * without affecting the joints around them.
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
