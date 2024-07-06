import { createCanvas, loadImage } from "canvas";

/**
 * Generate an OpenGraph image.
 *
 * @param {Object} options - options for generating the image
 * @param {number} options.height - height of the image
 * @param {Uint8Array} options.logo - logo image
 * @param {string} options.title - title text
 * @param {number} options.width - width of the image
 */
export default async function ogImage(options) {
  const { bgImage, width = 1200, height = 630, title } = options;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  const margin = {
    inlineStart: 20,
    inlineEnd: 20,
    blockStart: 20,
    blockEnd: 20,
  };
  const padding = 10;
  const logoHeight = 0;

  // Fill with a black background
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);

  if (bgImage) {
    // loadImage wants a Buffer
    const buffer = Buffer.from(bgImage);
    const image = await loadImage(buffer);
    const { naturalWidth, naturalHeight } = image;
    const imageAspectRatio = naturalWidth / naturalHeight;
    const canvasAspectRatio = width / height;
    // Center the image
    let x = 0;
    let y = 0;
    let imgWidth = width;
    let imgHeight = height;
    if (imageAspectRatio > canvasAspectRatio) {
      imgWidth = width;
      imgHeight = width / imageAspectRatio;
      y = (height - imgHeight) / 2;
    } else {
      imgHeight = height;
      imgWidth = height * imageAspectRatio;
      x = (width - imgWidth) / 2;
    }
    ctx.drawImage(image, x, y, imgWidth, imgHeight);
  }

  // Set text style for title
  const fontHeight = 70;
  ctx.font = `bold ${fontHeight}px Helvetica`;
  ctx.fillStyle = "#fff";

  // Add title text with basic wrapping
  const paraWidth = width - margin.inlineStart - margin.inlineEnd - padding;
  const words = title.split(" ");
  let line = "";
  const lineHeight = 1.2 * fontHeight;
  let y = margin.blockStart + logoHeight + (logoHeight ? padding : 0);

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    const { width: textWidth } = metrics;
    if (textWidth > paraWidth && line !== "") {
      y += lineHeight;
      ctx.fillText(line, margin.inlineStart, y);
      line = word + " ";
    } else {
      line = testLine;
    }
  }

  y += lineHeight;
  ctx.fillText(line, margin.inlineStart, y);

  return canvas.toBuffer();
}
