import { configure, fs } from '@zenfs/core';
import { framebuffer, dsp } from '@zenfs/devices';

// this is optional, but I set them, so I have control
const canvas = document.querySelector('#fb');
const { width, height } = canvas;

const audioContext = new AudioContext();

// add initial devices like /dev/null, etc
await configure({ addDevices: true });

const devfs = fs.mounts.get('/dev');

// mount framebuffer & dsp
devfs.createDevice('/fb0', framebuffer({ canvas }));
devfs.createDevice('/dsp', await dsp({ audioContext }));

// example: write static to framebuffer
const screen = new Uint8Array(width * height * 4);

function makeGradientFb() {
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const index = (y * width + x) * 4;
			const gradientValue = (x / width) * 255;
			screen.set([gradientValue, gradientValue, 255 - gradientValue, 255], index);
		}
	}
	fs.promises.writeFile('/dev/fb0', screen);
	requestAnimationFrame(makeGradientFb);
}
makeGradientFb();

// example: write static to audio
const audioBuffer = new Float32Array(audioContext.sampleRate * 4);
setInterval(() => {
	for (let i in audioBuffer) {
		audioBuffer[i] = Math.random() * 2 - 1;
	}
	fs.promises.writeFile('/dev/dsp', audioBuffer);
}, 1000);
