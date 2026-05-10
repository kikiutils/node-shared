import {
    afterEach,
    describe,
    it,
    vi,
} from 'vitest';

async function importConsolaLogger() {
    vi.resetModules();
    return await import('../src/consola');
}

afterEach(() => {
    vi.unstubAllEnvs();
});

describe('consolaLogger', () => {
    it('should use CONSOLA_LOGGER_LEVEL when provided', async ({ expect }) => {
        vi.stubEnv('CONSOLA_LOGGER_LEVEL', '2');
        vi.stubEnv('NODE_ENV', 'production');

        const { consolaLogger, logger } = await importConsolaLogger();

        expect(logger).toBe(consolaLogger);
        expect(consolaLogger.level).toBe(2);
    });

    it('should silence logs in production when no explicit level is provided', async ({ expect }) => {
        vi.stubEnv('CONSOLA_LOGGER_LEVEL', undefined);
        vi.stubEnv('NODE_ENV', 'production');

        const { consolaLogger } = await importConsolaLogger();

        expect(consolaLogger.level).toBe(0);
    });

    it('should keep consola default level outside production', async ({ expect }) => {
        vi.stubEnv('CONSOLA_LOGGER_LEVEL', undefined);
        vi.stubEnv('NODE_ENV', 'test');

        const { consolaLogger } = await importConsolaLogger();

        expect(consolaLogger.level).toBeGreaterThan(0);
    });
});
