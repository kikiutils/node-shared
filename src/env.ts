export class EnvironmentNotFoundError extends Error {
    readonly key: string;

    constructor(key: string) {
        super(`Missing environment variable: ${key}`);
        this.key = key;
        // A literal survives minification, unlike `this.constructor.name`.
        this.name = 'EnvironmentNotFoundError';
    }
}

/**
 * Returns an environment variable, throwing when it is not set.
 *
 * @remarks
 * Only an unset variable is missing; empty and falsy-looking strings such as `''`, `'0'`, and `'false'` are returned.
 *
 * @throws EnvironmentNotFoundError if the environment variable is not defined.
 *
 * @example
 *
 * ```ts
 * import {
 *     getRequiredEnv,
 *     EnvironmentNotFoundError,
 * } from '@kikiutils/shared/env';
 *
 * process.env.API_KEY = '';
 * getRequiredEnv('API_KEY'); // => ''
 *
 * delete process.env.API_KEY;
 * try {
 *     getRequiredEnv('API_KEY');
 * } catch (error) {
 *     console.log(error instanceof EnvironmentNotFoundError); // => true
 * }
 * ```
 */
export function getRequiredEnv(key: string) {
    if (process.env[key] === undefined) throw new EnvironmentNotFoundError(key);
    return process.env[key];
}
