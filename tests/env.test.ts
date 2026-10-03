import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

import {
    checkAndGetEnvValue,
    EnvironmentNotFoundError,
} from '../src/env';

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('class EnvironmentNotFoundError', () => {
    it('should expose the missing key and a recognizable Error name and message', ({ expect }) => {
        const error = new EnvironmentNotFoundError('TEST_KEY');

        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('EnvironmentNotFoundError');
        expect(error.message).toBe('Missing environment variable: TEST_KEY');
        expect(error.key).toBe('TEST_KEY');
    });
});

describe('checkAndGetEnvValue', () => {
    it.for([
        'value',
        '',
        '0',
        'false',
    ])(
        'should preserve the defined value %j',
        (value, { expect }) => {
            vi.stubEnv('KIKIUTILS_TEST_VALUE', value);

            expect(checkAndGetEnvValue('KIKIUTILS_TEST_VALUE')).toBe(value);
        },
    );

    it('should reject an undefined variable with its key', ({ expect }) => {
        vi.stubEnv('KIKIUTILS_TEST_VALUE', undefined);

        expect(() => checkAndGetEnvValue('KIKIUTILS_TEST_VALUE')).toThrow(EnvironmentNotFoundError);
        expect(() => checkAndGetEnvValue('KIKIUTILS_TEST_VALUE')).toThrow(
            'Missing environment variable: KIKIUTILS_TEST_VALUE',
        );
    });
});
