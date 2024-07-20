import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { glob } from 'glob';
import { defineConfig } from 'rollup';
import type { OutputOptions } from 'rollup';
import del from 'rollup-plugin-delete';
import nodeExternals from 'rollup-plugin-node-externals';

const generateOutputOptions = (format: 'cjs' | 'esm'): OutputOptions => ({
	dir: './dist',
	entryFileNames: `[name].${format === 'cjs' ? 'cjs' : 'mjs'}`,
	externalLiveBindings: false,
	format,
	generatedCode: {
		arrowFunctions: true,
		constBindings: true,
		objectShorthand: true
	},
	interop: 'compat',
	preserveModules: true,
	preserveModulesRoot: './src'
});

export default defineConfig({
	input: glob.sync('./src/**/*.ts'),
	output: [generateOutputOptions('cjs'), generateOutputOptions('esm')],
	plugins: [
		del({ targets: './dist' }),
		nodeExternals({
			include: [
				'hono/hono-base',
				'hono/logger',
				'hono/types'
			]
		}),
		nodeResolve(),
		typescript()

	]
});
