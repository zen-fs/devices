import { configure, fs, type DeviceFS } from '@zenfs/core';
import { framebuffer, dsp } from '@zenfs/devices';

// this is optional, but I set them, so I have control
const canvas = document.querySelector<HTMLCanvasElement>('#fb')!;
const audioContext = new AudioContext();

// add initial devices like /dev/null, etc
await configure({ addDevices: true });

const devfs = fs.mounts.get('/dev') as DeviceFS;

// mount framebuffer & dsp
devfs.createDevice('/fb0', framebuffer({ canvas }));
devfs.createDevice('/dsp', await dsp({ audioContext }));

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
const audioBuffer = new Float32Array(new ArrayBuffer(audioContext.sampleRate * 4));
setInterval(() => {
	for (let i in audioBuffer) {
		audioBuffer[i] = Math.random() * 2 - 1;
	}
	fs.promises.writeFile('/dev/dsp', audioBuffer);
}, 1000);
