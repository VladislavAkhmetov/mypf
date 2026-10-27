"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import {
  BrushStyle,
  PaintOp,
  Point,
  ShapeFill,
  ShapeOp,
  StrokeOp,
  Tool,
  XP_PALETTE,
  drawShape,
  drawStroke,
  floodFill,
  renderDocument,
} from "./paint/paint-engine";
import { startPhysics, type PhysicsController } from "./paint/paint-physics";
import { exportTimelapseGif, playTimelapse } from "./paint/paint-timelapse";
import { ToolIcon } from "./paint/paint-icons";
import styles from "./paint/paint.module.css";

// Windows XP Paint, rebuilt: classic toolbox/palette/menus, with modern internals —
// pressure-smoothed strokes (perfect-freehand), procedural "Harmony" brushes,
// a physics mode where the drawing comes alive (matter-js) and a timelapse/GIF replay.

const TOOLS: Array<{ id: Tool; label: string; hint: string }> = [
  { id: "eraser", label: "Ластик", hint: "Стирает цветом фона." },
  { id: "fill", label: "Заливка", hint: "Заливает замкнутую область цветом." },
  { id: "picker", label: "Выбор цветов", hint: "Берёт цвет с рисунка. Правая кнопка — цвет фона." },
  { id: "pencil", label: "Карандаш", hint: "Рисует тонкой линией." },
  { id: "brush", label: "Кисть", hint: "Рисует кистью выбранного стиля." },
  { id: "airbrush", label: "Распылитель", hint: "Распыляет краску." },
  { id: "line", label: "Линия", hint: "Рисует прямую линию." },
  { id: "rect", label: "Прямоугольник", hint: "Рисует прямоугольник." },
  { id: "ellipse", label: "Эллипс", hint: "Рисует эллипс." },
  { id: "roundrect", label: "Скруглённый прямоугольник", hint: "Рисует прямоугольник со скруглёнными углами." },
];

const BRUSHES: Array<{ id: BrushStyle; label: string }> = [
  { id: "smooth", label: "Гладкая" },
  { id: "sketchy", label: "Набросок" },
  { id: "shaded", label: "Штриховка" },
  { id: "web", label: "Паутина" },
  { id: "fur", label: "Мех" },
];

const SIZES = [1, 2, 3, 5, 8];
const FILLS: ShapeFill[] = ["outline", "both", "fill"];
type Mode = "draw" | "physics" | "timelapse" | "exporting";
type Menu = "file" | "edit" | "image" | "help" | null;

function brushPreview(style: BrushStyle) {
  const canvas = document.createElement("canvas");
  canvas.width = 104;
  canvas.height = 28;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);
  const points: Point[] = Array.from({ length: 34 }, (_, i) => ({ x: 4 + i * 1.3, y: 7 + Math.sin(i / 4.5) * 4, p: 0.5 }));
  drawStroke(ctx, { kind: "stroke", tool: "brush", style, color: "#000000", size: 2, seed: 7, simulatePressure: true, points });
  return canvas.toDataURL();
}

/** Seed for procedural brushes so replays redraw them identically. */
function nextSeed() {
  return Math.floor(Math.random() * 1e9);
}

function snapshot(source: HTMLCanvasElement, mime: string, quality: number, maxWidth: number) {
  const scale = Math.min(1, maxWidth / source.width);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(source.width * scale));
  out.height = Math.max(1, Math.round(source.height * scale));
  out.getContext("2d")!.drawImage(source, 0, 0, out.width, out.height);
  return out.toDataURL(mime, quality);
}

function download(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function PaintWindow() {
  const { setWallpaper, showBalloon, activeWindowId } = useWindowManager();
  const [tool, setTool] = useState<Tool>("brush");
  const [brushStyle, setBrushStyle] = useState<BrushStyle>("smooth");
  const [size, setSize] = useState(3);
  const [shapeFill, setShapeFill] = useState<ShapeFill>("outline");
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [mode, setMode] = useState<Mode>("draw");
  const [menu, setMenu] = useState<Menu>(null);
  const [coords, setCoords] = useState<string>("");
  const [canvasSize, setCanvasSize] = useState<{ w: number; h: number } | null>(null);
  const [counts, setCounts] = useState({ ops: 0, redo: 0 });
  const [previews] = useState(() => Object.fromEntries(BRUSHES.map(b => [b.id, brushPreview(b.id)])) as Record<BrushStyle, string>);

  const workspaceRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<HTMLCanvasElement>(null);
  const opsRef = useRef<PaintOp[]>([]);
  const redoRef = useRef<PaintOp[]>([]);
  const currentRef = useRef<{ op: StrokeOp | ShapeOp; drawn: number } | null>(null);
  const physicsRef = useRef<PhysicsController | null>(null);
  const stopReplayRef = useRef<(() => void) | null>(null);
  const dpr = typeof window === "undefined" ? 1 : Math.min(2, window.devicePixelRatio || 1);

  const hasOps = counts.ops > 0;
  const canRedo = counts.redo > 0;
  const bump = () => setCounts({ ops: opsRef.current.length, redo: redoRef.current.length });

  const contexts = useCallback(() => {
    const base = baseRef.current?.getContext("2d", { willReadFrequently: true }) ?? null;
    const live = liveRef.current?.getContext("2d") ?? null;
    return { base, live };
  }, []);

  const redraw = useCallback(() => {
    const { base, live } = contexts();
    if (!base || !live) return;
    base.setTransform(dpr, 0, 0, dpr, 0, 0);
    live.setTransform(dpr, 0, 0, dpr, 0, 0);
    renderDocument(base, opsRef.current, dpr);
    live.clearRect(0, 0, live.canvas.width / dpr, live.canvas.height / dpr);
  }, [contexts, dpr]);

  // The canvas follows the window while it is empty, then keeps its size (like Paint).
  useEffect(() => {
    const el = workspaceRef.current;
    if (!el) return;
    const fit = () => {
      if (opsRef.current.length && canvasSize) return;
      const w = Math.round(Math.max(320, Math.min(1600, el.clientWidth - 24)));
      const h = Math.round(Math.max(220, Math.min(1000, el.clientHeight - 24)));
      setCanvasSize(prev => (prev && prev.w === w && prev.h === h ? prev : { w, h }));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, [canvasSize]);

  useEffect(() => {
    if (canvasSize) redraw();
  }, [canvasSize, redraw]);

  useEffect(() => () => {
    physicsRef.current?.stop();
    stopReplayRef.current?.();
  }, []);

  const toPoint = (clientX: number, clientY: number, pressure: number, pointerType: string): Point => {
    const rect = liveRef.current!.getBoundingClientRect();
    return {
      x: Math.round((clientX - rect.left) * 10) / 10,
      y: Math.round((clientY - rect.top) * 10) / 10,
      p: pointerType === "pen" ? pressure || 0.5 : 0.5,
    };
  };
  const point = (event: React.PointerEvent) => toPoint(event.clientX, event.clientY, event.pressure, event.pointerType);

  const commit = (op: PaintOp) => {
    opsRef.current = [...opsRef.current, op];
    redoRef.current = [];
    bump();
  };

  // ---------- Drawing ----------
  const onPointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (mode !== "draw") return;
    setMenu(null);
    const { base, live } = contexts();
    if (!base || !live) return;
    const p = point(event);
    const secondary = event.button === 2;
    const color = secondary ? bg : fg;

    if (tool === "picker") {
      const [r, g, b] = base.getImageData(Math.floor(p.x * dpr), Math.floor(p.y * dpr), 1, 1).data;
      const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, "0")).join("")}`;
      if (secondary) setBg(hex);
      else setFg(hex);
      return;
    }
    if (tool === "fill") {
      floodFill(base, p.x, p.y, color, dpr);
      commit({ kind: "fill", x: p.x, y: p.y, color });
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    if (tool === "line" || tool === "rect" || tool === "ellipse" || tool === "roundrect") {
      currentRef.current = {
        op: { kind: "shape", shape: tool, color, fillColor: secondary ? fg : bg, fill: shapeFill, size: SIZES[size - 1], x0: p.x, y0: p.y, x1: p.x, y1: p.y },
        drawn: 0,
      };
      return;
    }
    const op: StrokeOp = {
      kind: "stroke",
      tool,
      style: tool === "brush" ? brushStyle : "smooth",
      color: tool === "eraser" ? bg : color,
      size: tool === "airbrush" ? [3, 5, 8][Math.min(2, Math.floor((size - 1) / 2))] : SIZES[size - 1],
      seed: nextSeed(),
      simulatePressure: event.pointerType !== "pen",
      points: [p],
    };
    currentRef.current = { op, drawn: 0 };
    renderLive();
  };

  const renderLive = () => {
    const current = currentRef.current;
    const live = liveRef.current?.getContext("2d");
    if (!current || !live) return;
    const { op } = current;
    const incremental = op.kind === "stroke" && (op.tool === "airbrush" || (op.tool === "brush" && op.style !== "smooth"));
    if (!incremental) live.clearRect(0, 0, live.canvas.width / dpr, live.canvas.height / dpr);
    if (op.kind === "shape") drawShape(live, op);
    else if (incremental) {
      drawStroke(live, op, op.points.length, current.drawn);
      current.drawn = op.points.length;
    } else drawStroke(live, op);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const p = point(event);
    setCoords(`${Math.round(p.x)}, ${Math.round(p.y)}`);
    const current = currentRef.current;
    if (!current || mode !== "draw") return;
    if (current.op.kind === "shape") {
      let { x, y } = p;
      if (event.shiftKey) {
        // Shift: perfect squares/circles and 45° lines, as in Paint.
        const dx = x - current.op.x0;
        const dy = y - current.op.y0;
        const d = Math.max(Math.abs(dx), Math.abs(dy));
        x = current.op.x0 + Math.sign(dx || 1) * d;
        y = current.op.y0 + Math.sign(dy || 1) * d;
      }
      current.op = { ...current.op, x1: x, y1: y };
    } else {
      const native = event.nativeEvent;
      const events = typeof native.getCoalescedEvents === "function" ? native.getCoalescedEvents() : [];
      const list = events.length ? events.map(e => toPoint(e.clientX, e.clientY, e.pressure, e.pointerType)) : [p];
      current.op.points.push(...list);
    }
    renderLive();
  };

  const onPointerUp = () => {
    const current = currentRef.current;
    currentRef.current = null;
    if (!current) return;
    const { base, live } = contexts();
    if (!base || !live) return;
    const { op } = current;
    if (op.kind === "shape") {
      if (op.x0 === op.x1 && op.y0 === op.y1) {
        live.clearRect(0, 0, live.canvas.width / dpr, live.canvas.height / dpr);
        return;
      }
      drawShape(base, op);
    } else if (op.tool === "airbrush" || (op.tool === "brush" && op.style !== "smooth")) {
      // Procedural strokes: copy the exact live pixels.
      base.save();
      base.setTransform(1, 0, 0, 1, 0, 0);
      base.drawImage(live.canvas, 0, 0);
      base.restore();
    } else drawStroke(base, op);
    live.clearRect(0, 0, live.canvas.width / dpr, live.canvas.height / dpr);
    commit(op);
  };

  // ---------- Commands ----------
  const undo = useCallback(() => {
    if (mode !== "draw" || !opsRef.current.length) return;
    redoRef.current = [...redoRef.current, opsRef.current.at(-1)!];
    opsRef.current = opsRef.current.slice(0, -1);
    redraw();
    bump();
  }, [mode, redraw]);

  const redo = useCallback(() => {
    if (mode !== "draw" || !redoRef.current.length) return;
    opsRef.current = [...opsRef.current, redoRef.current.at(-1)!];
    redoRef.current = redoRef.current.slice(0, -1);
    redraw();
    bump();
  }, [mode, redraw]);

  const stopEffects = () => {
    physicsRef.current?.stop();
    physicsRef.current = null;
    stopReplayRef.current?.();
    stopReplayRef.current = null;
    setMode("draw");
  };

  const clearAll = () => {
    stopEffects();
    opsRef.current = [];
    redoRef.current = [];
    redraw();
    bump();
  };

  const toggleLife = () => {
    xpSound.click();
    setMenu(null);
    if (mode === "physics") {
      stopEffects();
      redraw();
      return;
    }
    if (!hasOps || !baseRef.current || !canvasSize) return;
    stopEffects();
    physicsRef.current = startPhysics(baseRef.current, opsRef.current, canvasSize.w, canvasSize.h, dpr);
    setMode("physics");
  };

  const runTimelapse = () => {
    xpSound.click();
    setMenu(null);
    const { base, live } = contexts();
    if (!hasOps || !base || !live) return;
    stopEffects();
    redraw();
    setMode("timelapse");
    stopReplayRef.current = playTimelapse(base, live, opsRef.current, dpr, () => {
      stopReplayRef.current = null;
      redraw();
      setMode("draw");
    });
  };

  const saveGif = async () => {
    xpSound.click();
    setMenu(null);
    if (!hasOps || !canvasSize) return;
    stopEffects();
    redraw();
    setMode("exporting");
    try {
      const blob = await exportTimelapseGif(opsRef.current, canvasSize.w, canvasSize.h);
      const url = URL.createObjectURL(blob);
      download(url, "risunok-timelapse.gif");
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      showBalloon("Таймлапс сохранён", "GIF с процессом рисования скачан.");
    } catch {
      showBalloon("Не удалось сохранить GIF", "Попробуйте ещё раз.");
    } finally {
      setMode("draw");
    }
  };

  const savePng = () => {
    xpSound.click();
    setMenu(null);
    if (baseRef.current) download(snapshot(baseRef.current, "image/png", 1, 3200), "risunok.png");
  };

  const toWallpaper = () => {
    xpSound.click();
    setMenu(null);
    if (!baseRef.current) return;
    try {
      setWallpaper(snapshot(baseRef.current, "image/jpeg", 0.85, 1600));
      showBalloon("Фоновый рисунок", "Рисунок теперь на рабочем столе.");
    } catch {
      showBalloon("Не удалось сохранить", "Рисунок не поместился в браузер.");
    }
  };

  useEffect(() => {
    if (activeWindowId !== "paint") return;
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return;
      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (key === "y" || (key === "z" && event.shiftKey)) {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeWindowId, undo, redo]);

  // ---------- UI ----------
  const busy = mode === "timelapse" || mode === "exporting";
  const toolInfo = TOOLS.find(t => t.id === tool)!;
  const status =
    mode === "physics"
      ? "Рисунок ожил: хватайте и бросайте его мышью. «Остановить» вернёт всё на место."
      : mode === "timelapse"
        ? "Воспроизведение таймлапса…"
        : mode === "exporting"
          ? "Создаю GIF…"
          : !hasOps
            ? "Нарисуйте что-нибудь, а потом нажмите «Ожить» или «Таймлапс»."
            : tool === "brush"
              ? `Кисть «${BRUSHES.find(b => b.id === brushStyle)!.label}». ${toolInfo.hint}`
              : toolInfo.hint;

  type Command = "new" | "png" | "gif" | "wallpaper" | "undo" | "redo" | "clear" | "life" | "timelapse" | "about";
  const menuItems: Record<Exclude<Menu, null>, Array<{ id: Command; label: string; shortcut?: string; disabled?: boolean } | "sep">> = {
    file: [
      { id: "new", label: "Создать" },
      "sep",
      { id: "png", label: "Сохранить как PNG…" },
      { id: "gif", label: "Сохранить таймлапс (GIF)…", disabled: !hasOps },
      "sep",
      { id: "wallpaper", label: "Сделать фоновым рисунком рабочего стола" },
    ],
    edit: [
      { id: "undo", label: "Отменить", shortcut: "Ctrl+Z", disabled: !hasOps },
      { id: "redo", label: "Повторить", shortcut: "Ctrl+Y", disabled: !canRedo },
      "sep",
      { id: "clear", label: "Очистить рисунок" },
    ],
    image: [
      { id: "life", label: mode === "physics" ? "Остановить" : "Ожить", disabled: !hasOps },
      { id: "timelapse", label: "Таймлапс", disabled: !hasOps },
    ],
    help: [{ id: "about", label: "О программе Paint" }],
  };

  const runCommand = (command: Command) => {
    setMenu(null);
    switch (command) {
      case "new":
      case "clear":
        xpSound.click();
        clearAll();
        break;
      case "png":
        savePng();
        break;
      case "gif":
        void saveGif();
        break;
      case "wallpaper":
        toWallpaper();
        break;
      case "undo":
        undo();
        break;
      case "redo":
        redo();
        break;
      case "life":
        toggleLife();
        break;
      case "timelapse":
        runTimelapse();
        break;
      case "about":
        showBalloon("Paint", "Кисти Harmony, перо perfect-freehand, физика matter-js и таймлапс в GIF.");
        break;
    }
  };

  return (
    <div className={styles.paint} onPointerDown={event => { if (!(event.target as HTMLElement).closest("[data-menu]")) setMenu(null); }}>
      <nav className={styles.menuBar} aria-label="Меню Paint">
        {([["file", "Файл"], ["edit", "Правка"], ["image", "Рисунок"], ["help", "Справка"]] as Array<[Exclude<Menu, null>, string]>).map(([id, label]) => (
          <div key={id} className={styles.menuRoot} data-menu>
            <button
              type="button"
              className={menu === id ? styles.menuOpen : ""}
              onClick={() => setMenu(menu === id ? null : id)}
              onMouseEnter={() => menu && setMenu(id)}
            >
              <u>{label[0]}</u>{label.slice(1)}
            </button>
            {menu === id && (
              <div className={styles.menuList} role="menu">
                {menuItems[id].map((item, index) =>
                  item === "sep" ? (
                    <hr key={index} />
                  ) : (
                    <button key={item.id} type="button" role="menuitem" disabled={item.disabled || busy} onClick={() => runCommand(item.id)}>
                      <span>{item.label}</span>
                      {item.shortcut && <kbd>{item.shortcut}</kbd>}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className={styles.toolbar}>
        <button type="button" className={styles.toolbarButton} onClick={undo} disabled={!hasOps || mode !== "draw"} title="Отменить (Ctrl+Z)">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 3 2 7l4 4" /><path d="M2.5 7H10a4 4 0 0 1 0 8H8" /></svg>
          Отменить
        </button>
        <button type="button" className={styles.toolbarButton} onClick={redo} disabled={!canRedo || mode !== "draw"} title="Повторить (Ctrl+Y)">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m10 3 4 4-4 4" /><path d="M13.5 7H6a4 4 0 0 0 0 8h2" /></svg>
        </button>
        <span className={styles.separator} />
        <button type="button" className={`${styles.toolbarButton} ${styles.magic} ${mode === "physics" ? styles.pressed : ""}`} onClick={toggleLife} disabled={!hasOps || busy}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="5" cy="11" r="3" /><path d="M9.5 2.5l1 2 2 1-2 1-1 2-1-2-2-1 2-1z" /></svg>
          {mode === "physics" ? "Остановить" : "Ожить"}
        </button>
        <button type="button" className={`${styles.toolbarButton} ${mode === "timelapse" ? styles.pressed : ""}`} onClick={runTimelapse} disabled={!hasOps || busy}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" /><path d="M6.5 5.5v5l4-2.5z" /></svg>
          Таймлапс
        </button>
        <button type="button" className={styles.toolbarButton} onClick={saveGif} disabled={!hasOps || busy}>
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M4.5 6.5 8 10l3.5-3.5M2.5 13.5h11" /></svg>
          {mode === "exporting" ? "Создаю…" : "GIF"}
        </button>
        <span className={styles.separator} />
        <button type="button" className={styles.toolbarButton} onClick={toWallpaper} disabled={busy} data-ym-goal="paint_set_wallpaper">
          <svg viewBox="0 0 16 16" aria-hidden="true"><rect x="1.5" y="2.5" width="13" height="9" /><path d="M5 14.5h6M8 11.5v3" /></svg>
          На рабочий стол
        </button>
      </div>

      <div className={styles.main}>
        <aside className={styles.toolbox} aria-label="Инструменты">
          <div className={styles.toolGrid}>
            {TOOLS.map(t => (
              <button
                key={t.id}
                type="button"
                title={t.label}
                aria-label={t.label}
                aria-pressed={tool === t.id}
                className={tool === t.id ? styles.toolActive : ""}
                disabled={mode !== "draw"}
                onClick={() => { xpSound.click(); setTool(t.id); }}
              >
                <ToolIcon tool={t.id} />
              </button>
            ))}
          </div>
          <div className={styles.optionBox}>
            {tool === "brush" &&
              BRUSHES.map(b => (
                <button key={b.id} type="button" title={b.label} aria-label={`Стиль кисти: ${b.label}`} className={brushStyle === b.id ? styles.optionActive : ""} onClick={() => { xpSound.click(); setBrushStyle(b.id); }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previews[b.id]} alt="" width={52} height={14} />
                </button>
              ))}
            {(tool === "rect" || tool === "ellipse" || tool === "roundrect") &&
              FILLS.map(fill => (
                <button key={fill} type="button" aria-label={{ outline: "Только контур", both: "Контур и заливка", fill: "Только заливка" }[fill]} className={shapeFill === fill ? styles.optionActive : ""} onClick={() => setShapeFill(fill)}>
                  <span className={`${styles.fillSample} ${styles[`fill_${fill}`]}`} />
                </button>
              ))}
            {(tool === "pencil" || tool === "eraser" || tool === "line" || tool === "airbrush" || (tool === "brush" && brushStyle === "smooth") || tool === "rect" || tool === "ellipse" || tool === "roundrect") && (
              <div className={styles.sizes}>
                {SIZES.map((s, i) => (
                  <button key={s} type="button" aria-label={`Толщина ${s}`} className={size === i + 1 ? styles.optionActive : ""} onClick={() => setSize(i + 1)}>
                    <i style={{ height: Math.max(1, Math.round(s * 0.75)) }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        <div ref={workspaceRef} className={styles.workspace}>
          {canvasSize && (
            <div className={styles.canvasWrap} style={{ width: canvasSize.w, height: canvasSize.h }}>
              <canvas ref={baseRef} width={canvasSize.w * dpr} height={canvasSize.h * dpr} style={{ width: canvasSize.w, height: canvasSize.h }} className={mode === "physics" ? styles.grabbable : ""} aria-label="Холст" />
              <canvas
                ref={liveRef}
                width={canvasSize.w * dpr}
                height={canvasSize.h * dpr}
                style={{ width: canvasSize.w, height: canvasSize.h, pointerEvents: mode === "physics" ? "none" : undefined }}
                className={`${styles.live} ${styles[`cursor_${tool}`] ?? ""}`}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onPointerLeave={() => setCoords("")}
                onContextMenu={event => event.preventDefault()}
              />
              <i className={`${styles.handle} ${styles.handleRight}`} />
              <i className={`${styles.handle} ${styles.handleBottom}`} />
              <i className={`${styles.handle} ${styles.handleCorner}`} />
            </div>
          )}
        </div>
      </div>

      <footer className={styles.paletteBar}>
        <div className={styles.current} aria-label="Текущие цвета">
          <span className={styles.bgSwatch} style={{ background: bg }} />
          <span className={styles.fgSwatch} style={{ background: fg }} />
        </div>
        <div className={styles.palette} role="listbox" aria-label="Палитра">
          {XP_PALETTE.map(color => (
            <button
              key={color}
              type="button"
              aria-label={`Цвет ${color}`}
              style={{ background: color }}
              onClick={() => setFg(color)}
              onContextMenu={event => {
                event.preventDefault();
                setBg(color);
              }}
            />
          ))}
        </div>
      </footer>

      <div className={styles.statusBar}>
        <span>{status}</span>
        <span className={styles.statusCell}>{coords}</span>
        <span className={styles.statusCell}>{canvasSize ? `${canvasSize.w}×${canvasSize.h}` : ""}</span>
      </div>
    </div>
  );
}
