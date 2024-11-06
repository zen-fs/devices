import type { DeviceDriver, DeviceFile } from '@zenfs/core';

/// <reference types="./audioworklet.d.ts" />

if ('AudioWorkletProcessor' in globalThis) {
	class Dsp extends AudioWorkletProcessor {
		protected buffer?: Float32Array;

		public constructor() {
			super();
			this.port.onmessage = ({ data }: MessageEvent<Float32Array>) => {
				this.buffer = data;
			};
		}

		public process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
			if (this.buffer) {
				const c = currentFrame % sampleRate;
				outputs[0][0].set(this.buffer.slice(c, c + 128));
			}
			return true;
		}

		public static get parameterDescriptors() {
			return [
				{
					name: 'gain',
					defaultValue: 1,
					minValue: 0,
					maxValue: 1,
					automationRate: 'a-rate',
				},
			];
		}
	}

	registerProcessor('zenfs:dsp', Dsp);
}

interface DspOptions {
	audioContext?: AudioContext;
}

export async function dsp(options: DspOptions = {}): Promise<DeviceDriver<AudioWorkletNode>> {
	const context = options.audioContext || new AudioContext();
	const audioBuffer = new ArrayBuffer(context.sampleRate * 4);

	await context.audioWorklet.addModule(import.meta.url);

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
