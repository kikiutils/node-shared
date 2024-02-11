export class EnvironmentNotFoundError extends Error {
	readonly key: string;

	constructor(key: string) {
		super(`Missing environment variable: ${key}`);
		this.key = key;
		this.name = this.constructor.name;
		Error.captureStackTrace?.(this, this.constructor);
	}
}

export const checkAndGetEnvValue = (key: string) => {
	if (!process.env[key]) throw new EnvironmentNotFoundError(key);
	return process.env[key] as string;
};
