import { defineConfig } from 'ts-project-builder';

export default defineConfig({
	builtInInputPluginOptions: {
		nodeExternal: {
			include: [
				'hono/hono-base',
				'hono/logger',
				'hono/types'
			]
		}
	}
});
