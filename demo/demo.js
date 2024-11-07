import { configure, fs } from '@zenfs/core';
import { framebuffer } from '@zenfs/devices';

const canvas = document.querySelector('#fb');
const { width, height } = canvas;

await configure({ addDevices: true });

fs.mounts.get('/dev').createDevice('/fb0', framebuffer({ canvas }));

// example: write gradient with changing hue to framebuffer
const screen = new Uint8Array(width * height * 4);

let hue = 0;

function hslToRgb(hue, saturation) {
	const a = saturation / 2;
	const f = n => {
		const k = (n + hue / 30) % 12;
		return 0.5 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
	};
	return [f(0) * 255, f(8) * 255, f(4) * 255];
}

function makeGradientFb() {
	hue = (hue + 1) % 360; // Increment hue and keep it in the 0-359 range

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4;
			const gradientValue = (x / width) * 100; // Adjust the saturation and lightness effect
			const [r, g, b] = hslToRgb(hue, gradientValue / 100, 0.5); // S=gradientValue, L=0.5 for vivid color

			screen.set([r, g, b, 255], index);
		}
	}
	fs.writeFileSync('/dev/fb0', screen, { flag: 'r+' });
	requestAnimationFrame(makeGradientFb);
}
makeGradientFb();
