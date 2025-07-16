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
     * @param {string} key - The missing environment variable key
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
 * Only checks for `process.env[key] === undefined`. An empty string (e.g. '') or any falsy string
 * value like `'0'` or `'false'` is considered a valid (defined) value.
 *
 * @param {string} key - The environment variable key to retrieve
 *
 * @returns {string} The value of the environment variable
 *
 * @throws {EnvironmentNotFoundError} If the environment variable is not defined
 *
 * @example
 * ```typescript
 * process.env.API_KEY = '';
 * checkAndGetEnvValue('API_KEY'); // ✅ Returns '' (still considered "defined")
 *
 * delete process.env.API_KEY;
 * checkAndGetEnvValue('API_KEY'); // ❌ Throws EnvironmentNotFoundError
 * ```
 */
export function checkAndGetEnvValue(key: string): string {
    if (process.env[key] === undefined) throw new EnvironmentNotFoundError(key);
    return process.env[key];
}
