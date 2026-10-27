// Paint document model and renderer. A drawing is a list of operations (strokes, shapes,
// fills), which makes undo, timelapse replay and the physics mode possible.
import { getStroke } from "perfect-freehand";

export type BrushStyle = "smooth" | "sketchy" | "shaded" | "web" | "fur";
export type Tool = "eraser" | "fill" | "picker" | "pencil" | "brush" | "airbrush" | "line" | "rect" | "ellipse" | "roundrect";
export type ShapeFill = "outline" | "both" | "fill";

export interface Point {
  x: number;
  y: number;
  p: number; // pressure 0..1
}

export interface StrokeOp {
  kind: "stroke";
  tool: "pencil" | "brush" | "eraser" | "airbrush";
  style: BrushStyle;
  color: string;
  size: number;
  seed: number;
  simulatePressure: boolean;
  points: Point[];
}

export interface ShapeOp {
  kind: "shape";
  shape: "line" | "rect" | "ellipse" | "roundrect";
  color: string;
  fillColor: string;
  fill: ShapeFill;
  size: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface FillOp {
  kind: "fill";
  x: number;
  y: number;
  color: string;
}

export type PaintOp = StrokeOp | ShapeOp | FillOp;

export const XP_PALETTE = [
  "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", "#000080", "#800080", "#808040", "#004040", "#0080ff", "#004080", "#8000ff", "#804000",
  "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffff80", "#00ff80", "#80ffff", "#8080ff", "#ff0080", "#ff8040",
];

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rgba(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Number of "steps" an op takes in a timelapse. */
export function opLength(op: PaintOp) {
  return op.kind === "stroke" ? op.points.length : op.kind === "shape" ? 12 : 6;
}

// ---------- Strokes ----------

function freehandPath(points: Point[], size: number, thinning: number, simulatePressure: boolean, last: boolean) {
  const outline = getStroke(points.map(p => [p.x, p.y, p.p]), {
    size,
    thinning,
    smoothing: 0.5,
    streamline: 0.45,
    simulatePressure,
    last,
  });
  const path = new Path2D();
  if (!outline.length) return path;
  path.moveTo(outline[0][0], outline[0][1]);
  for (let i = 1; i < outline.length; i++) {
    const [x0, y0] = outline[i];
    const [x1, y1] = outline[(i + 1) % outline.length];
    path.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
  }
  path.closePath();
  return path;
}

/** Harmony-style procedural brushes (after mr.doob's "Harmony"), drawn point by point. */
function harmonySegment(ctx: CanvasRenderingContext2D, op: StrokeOp, points: Point[], i: number, random: () => number) {
  const cur = points[i];
  const prev = points[i - 1] ?? cur;
  ctx.lineWidth = Math.max(1, op.size / 4);
  ctx.beginPath();
  ctx.strokeStyle = rgba(op.color, op.style === "web" ? 0.5 : op.style === "shaded" ? 0.12 : 0.35);
  ctx.moveTo(prev.x, prev.y);
  ctx.lineTo(cur.x, cur.y);
  ctx.stroke();
  ctx.lineWidth = 1;
  const from = Math.max(0, i - 400);
  for (let j = from; j < i; j++) {
    const dx = points[j].x - cur.x;
    const dy = points[j].y - cur.y;
    const d = dx * dx + dy * dy;
    const r = random();
    if (op.style === "sketchy" && d < 4000 && r > d / 2000) {
      ctx.strokeStyle = rgba(op.color, 0.12);
      ctx.beginPath();
      ctx.moveTo(cur.x + dx * 0.3, cur.y + dy * 0.3);
      ctx.lineTo(points[j].x - dx * 0.3, points[j].y - dy * 0.3);
      ctx.stroke();
    } else if (op.style === "shaded" && d < 1000) {
      ctx.strokeStyle = rgba(op.color, (1 - d / 1000) * 0.12);
      ctx.beginPath();
      ctx.moveTo(points[j].x, points[j].y);
      ctx.lineTo(cur.x, cur.y);
      ctx.stroke();
    } else if (op.style === "web" && d < 2500 && r > 0.9) {
      ctx.strokeStyle = rgba(op.color, 0.12);
      ctx.beginPath();
      ctx.moveTo(cur.x, cur.y);
      ctx.lineTo(points[j].x, points[j].y);
      ctx.stroke();
    } else if (op.style === "fur" && d < 2000 && r > d / 2000) {
      ctx.strokeStyle = rgba(op.color, 0.12);
      ctx.beginPath();
      ctx.moveTo(cur.x + dx * 0.5, cur.y + dy * 0.5);
      ctx.lineTo(cur.x - dx * 0.5, cur.y - dy * 0.5);
      ctx.stroke();
    }
  }
}

function airbrushPoint(ctx: CanvasRenderingContext2D, op: StrokeOp, point: Point, random: () => number) {
  ctx.fillStyle = op.color;
  const radius = op.size * 2.4;
  for (let k = 0; k < op.size * 3; k++) {
    const angle = random() * Math.PI * 2;
    const dist = Math.sqrt(random()) * radius;
    ctx.fillRect(Math.round(point.x + Math.cos(angle) * dist), Math.round(point.y + Math.sin(angle) * dist), 1, 1);
  }
}

/**
 * Draws `count` points of a stroke (all by default). `fromIndex` lets harmony/airbrush
 * strokes be drawn incrementally while the pointer moves.
 */
export function drawStroke(ctx: CanvasRenderingContext2D, op: StrokeOp, count = op.points.length, fromIndex = 0) {
  const points = op.points.slice(0, count);
  if (!points.length) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (op.tool === "airbrush") {
    const random = rng(op.seed);
    points.forEach((point, i) => {
      // Consume the same random numbers on every pass so replays match.
      if (i < fromIndex) for (let k = 0; k < op.size * 6; k++) random();
      else airbrushPoint(ctx, op, point, random);
    });
  } else if (op.tool === "brush" && op.style !== "smooth") {
    const random = rng(op.seed);
    for (let i = 0; i < points.length; i++) {
      if (i < fromIndex) {
        const from = Math.max(0, i - 400);
        for (let j = from; j < i; j++) random();
      } else harmonySegment(ctx, op, points, i, random);
    }
  } else {
    const thinning = op.tool === "brush" ? 0.6 : 0;
    const size = op.tool === "pencil" ? Math.max(1.5, op.size * 0.6) : op.tool === "eraser" ? op.size * 2.5 : op.size * 2.2;
    ctx.fillStyle = op.color;
    ctx.fill(freehandPath(points, size, thinning, op.simulatePressure, count >= op.points.length));
  }
  ctx.restore();
}

// ---------- Shapes ----------

export function shapePath(op: ShapeOp, progress = 1) {
  const x1 = op.x0 + (op.x1 - op.x0) * progress;
  const y1 = op.y0 + (op.y1 - op.y0) * progress;
  const path = new Path2D();
  const x = Math.min(op.x0, x1);
  const y = Math.min(op.y0, y1);
  const w = Math.abs(x1 - op.x0);
  const h = Math.abs(y1 - op.y0);
  if (op.shape === "line") {
    path.moveTo(op.x0, op.y0);
    path.lineTo(x1, y1);
  } else if (op.shape === "rect") path.rect(x, y, w, h);
  else if (op.shape === "roundrect") path.roundRect(x, y, w, h, Math.min(12, w / 2, h / 2));
  else path.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  return path;
}

export function drawShape(ctx: CanvasRenderingContext2D, op: ShapeOp, progress = 1) {
  const path = shapePath(op, progress);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = op.shape === "rect" ? "miter" : "round";
  if (op.shape !== "line" && op.fill !== "outline") {
    ctx.fillStyle = op.fill === "fill" ? op.color : op.fillColor;
    ctx.fill(path);
  }
  if (op.shape === "line" || op.fill !== "fill") {
    ctx.strokeStyle = op.color;
    ctx.lineWidth = op.size;
    ctx.stroke(path);
  }
  ctx.restore();
}

// ---------- Flood fill ----------

export function floodFill(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, scale: number) {
  const { width, height } = ctx.canvas;
  const px = Math.floor(x * scale);
  const py = Math.floor(y * scale);
  if (px < 0 || py < 0 || px >= width || py >= height) return;
  const image = ctx.getImageData(0, 0, width, height);
  const data = image.data;
  const n = parseInt(color.slice(1), 16);
  const fill = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  const start = (py * width + px) * 4;
  const target = [data[start], data[start + 1], data[start + 2], data[start + 3]];
  if (Math.abs(target[0] - fill[0]) + Math.abs(target[1] - fill[1]) + Math.abs(target[2] - fill[2]) < 6 && target[3] === 255) return;
  const tolerance = 96;
  const matches = (i: number) =>
    Math.abs(data[i] - target[0]) + Math.abs(data[i + 1] - target[1]) + Math.abs(data[i + 2] - target[2]) + Math.abs(data[i + 3] - target[3]) <= tolerance;
  const seen = new Uint8Array(width * height);
  const stack = [px, py];
  while (stack.length) {
    const cy = stack.pop()!;
    const cx = stack.pop()!;
    let left = cx;
    while (left > 0 && !seen[cy * width + left - 1] && matches((cy * width + left - 1) * 4)) left--;
    let right = cx;
    while (right < width - 1 && !seen[cy * width + right + 1] && matches((cy * width + right + 1) * 4)) right++;
    for (let ix = left; ix <= right; ix++) {
      const k = cy * width + ix;
      seen[k] = 1;
      const i = k * 4;
      data[i] = fill[0];
      data[i + 1] = fill[1];
      data[i + 2] = fill[2];
      data[i + 3] = 255;
      for (const ny of [cy - 1, cy + 1]) {
        if (ny < 0 || ny >= height) continue;
        const nk = ny * width + ix;
        if (!seen[nk] && matches(nk * 4)) {
          seen[nk] = 1;
          stack.push(ix, ny);
        }
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}

// ---------- Whole document ----------

export function drawOp(ctx: CanvasRenderingContext2D, op: PaintOp, scale: number, step = opLength(op)) {
  if (op.kind === "stroke") drawStroke(ctx, op, step);
  else if (op.kind === "shape") drawShape(ctx, op, Math.min(1, step / opLength(op)));
  else if (step >= opLength(op)) floodFill(ctx, op.x, op.y, op.color, scale);
}

/** Clears to white and draws ops; `scale` is device pixels per CSS pixel of ctx. */
export function renderDocument(ctx: CanvasRenderingContext2D, ops: PaintOp[], scale: number, background = "#ffffff") {
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.restore();
  for (const op of ops) drawOp(ctx, op, scale);
}

/** Bounding box of an op's ink in CSS px (generous for procedural brushes). */
export function opBounds(op: StrokeOp | ShapeOp) {
  if (op.kind === "shape") {
    const pad = op.size + 2;
    return { minX: Math.min(op.x0, op.x1) - pad, minY: Math.min(op.y0, op.y1) - pad, maxX: Math.max(op.x0, op.x1) + pad, maxY: Math.max(op.y0, op.y1) + pad };
  }
  const pad = op.tool === "airbrush" ? op.size * 2.6 : op.style === "smooth" || op.tool !== "brush" ? op.size * 2.6 : 40;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of op.points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX: minX - pad, minY: minY - pad, maxX: maxX + pad, maxY: maxY + pad };
}
