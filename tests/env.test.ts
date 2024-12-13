import {
    checkAndGetEnvValue,
    EnvironmentNotFoundError,
} from '../src/env';

describe('environmentNotFoundError', () => {
    it('should create an error with the correct message and key', () => {
        const key = 'TEST_KEY';
        const error = new EnvironmentNotFoundError(key);
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('EnvironmentNotFoundError');
        expect(error.message).toBe(`Missing environment variable: ${key}`);
        expect(error.key).toBe(key);
    });

    it('should capture stack trace correctly', () => {
        const key = 'TEST_KEY';
        const error = new EnvironmentNotFoundError(key);
        expect(error.stack).toContain(`EnvironmentNotFoundError: Missing environment variable: ${key}`);
    });
});

describe('checkAndGetEnvValue', () => {
    const originalEnv = process.env;
    beforeEach(() => process.env = { ...originalEnv });
    afterEach(() => process.env = originalEnv);
    it('should return the value of an existing environment variable', () => {
        const key = 'TEST_KEY';
        const value = 'test_value';
        process.env[key] = value;
        const result = checkAndGetEnvValue(key);
        expect(result).toBe(value);
    });

    it('should throw an EnvironmentNotFoundError if the environment variable is not set', () => {
        const key = 'MISSING_KEY';
        expect(() => checkAndGetEnvValue(key)).toThrow(EnvironmentNotFoundError);
        expect(() => checkAndGetEnvValue(key)).toThrow(`Missing environment variable: ${key}`);
    });
});
