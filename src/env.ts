/**
 * Custom error class for handling missing environment variables.
 *
 * @remarks
 * Extends the built-in `Error` class and includes the missing key.
 */
export class EnvironmentNotFoundError extends Error {
    readonly key: string;

    /**
     * Creates an error identifying a missing environment variable.
     *
     * @param key - The missing environment variable key.
     */
    constructor(key: string) {
        super(`Missing environment variable: ${key}`);
        this.key = key;
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
    }
}

/**
 * Retrieves the value of an environment variable, or throws an error if it is not defined.
 *
 * @remarks
 * Only checks for `process.env[key] === undefined`. An empty string (for example `''`) or any falsy string
 * value like `'0'` or `'false'` is considered a valid (defined) value.
 *
 * @param key - The environment variable key to retrieve.
 *
 * @returns The value of the environment variable.
 *
 * @throws EnvironmentNotFoundError if the environment variable is not defined.
 *
 * @example
 *
 * ```ts
 * import {
 *     checkAndGetEnvValue,
 *     EnvironmentNotFoundError,
 * } from '@kikiutils/shared/env';
 *
 * process.env.API_KEY = '';
 * checkAndGetEnvValue('API_KEY'); // => ''
 *
 * delete process.env.API_KEY;
 * try {
 *     checkAndGetEnvValue('API_KEY');
 * } catch (error) {
 *     console.log(error instanceof EnvironmentNotFoundError); // => true
 * }
 * ```
 */
export function checkAndGetEnvValue(key: string) {
    if (process.env[key] === undefined) throw new EnvironmentNotFoundError(key);
    return process.env[key];
}
