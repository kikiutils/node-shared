export class EnvironmentNotFoundError extends Error {
    readonly key: string;

    constructor(key: string) {
        super(`Missing environment variable: ${key}`);
        this.key = key;
        // A literal survives minification, unlike `this.constructor.name`.
        this.name = 'EnvironmentNotFoundError';
    }
}

/** @throws EnvironmentNotFoundError if the environment variable is not defined. */
export function getRequiredEnv(key: string) {
    if (process.env[key] === undefined) throw new EnvironmentNotFoundError(key);
    return process.env[key];
}
