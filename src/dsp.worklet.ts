/* eslint-env:node */
/// <reference types="@types/audioworklet" />

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
