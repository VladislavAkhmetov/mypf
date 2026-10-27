// Timelapse: replay the drawing op by op, and export the replay as an animated GIF.
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { PaintOp, drawOp, opLength } from "./paint-engine";

/** Progressive renderer: draws finished ops once, the current op partially each frame. */
function createReplay(base: CanvasRenderingContext2D, live: CanvasRenderingContext2D, ops: PaintOp[], scale: number) {
  const total = ops.reduce((sum, op) => sum + opLength(op), 0);
  let index = 0;
  let consumed = 0;
  const clear = (ctx: CanvasRenderingContext2D, color?: string) => {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    } else ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  };
  clear(base, "#ffffff");
  clear(live);
  return {
    total,
    /** Advance to `step` (0..total) of the whole drawing. */
    seek(step: number) {
      while (index < ops.length && consumed + opLength(ops[index]) <= step) {
        drawOp(base, ops[index], scale);
        consumed += opLength(ops[index]);
        index++;
      }
      clear(live);
      if (index < ops.length && ops[index].kind !== "fill") drawOp(live, ops[index], scale, step - consumed);
    },
  };
}

export function playTimelapse(
  base: CanvasRenderingContext2D,
  live: CanvasRenderingContext2D,
  ops: PaintOp[],
  scale: number,
  onDone: () => void,
) {
  const replay = createReplay(base, live, ops, scale);
  const duration = Math.min(9000, Math.max(2200, replay.total * 9));
  const started = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    const progress = Math.min(1, (now - started) / duration);
    // Ease in-out so the start and the finished picture linger a little.
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    replay.seek(Math.round(eased * replay.total));
    if (progress < 1) frame = requestAnimationFrame(tick);
    else onDone();
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export async function exportTimelapseGif(ops: PaintOp[], width: number, height: number): Promise<Blob> {
  const scale = Math.min(1, 480 / width);
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const make = () => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    return ctx;
  };
  const base = make();
  const live = make();
  const out = make();
  const replay = createReplay(base, live, ops, scale);

  // One palette from the finished picture keeps colours stable and encoding fast.
  replay.seek(replay.total);
  out.setTransform(1, 0, 0, 1, 0, 0);
  out.drawImage(base.canvas, 0, 0);
  const finalPixels = out.getImageData(0, 0, w, h).data;
  const palette = quantize(finalPixels, 128);

  const gif = GIFEncoder();
  const frames = 48;
  const restart = createReplay(base, live, ops, scale);
  for (let i = 0; i <= frames; i++) {
    restart.seek(Math.round((i / frames) * restart.total));
    out.drawImage(base.canvas, 0, 0);
    out.drawImage(live.canvas, 0, 0);
    const pixels = out.getImageData(0, 0, w, h).data;
    gif.writeFrame(applyPalette(pixels, palette), w, h, { palette, delay: i === frames ? 2200 : 70 });
    // Let the UI breathe between frames.
    if (i % 6 === 0) await new Promise(resolve => setTimeout(resolve, 0));
  }
  gif.finish();
  return new Blob([gif.bytes().slice()], { type: "image/gif" });
}
