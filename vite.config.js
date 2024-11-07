import { globSync } from 'fs';
import { defineConfig } from 'vite';

export default defineConfig({
	base: './',
	root: './demo',
	build: {
		outDir: '../docs/demo',
		emptyOutDir: true,
		target: 'esnext',
		rollupOptions: {
			input: globSync('demo/*.html'),
		},
	},
	resolve: {
		alias: {
			'@zenfs/devices': '../src/index.ts',
		},
	},
});
