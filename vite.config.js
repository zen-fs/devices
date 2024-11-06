import { defineConfig } from 'vite';

export default defineConfig({
	base: './',
	root: './demo',
	build: {
		outDir: '../docs/demo',
		emptyOutDir: true,
		target: 'esnext',
	},
	resolve: {
		alias: {
			'@zenfs/devices': '../src/index.ts',
		},
	},
});
