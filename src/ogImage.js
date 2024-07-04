import { createCanvas } from "canvas";

/**
 * Generate an OpenGraph image.
 *
 * @param {Object} options - The options for generating the image.
 * @param {string} options.description - The description text.
 * @param {number} options.width - The width of the image.
 * @param {number} options.height - The height of the image.
 */
export default async function ogImage(options) {
  const { description, width, height } = options;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Assuming margin, padding, logoHeight, and isRtl are defined elsewhere
  const margin = {
    "inline-start": 20,
    "inline-end": 20,
    "block-start": 20,
    "block-end": 20,
  };
  const padding = 10;
  const logoHeight = 0; // Example value

  // Fill with a white background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, width, height);

  // Set text style for description
  ctx.font = "16px Arial"; // Simplified, adjust as needed
  ctx.fillStyle = "#000";

  // Add description text with basic wrapping
  const paraWidth =
    width - margin["inline-start"] - margin["inline-end"] - padding;
  const words = description.split(" ");
  let line = "";
  const lineHeight = 24; // Example line height
  let y = margin["block-start"] + logoHeight + (logoHeight ? padding : 0);

  for (const word of words) {
    const testLine = line + word + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > paraWidth && line !== "") {
      ctx.fillText(line, margin["inline-start"], y);
      line = word + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, margin["inline-start"], y);

  return canvas.toBuffer();
}
