/**
 * Custom error class for handling missing environment variables.
 *
 * @extends {Error}
 */
export class EnvironmentNotFoundError extends Error {
	readonly key: string;

	/**
	 * Creates an instance of EnvironmentNotFoundError.
	 *
	 * @param {string} key - The key of the missing environment variable.
	 */
	constructor(key: string) {
		super(`Missing environment variable: ${key}`);
		this.key = key;
		this.name = this.constructor.name;
		Error.captureStackTrace?.(this, this.constructor);
	}
}

/**
 * Checks if an environment variable is set and returns its value.
 *
 * @param {string} key - The key of the environment variable to check.
 * @returns {string} The value of the environment variable.
 * @throws {EnvironmentNotFoundError} If the environment variable is not set.
 *
 * @example
 * ```typescript
 * import { checkAndGetEnvValue } from '@kikiutils/node/env';
 *
 * // Assuming the environment variable 'API_KEY' is set
 * const apiKey = checkAndGetEnvValue('API_KEY');
 * console.log(apiKey); // Output: value of 'API_KEY'
 *
 * // Assuming the environment variable 'API_KEY' is not set
 * try {
 *   const apiKey = checkAndGetEnvValue('API_KEY');
 * } catch (error) {
 *   console.error(error); // Output: Missing environment variable: API_KEY
 * }
 * ```
 */
export const checkAndGetEnvValue = (key: string) => {
	if (!process.env[key]) throw new EnvironmentNotFoundError(key);
	return process.env[key] as string;
};
