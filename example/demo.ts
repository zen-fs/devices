import { configure, InMemory, fs } from '@zenfs/core';
import { IndexedDB } from '@zenfs/dom';
import { framebuffer, dsp } from '@zenfs/devices';

// this is optional, but I set them, so I have control
const canvas = document.getElementById('fb');
const audioContext = new AudioContext();

// add initial devices like /dev/null, etc
configure({ addDevices: true }).then(() => {
	// mount framebuffer & dsp
	fs.mounts.get('/dev').createDevice('/fb0', framebuffer({ canvas }));
	fs.mounts.get('/dev').createDevice('/dsp', dsp({ audioContext }));

	// example: write static to framebuffer
	const screen = new Uint8Array(canvas.width * canvas.height * 4);
	function makestaticFb() {
		for (let i = 0; i < screen.byteLength; i += 4) {
			screen[i] = Math.random() * 255;
			screen[i + 1] = Math.random() * 255;
			screen[i + 2] = Math.random() * 255;
			screen[i + 3] = 255;
		}
		fs.promises.writeFile('/dev/fb0', screen);
		requestAnimationFrame(makestaticFb);
	}
	makestaticFb();

	// example: write static to audio
	const audioBuffer = new ArrayBuffer(audioContext.sampleRate * 4);
	const audioBytes = new Uint8Array(audioBuffer);
	const audioFloats = new Float32Array(audioBuffer);
	setInterval(() => {
		for (let i in audioFloats) {
			audioFloats[i] = Math.random() * 2 - 1;
		}
		fs.promises.writeFile('/dev/dsp', audioBytes);
	}, 1000);
});
