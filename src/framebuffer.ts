import { Errno, ErrnoError, type DeviceDriver, type DeviceFile } from '@zenfs/core';

interface FramebufferOptions {
	canvas?: HTMLCanvasElement;
}

export function framebuffer({ canvas }: FramebufferOptions = {}): DeviceDriver {
	if (!canvas) {
		canvas = document.createElement('canvas');
		document.body.appendChild(canvas);
	}
	const ctx = canvas.getContext('2d');

	if (!ctx) {
		throw new ErrnoError(Errno.EIO, 'Could not get context from canvas whilst initializing frame buffer.');
	}

	return {
		name: 'framebuffer',
		read() {
			return 0;
		},
		write(file: DeviceFile, data: Uint8Array) {
			const imageData = new ImageData(new Uint8ClampedArray(data), canvas.width, canvas.height);
			ctx.putImageData(imageData, 0, 0);
			return data.byteLength;
		},
	};
}
