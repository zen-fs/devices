export function framebuffer({ canvas }) {
    const ctx = canvas.getContext('2d')
    return {
      name: 'framebuffer',
      isBuffered: false,
      read () {},
      write ({ device: { driver: { name }, ino }, fs, path, position }, data) {
        if (data?.byteLength){
          const imageData = new ImageData(new Uint8ClampedArray(data), canvas.width, canvas.height)
          ctx.putImageData(imageData, 0, 0)
        }
      }
    }
};
