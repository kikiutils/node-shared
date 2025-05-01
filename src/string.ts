export type RandomStringMode =
  | 'alphabetic'
  | 'alphanumeric'
  | 'lowercase'
  | 'lowercase-numeric'
  | 'numeric'
  | 'uppercase'
  | 'uppercase-numeric';

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
 * Generates a random string of a given length using a specified character set.
 *
 * @param {number} length - The length of the string to generate. Must be a positive integer.
 * @param {RandomStringMode} [mode] - The character set to use.
 *
 * @returns {string} The generated random string.
 *
 * @throws {Error} If the length is not a positive integer or the mode is unsupported.
 *
 * @example
 * ```typescript
 * import { randomString } from '@kikiutils/shared/string';
 *
 * console.log(randomString(8)); // e.g. 'aZbXwTyQ' (alphabetic)
 * console.log(randomString(6, 'numeric')); // e.g. '402398'
 * console.log(randomString(10, 'alphanumeric')); // e.g. 'a9Z4pQ8xY2'
 * ```
 */
export function randomString(length: number, mode: RandomStringMode = 'alphabetic') {
    if (!Number.isInteger(length) || length <= 0) {
        throw new Error(`Invalid length: ${length}. Must be a positive integer.`);
    }

    const charset = CHARSETS[mode];
    if (!charset) throw new Error(`Unsupported mode: ${mode}`);
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}
