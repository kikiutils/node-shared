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
