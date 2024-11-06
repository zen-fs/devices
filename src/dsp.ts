import type { DeviceDriver, DeviceFile } from '@zenfs/core';

interface DspOptions {
	audioContext?: AudioContext;
}

export async function dsp(options: DspOptions = {}): Promise<DeviceDriver<AudioWorkletNode>> {
	const context = options.audioContext || new AudioContext();
	const audioBuffer = new ArrayBuffer(context.sampleRate * 4);

	await context.audioWorklet.addModule(new URL('./dsp.worklet.js', import.meta.url).href);

	const dsp = new AudioWorkletNode(context, 'zenfs:dsp');
	dsp.connect(context.destination);
	dsp.port.postMessage(audioBuffer);

	// add a click-handler to resume (due to web security) https://goo.gl/7K7WLu
	document.addEventListener('click', () => {
		if (context.state != 'running') {
			void context.resume().catch(() => {});
		}
	});

	return {
		name: 'dsp',
		init() {
			return { data: dsp, major: 14, minor: 3 };
		},
		read() {
			return 0;
		},
		write(file: DeviceFile, data: Uint8Array): number {
			new Uint8Array(audioBuffer).set(data);
			dsp.port.postMessage(new Float32Array(audioBuffer));
			return data.byteLength;
		},
	};
}
