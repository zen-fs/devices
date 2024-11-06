/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

interface FramebufferOptions {
	canvas?: HTMLCanvasElement;
}

export function framebuffer(options: FramebufferOptions = {}) {
	if (!options.canvas) {
		options.canvas = document.createElement('canvas');
		document.body.appendChild(options.canvas);
	}
	const ctx = options.canvas.getContext('2d');
	return {
		name: 'framebuffer',
		isBuffered: false,
		read() {},
		write(writeOptions: any = {}, data: ArrayLike<number>) {
			if (data?.length) {
				const imageData = new ImageData(new Uint8ClampedArray(data), options.canvas.width, options.canvas.height);
				ctx.putImageData(imageData, 0, 0);
			}
		},
	};
}
