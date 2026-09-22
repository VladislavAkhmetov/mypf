"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  tone: 0 | 1 | 2;
  orbit: number;
  phase: number;
  spin: number;
};

type Palette = {
  bg: string;
  tones: [string, string, string];
};

const PALETTES: Palette[] = [
  { bg: "#00354d", tones: ["#d3ff6a", "#9fe7f2", "#ffffff"] },
  { bg: "#0b1220", tones: ["#ff8ed8", "#244bff", "#f4f7ff"] },
  { bg: "#1a140c", tones: ["#ffb703", "#fb8500", "#fff6e5"] },
  { bg: "#ece9d8", tones: ["#245edc", "#c43e1c", "#13211f"] },
  { bg: "#081c14", tones: ["#7dffb3", "#eaff6a", "#f7fff8"] },
];

const FOLDS = [4, 6, 8] as const;

type FieldState = {
  particles: Particle[];
  pointer: { x: number; y: number; inside: boolean; down: boolean };
  folds: number;
  paletteIndex: number;
  width: number;
  height: number;
  time: number;
};

function spawn(state: FieldState, count: number, origin?: { x: number; y: number }) {
  const cx = origin?.x ?? state.width * 0.5;
  const cy = origin?.y ?? state.height * 0.5;
  const reach = Math.min(state.width, state.height);
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const radius = origin ? Math.random() * 26 : 12 + Math.random() * reach * 0.22;
    const speed = origin ? 1.8 + Math.random() * 2.8 : 0.2 + Math.random() * 0.7;
    state.particles.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      vx: Math.cos(angle + 0.7) * speed,
      vy: Math.sin(angle + 0.7) * speed,
      size: origin ? 2.2 + Math.random() * 5.5 : 2.6 + Math.random() * 7,
      tone: ((Math.random() * 3) | 0) as 0 | 1 | 2,
      orbit: origin ? 18 + Math.random() * 90 : 28 + Math.random() * reach * 0.28,
      phase: Math.random() * Math.PI * 2,
      spin: 0.35 + Math.random() * 1.1,
    });
  }
  if (state.particles.length > 160) {
    state.particles.splice(0, state.particles.length - 160);
  }
}

function snapshotCanvas(source: HTMLCanvasElement, mime: string, quality: number, maxWidth: number) {
  const scale = Math.min(1, maxWidth / source.width);
  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(source.width * scale));
  out.height = Math.max(1, Math.round(source.height * scale));
  const ctx = out.getContext("2d");
  if (!ctx) return source.toDataURL(mime, quality);
  ctx.drawImage(source, 0, 0, out.width, out.height);
  return out.toDataURL(mime, quality);
}

export function PaintWindow() {
  const { setWallpaper, showBalloon } = useWindowManager();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<FieldState>({
    particles: [],
    pointer: { x: 0, y: 0, inside: false, down: false },
    folds: 6,
    paletteIndex: 0,
    width: 1,
    height: 1,
    time: 0,
  });

  const [folds, setFolds] = useState(6);
  const [paletteIndex, setPaletteIndex] = useState(0);

  const applyPalette = useCallback((index: number) => {
    stateRef.current.paletteIndex = index;
    setPaletteIndex(index);
  }, []);

  const applyFolds = useCallback((value: number) => {
    stateRef.current.folds = value;
    setFolds(value);
  }, []);

  const reshuffle = useCallback(() => {
    xpSound.click();
    const state = stateRef.current;
    const nextPalette = (state.paletteIndex + 1 + Math.floor(Math.random() * (PALETTES.length - 1))) % PALETTES.length;
    const nextFolds = FOLDS[Math.floor(Math.random() * FOLDS.length)];
    state.particles = [];
      spawn(state, 88);
    applyPalette(nextPalette);
    applyFolds(nextFolds);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = PALETTES[nextPalette].bg;
      ctx.fillRect(0, 0, state.width, state.height);
    }
  }, [applyFolds, applyPalette]);

  const captureFrame = useCallback((kind: "wallpaper" | "download") => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (kind === "wallpaper") return snapshotCanvas(canvas, "image/jpeg", 0.82, 1280);
    return snapshotCanvas(canvas, "image/png", 1, 1920);
  }, []);

  const handleWallpaper = useCallback(() => {
    const url = captureFrame("wallpaper");
    if (!url) return;
    try {
      setWallpaper(url);
      showBalloon("Обои установлены", "Это поле теперь на рабочем столе.");
    } catch {
      showBalloon("Не удалось сохранить", "Снимок не поместился в браузер. Попробуй ещё раз.");
    }
  }, [captureFrame, setWallpaper, showBalloon]);

  const handleDownload = useCallback(() => {
    xpSound.click();
    const url = captureFrame("download");
    if (!url) return;
    const link = document.createElement("a");
    link.href = url;
    link.download = `amazi-field-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [captureFrame]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = stateRef.current;
    let frame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const fit = () => {
      const rect = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const resized = Math.abs(state.width - width) > 48 || Math.abs(state.height - height) > 48;
      state.width = width;
      state.height = height;
      if (state.particles.length === 0 || resized) {
        state.particles = [];
        spawn(state, 88);
      }
      ctx.fillStyle = PALETTES[state.paletteIndex].bg;
      ctx.fillRect(0, 0, width, height);
    };

    const pointerToLocal = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      const point = pointerToLocal(event);
      state.pointer.x = point.x;
      state.pointer.y = point.y;
      state.pointer.inside = true;
    };

    const onPointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      const point = pointerToLocal(event);
      state.pointer.x = point.x;
      state.pointer.y = point.y;
      state.pointer.inside = true;
      state.pointer.down = true;
      spawn(state, 18, point);
    };

    const onPointerUp = () => {
      state.pointer.down = false;
    };

    const onPointerLeave = () => {
      state.pointer.inside = false;
      state.pointer.down = false;
    };

    const tick = () => {
      frame = requestAnimationFrame(tick);
      state.time += reduceMotion ? 0.008 : 0.016;
      const { width: w, height: h } = state;
      const palette = PALETTES[state.paletteIndex];
      const idleX = w * 0.5 + Math.cos(state.time * 0.55) * Math.min(w, h) * 0.08;
      const idleY = h * 0.5 + Math.sin(state.time * 0.42) * Math.min(w, h) * 0.06;
      const targetX = state.pointer.inside ? state.pointer.x : idleX;
      const targetY = state.pointer.inside ? state.pointer.y : idleY;
      const cx = w * 0.5;
      const cy = h * 0.5;

      if (state.pointer.down && !reduceMotion) spawn(state, 3, state.pointer);

      for (const particle of state.particles) {
        const seatX = targetX + Math.cos(state.time * particle.spin + particle.phase) * particle.orbit;
        const seatY = targetY + Math.sin(state.time * particle.spin + particle.phase) * particle.orbit * 0.82;
        particle.vx += (seatX - particle.x) * (state.pointer.down ? 0.045 : 0.02);
        particle.vy += (seatY - particle.y) * (state.pointer.down ? 0.045 : 0.02);
        particle.vx += -(particle.y - cy) * 0.00018;
        particle.vy += (particle.x - cx) * 0.00018;
        particle.vx *= 0.9;
        particle.vy *= 0.9;
        particle.x += particle.vx;
        particle.y += particle.vy;
      }

      ctx.globalAlpha = reduceMotion ? 0.2 : 0.055;
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalAlpha = 1;

      const foldsCount = state.folds;
      ctx.lineCap = "round";
      for (const particle of state.particles) {
        const color = palette.tones[particle.tone];
        for (let i = 0; i < foldsCount; i += 1) {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate((Math.PI * 2 * i) / foldsCount);
          if (i % 2 === 1) ctx.scale(1, -1);
          ctx.translate(-cx, -cy);
          ctx.fillStyle = color;
          ctx.globalAlpha = 0.22;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 0.95;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.globalAlpha = 0.7;
          ctx.lineWidth = Math.max(1.4, particle.size * 0.55);
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * 8, particle.y - particle.vy * 8);
          ctx.stroke();
          ctx.restore();
        }
      }
      ctx.globalAlpha = 1;
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div className="flex h-full flex-col bg-[#ece9d8] text-xs text-slate-800 select-none">
      <div className="xp-toolbar flex-shrink-0">
          {FOLDS.map((value) => (
            <button
              key={value}
              type="button"
              className="xp-toolbar-btn min-w-7 justify-center font-mono text-[11px]"
              aria-pressed={folds === value}
              onClick={() => {
                xpSound.click();
                applyFolds(value);
              }}
              style={{
                cursor: xpCursors.pointer,
                background: folds === value ? "#fff" : undefined,
                borderColor: folds === value ? "#7a9eb5" : undefined,
              }}
              title={`${value} осей`}
            >
              {value}
            </button>
          ))}

          <div className="xp-toolbar-sep" />

          {PALETTES.map((palette, index) => (
            <button
              key={palette.bg}
              type="button"
              aria-label={`Палитра ${index + 1}`}
              aria-pressed={paletteIndex === index}
              onClick={() => {
                xpSound.click();
                applyPalette(index);
              }}
              className="h-5 w-5 rounded-sm border"
              style={{
                cursor: xpCursors.pointer,
                background: palette.bg,
                boxShadow: `inset 0 0 0 2px ${palette.tones[0]}`,
                outline: paletteIndex === index ? "2px solid #316ac5" : "none",
                outlineOffset: 1,
              }}
            />
          ))}

          <div className="xp-toolbar-sep" />

          <button
            type="button"
            className="xp-toolbar-btn"
            onClick={reshuffle}
            style={{ cursor: xpCursors.pointer }}
          >
            Ещё
          </button>
          <button
            type="button"
            className="xp-toolbar-btn"
            onClick={handleDownload}
            style={{ cursor: xpCursors.pointer }}
            title="Скачать кадр"
          >
            PNG
          </button>
          <button
            type="button"
            onClick={handleWallpaper}
            className="ml-auto rounded-sm border border-[#003c9f] bg-[#245edc] px-2.5 py-0.5 font-semibold text-white hover:bg-[#1f4fc0]"
            style={{ cursor: xpCursors.pointer }}
            data-ym-goal="paint_set_wallpaper"
          >
            На стол
          </button>
      </div>

      <div ref={wrapRef} className="relative min-h-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block h-full w-full touch-none"
          style={{ cursor: "crosshair" }}
        />
      </div>
    </div>
  );
}
