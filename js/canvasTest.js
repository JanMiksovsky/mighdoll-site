import { createCanvas } from "canvas";

export default async function () {
  const canvas = createCanvas(200, 200);
  const ctx = canvas.getContext("2d");

  // Fill with a white background
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Write "Awesome!" in black text
  ctx.font = "30px Impact";
  ctx.fillStyle = "#000";
  ctx.fillText("Awesome!", 50, 100);

  return canvas.toBuffer();
}
