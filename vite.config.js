import { defineConfig } from 'vite'

export default defineConfig({
	// base: '.',
	root: './example',
	build: {
		outDir: '../docs'
	},
	resolve: {
		alias: {
			'@zenfs/devices': '../src/index.ts',
		},
	},
});
