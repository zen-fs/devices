import { defineConfig } from 'vite';

export default defineConfig({
	// base: '.',
	root: './example',
	build: {
		outDir: '../docs',
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			'@zenfs/devices': '../src/index.ts',
		},
	},
});
