describe('consola logger', () => {
    beforeEach(() => {
        delete process.env.CONSOLA_LOGGER_LEVEL;
        delete process.env.NODE_ENV;
        jest.resetModules();
    });

    it('should create a consola instance', async () => {
        const { logger } = await import('../src/consola');
        expect(logger).toBeDefined();
        expect(logger).toBeInstanceOf(Object);
    });

    it('should set the logger level based on CONSOLA_LOGGER_LEVEL environment variable', () => {
        process.env.CONSOLA_LOGGER_LEVEL = '3';
        jest.isolateModules(async () => {
            const { logger } = await import('../src/consola');
            expect(logger.level).toBe(3);
        });
    });

    it('should set the logger level to 0 in production environment', () => {
        process.env.NODE_ENV = 'production';
        jest.isolateModules(async () => {
            const { logger } = await import('../src/consola');
            expect(logger.level).toBe(0);
        });
    });

    it('should allow manual logger level assignment', async () => {
        const { logger } = await import('../src/consola');
        logger.level = 4;
        expect(logger.level).toBe(4);
    });
});
