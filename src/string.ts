/**
 * Generates a random alphabetic string of the specified length, with both upper and lower case letters.
 *
 * @param {number} [length] - The length of the generated string. Defaults to 8.
 * @returns {string} The generated random alphabetic string.
 *
 * @example
 * ```typescript
 * import { randomAlphabeticString } from '@kikiutils/node/string';
 *
 * const randomString = randomAlphabeticString(10);
 * console.log(randomString); // Output: A random string of 10 alphabetic characters, e.g., 'aBcDeFgHiJ'
 * ```
 */
export const randomAlphabeticString = (length: number = 8) => Array.from({ length }, () => String.fromCharCode((Math.random() > 0.5 ? 97 : 65) + Math.floor(Math.random() * 26))).join('');

/**
 * Generates a random lower case alphabetic string of the specified length.
 *
 * @param {number} [length] - The length of the generated string. Defaults to 8.
 * @returns {string} The generated random lower case alphabetic string.
 *
 * @example
 * ```typescript
 * import { randomAlphabeticString } from '@kikiutils/node/string';
 *
 * const randomLowerString = randomLowerCaseAlphabeticString(10);
 * console.log(randomLowerString); // Output: A random string of 10 lower case alphabetic characters, e.g., 'abcdefghij'
 * ```
 */
export const randomLowerCaseAlphabeticString = (length: number = 8) => Array.from({ length }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('');
