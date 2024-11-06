/* eslint-disable @typescript-eslint/no-unused-vars */

import type { DeviceFile } from '@zenfs/core';

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

export const dsp = (options: DspOptions = {}) => {
	const audioCtx = options.audioContext || new AudioContext();
	const audioBuffer = new ArrayBuffer(audioCtx.sampleRate * 4);

	let dsp: AudioWorkletNode;

	audioCtx.audioWorklet
		.addModule(workletUrl)
		.then(() => {
			dsp = new AudioWorkletNode(audioCtx, 'zenfs-dsp');
			dsp.connect(audioCtx.destination);
			dsp.port?.postMessage(audioBuffer);
		})
		.catch(e => {});

	// add a click-handler to resume (due to web security) https://goo.gl/7K7WLu
	document.addEventListener('click', () => {
		if (audioCtx.state !== 'running') {
			audioCtx.resume().catch(e => {});
		}
	});

	return {
		name: 'dsp',
		isBuffered: false,
		read() {},
		write(file: DeviceFile, data: ArrayLike<number>) {
			if (data?.length) {
				new Uint8Array(audioBuffer).set(data);
				dsp.port?.postMessage(new Float32Array(audioBuffer));
			}
		},
	};
};
