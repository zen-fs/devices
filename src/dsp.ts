/* eslint-disable @typescript-eslint/no-unused-vars */

import type { DeviceDriver, DeviceFile } from '@zenfs/core';

interface DspOptions {
	audioContext?: AudioContext;
}

// I inline worker, so no separate file is needed.
const workletUrl = URL.createObjectURL(
	new Blob(
		[
			`

/* global AudioWorkletProcessor, registerProcessor, currentFrame, currentTime, sampleRate  */

class ZenFSDsp extends AudioWorkletProcessor {
  constructor (...args) {
    super(...args)
    this.port.onmessage = e => this.buffer = e.data
  }

  process (inputs, outputs, parameters) {
    if (this.buffer) {
      const c = currentFrame % sampleRate
      outputs[0][0].set(this.buffer.slice(c, c+128))
    }
    return true
  }

  static get parameterDescriptors () {
    return [
      {
        name: 'gain',
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        automationRate: 'a-rate'
      }
    ]
  }
}

registerProcessor('zenfs-dsp', ZenFSDsp)

`,
		],
		{ type: 'application/javascript' }
	)
);

export async function dsp(options: DspOptions = {}): Promise<DeviceDriver> {
	const context = options.audioContext || new AudioContext();
	const audioBuffer = new ArrayBuffer(context.sampleRate * 4);

	await context.audioWorklet.addModule(workletUrl);

	const dsp = new AudioWorkletNode(context, 'zenfs-dsp');
	dsp.connect(context.destination);
	dsp.port?.postMessage(audioBuffer);

	// add a click-handler to resume (due to web security) https://goo.gl/7K7WLu
	document.addEventListener('click', () => {
		if (context.state !== 'running') {
			context.resume().catch(e => {});
		}
	});

	return {
		name: 'dsp',
		read() {
			return 0;
		},
		write(file: DeviceFile, data: Uint8Array): number {
			new Uint8Array(audioBuffer).set(data);
			dsp.port?.postMessage(new Float32Array(audioBuffer));
			return data.byteLength;
		},
	};
}
