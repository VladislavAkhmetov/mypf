// "Ожить": every stroke/shape becomes a rigid body (matter-js) that keeps its own sprite.
import Matter from "matter-js";
import { PaintOp, ShapeOp, StrokeOp, drawShape, drawStroke, opBounds } from "./paint-engine";

interface Piece {
  body: Matter.Body;
  startAngle: number;
  sprite: HTMLCanvasElement;
  offsetX: number;
  offsetY: number;
}

export interface PhysicsController {
  stop: () => void;
}

function spriteFor(op: StrokeOp | ShapeOp, scale: number) {
  const b = opBounds(op);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.ceil((b.maxX - b.minX) * scale));
  canvas.height = Math.max(1, Math.ceil((b.maxY - b.minY) * scale));
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, -b.minX * scale, -b.minY * scale);
  if (op.kind === "stroke") drawStroke(ctx, op);
  else drawShape(ctx, op);
  return { canvas, minX: b.minX, minY: b.minY };
}

const BODY_OPTIONS = { friction: 0.6, frictionStatic: 1, frictionAir: 0.02, restitution: 0.12, density: 0.002, slop: 0.08 };

/** Outline points of an op's ink (with stroke thickness), in canvas px. */
function outlinePoints(op: StrokeOp | ShapeOp): Matter.Vector[] {
  const out: Matter.Vector[] = [];
  const ring = (x: number, y: number, r: number) => {
    for (let k = 0; k < 8; k++) out.push({ x: x + Math.cos((k / 8) * Math.PI * 2) * r, y: y + Math.sin((k / 8) * Math.PI * 2) * r });
  };
  if (op.kind === "shape") {
    const r = op.size / 2 + 1;
    const x0 = Math.min(op.x0, op.x1), x1 = Math.max(op.x0, op.x1), y0 = Math.min(op.y0, op.y1), y1 = Math.max(op.y0, op.y1);
    if (op.shape === "line") {
      ring(op.x0, op.y0, r + 2);
      ring(op.x1, op.y1, r + 2);
    } else if (op.shape === "ellipse") {
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        ring((x0 + x1) / 2 + (Math.cos(a) * (x1 - x0)) / 2, (y0 + y1) / 2 + (Math.sin(a) * (y1 - y0)) / 2, r);
      }
    } else [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y]) => ring(x, y, r));
    return out;
  }
  if (op.tool === "eraser") return out;
  const r = Math.max(4, op.tool === "airbrush" ? op.size * 2.4 : op.size * (op.tool === "pencil" ? 0.5 : 1.1));
  const step = Math.max(1, Math.floor(op.points.length / 60));
  for (let i = 0; i < op.points.length; i += step) ring(op.points[i].x, op.points[i].y, r);
  const last = op.points.at(-1);
  if (last) ring(last.x, last.y, r);
  return out;
}

function convexHull(points: Matter.Vector[]): Matter.Vector[] {
  return Matter.Vertices.hull(points.map(p => ({ x: p.x, y: p.y })) as unknown as Matter.Vertex[]);
}

/** One convex body around a set of points (convex polygons stack stably in matter-js). */
function hullBody(points: Matter.Vector[]): Matter.Body | null {
  if (points.length < 3) return null;
  const hull = convexHull(points);
  if (hull.length < 3 || Math.abs(Matter.Vertices.area(hull as Matter.Vertex[], false)) < 16) return null;
  const centre = Matter.Vertices.centre(hull as Matter.Vertex[]);
  return Matter.Bodies.fromVertices(centre.x, centre.y, [hull], BODY_OPTIONS);
}

export function startPhysics(canvas: HTMLCanvasElement, ops: PaintOp[], width: number, height: number, scale: number): PhysicsController {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 1, scale: 0.0012 },
    enableSleeping: true,
    positionIterations: 10,
    velocityIterations: 8,
    constraintIterations: 4,
  });
  const ctx = canvas.getContext("2d")!;

  // 1. Outline points + sprite per op.
  type Item = { points: Matter.Vector[]; sprites: Array<{ canvas: HTMLCanvasElement; minX: number; minY: number }> };
  let items: Item[] = [];
  for (const op of ops) {
    if (op.kind === "fill") continue;
    const points = outlinePoints(op);
    if (points.length >= 3) items.push({ points, sprites: [spriteFor(op, scale)] });
  }

  // 2. Strokes whose hulls overlap become one object (a face drawn in several strokes falls
  //    as one piece); overlapping separate bodies would otherwise push each other forever.
  const probe = (item: Item) => {
    const hull = convexHull(item.points);
    const centre = Matter.Vertices.centre(hull as Matter.Vertex[]);
    return Matter.Bodies.fromVertices(centre.x, centre.y, [hull]);
  };
  const overlaps = (a: Item, b: Item) => {
    const ba = probe(a), bb = probe(b);
    return Matter.Bounds.overlaps(ba.bounds, bb.bounds) && Matter.Collision.collides(ba, bb) !== null;
  };
  for (let merged = true; merged; ) {
    merged = false;
    outer: for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (overlaps(items[i], items[j])) {
          items[i] = { points: [...items[i].points, ...items[j].points], sprites: [...items[i].sprites, ...items[j].sprites] };
          items = items.filter((_, k) => k !== j);
          merged = true;
          break outer;
        }
      }
    }
  }

  const pieces: Piece[] = [];
  for (const item of items) {
    const body = hullBody(item.points);
    if (!body) continue;
    for (const sprite of item.sprites) {
      pieces.push({ body, startAngle: 0, sprite: sprite.canvas, offsetX: sprite.minX - body.position.x, offsetY: sprite.minY - body.position.y });
    }
  }
  const bodies = [...new Set(pieces.map(piece => piece.body))];
  for (const body of bodies) {
    Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * 2, y: -Math.random() * 2 });
    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);
  }
  const wall = { isStatic: true, friction: 0.9, frictionStatic: 1, restitution: 0.1, slop: 0.08 };
  Matter.Composite.add(engine.world, [
    Matter.Bodies.rectangle(width / 2, height + 40, width * 3, 80, wall),
    Matter.Bodies.rectangle(-40, height / 2, 80, height * 4, wall),
    Matter.Bodies.rectangle(width + 40, height / 2, 80, height * 4, wall),
    ...bodies,
  ]);

  // Grab-and-throw with the pointer.
  let grab: Matter.Constraint | null = null;
  const point = (event: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * width, y: ((event.clientY - rect.top) / rect.height) * height };
  };
  const onDown = (event: PointerEvent) => {
    const p = point(event);
    const hit = Matter.Query.point(bodies, p)[0];
    if (!hit) return;
    const body = hit.parent ?? hit;
    Matter.Sleeping.set(body, false);
    canvas.setPointerCapture(event.pointerId);
    grab = Matter.Constraint.create({
      pointA: p,
      bodyB: body,
      pointB: { x: p.x - body.position.x, y: p.y - body.position.y },
      stiffness: 0.18,
      damping: 0.08,
      length: 0,
    });
    Matter.Composite.add(engine.world, grab);
  };
  const onMove = (event: PointerEvent) => {
    if (grab) grab.pointA = point(event);
  };
  const onUp = () => {
    if (grab?.bodyB) Matter.Sleeping.set(grab.bodyB, false);
    if (grab) Matter.Composite.remove(engine.world, grab);
    grab = null;
  };
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);

  // Fixed 120 Hz substeps driven by real time: stable stacking, same speed on any display.
  const STEP = 1000 / 120;
  let frame = 0;
  let last = performance.now();
  let accumulator = 0;
  const tick = (now: number) => {
    accumulator = Math.min(accumulator + (now - last), 100);
    last = now;
    while (accumulator >= STEP) {
      Matter.Engine.update(engine, STEP);
      accumulator -= STEP;
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const piece of pieces) {
      const { body } = piece;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.translate(body.position.x, body.position.y);
      ctx.rotate(body.angle - piece.startAngle);
      ctx.drawImage(piece.sprite, piece.offsetX, piece.offsetY, piece.sprite.width / scale, piece.sprite.height / scale);
    }
    if (grab) {
      const b = grab.bodyB!;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.strokeStyle = "rgba(49, 106, 197, 0.7)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(grab.pointA.x, grab.pointA.y);
      const anchor = Matter.Vector.add(b.position, grab.pointB!);
      ctx.lineTo(anchor.x, anchor.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return {
    stop: () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      Matter.Engine.clear(engine);
    },
  };
}
