/**
 * Custom error class for handling missing environment variables.
 *
 * Extends the built-in `Error` class and includes the missing key.
 *
 * @extends {Error}
 */
export class EnvironmentNotFoundError extends Error {
    readonly key: string;

    /**
     * Creates a new EnvironmentNotFoundError.
     *
     * @param {string} key - The missing environment variable key.
     */
    constructor(key: string) {
        super(`Missing environment variable: ${key}`);
        this.key = key;
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

/**
 * Retrieves the value of an environment variable, or throws an error if not set.
 *
 * @param {string} key - The environment variable key to check.
 * @returns {string} The value of the environment variable.
 * @throws {EnvironmentNotFoundError} If the environment variable is not defined.
 *
 * @example
 * ```typescript
 * import { checkAndGetEnvValue } from '@kikiutils/shared/env';
 *
 * // When the environment variable 'API_KEY' is set:
 * console.log(checkAndGetEnvValue('API_KEY')); // value of API_KEY
 *
 * // When the environment variable 'API_KEY' is not set:
 * try {
 *   const apiKey = checkAndGetEnvValue('API_KEY');
 * } catch (error) {
 *   console.error(error); // Missing environment variable: API_KEY
 * }
 * ```
 */
export function checkAndGetEnvValue(key: string): string {
    if (!process.env[key]) throw new EnvironmentNotFoundError(key);
    return process.env[key];
}
