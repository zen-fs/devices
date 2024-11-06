export function framebuffer(options:any = {}) {
    if (!options.canvas) {
      options.canvas = document.createElement('canvas')
      document.body.appendChild(options.canvas)
    }
    const ctx = options.canvas.getContext('2d')
    return {
      name: 'framebuffer',
      isBuffered: false,
      read () {},
      write (writeOptions:any = {}, data:ArrayLike<number>) {
        const { device: { driver: { name }, ino }, fs, path, position } = writeOptions
        if (data?.length){
          const imageData = new ImageData(new Uint8ClampedArray(data), options.canvas.width, options.canvas.height)
          ctx.putImageData(imageData, 0, 0)
        }
      }
    }
};
