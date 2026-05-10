import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

async function importPinoLogger() {
    vi.resetModules();
    return await import('../src/pino');
}

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('pinoLogger', () => {
    it('should use PINO_LOGGER_LEVEL when provided', async ({ expect }) => {
        vi.stubEnv('PINO_LOGGER_LEVEL', 'debug');
        vi.stubEnv('NODE_ENV', 'production');

        const { logger, pinoLogger } = await importPinoLogger();

        expect(logger).toBe(pinoLogger);
        expect(pinoLogger.level).toBe('debug');
    });

    it('should use error level in production when no explicit level is provided', async ({ expect }) => {
        vi.stubEnv('PINO_LOGGER_LEVEL', undefined);
        vi.stubEnv('NODE_ENV', 'production');

        const { pinoLogger } = await importPinoLogger();

        expect(pinoLogger.level).toBe('error');
    });

    it('should keep pino default level outside production', async ({ expect }) => {
        vi.stubEnv('PINO_LOGGER_LEVEL', undefined);
        vi.stubEnv('NODE_ENV', 'test');

        const { pinoLogger } = await importPinoLogger();

        expect(pinoLogger.level).toBe('info');
    });
});
