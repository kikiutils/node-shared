export type RandomStringMode = | 'alphabetic'
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
 * Generates a random string of specified length and character type.
 *
 * @param {number} [length] - Length of the generated string.
 * @param {RandomStringMode} [mode]
 * @returns {string} The generated random string.
 */
export function randomString(length: number, mode: RandomStringMode = 'alphabetic') {
    if (!Number.isInteger(length) || length <= 0) throw new Error(`Invalid length: ${length}. Must be a positive integer.`);
    const charset = CHARSETS[mode];
    if (!charset) throw new Error(`Unsupported mode: ${mode}`);
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
}
