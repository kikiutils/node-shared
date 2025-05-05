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

    it('should return empty string if the environment variable is set to an empty string', () => {
        const key = 'EMPTY_KEY';
        process.env[key] = '';
        const result = checkAndGetEnvValue(key);
        expect(result).toBe('');
    });

    it('should return "0" if the environment variable is set to "0"', () => {
        const key = 'ZERO_KEY';
        process.env[key] = '0';
        const result = checkAndGetEnvValue(key);
        expect(result).toBe('0');
    });

    it('should return "false" if the environment variable is set to "false"', () => {
        const key = 'FALSE_KEY';
        process.env[key] = 'false';
        const result = checkAndGetEnvValue(key);
        expect(result).toBe('false');
    });

    it('should throw an EnvironmentNotFoundError if the environment variable is not defined', () => {
        const key = 'MISSING_KEY';
        expect(() => checkAndGetEnvValue(key)).toThrow(EnvironmentNotFoundError);
        expect(() => checkAndGetEnvValue(key)).toThrow(`Missing environment variable: ${key}`);
    });
});
