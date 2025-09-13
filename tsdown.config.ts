import { defineConfig } from 'tsdown';

export default defineConfig({
    clean: true,
    dts: true,
    entry: ['./src/**/*.ts'],
    sourcemap: true,
    tsconfig: './tsconfig.build.json',
    unbundle: true,
});
