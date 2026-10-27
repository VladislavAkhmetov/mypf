"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { MEADOW } from "./pixel-art";

// Square, grid-snapped particles: debris, grass bits and dust in the meadow palette.
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface EffectsCanvasHandle {
  emitFlagSparks: (x: number, y: number) => void;
  emitExplosion: (x: number, y: number) => void;
  emitWaveRipple: (x: number, y: number) => void;
  emitVictoryBurst: (x: number, y: number) => void;
  clear: () => void;
}

export const EffectsCanvas = forwardRef<EffectsCanvasHandle, { pixel: number; className?: string }>(
  ({ pixel, className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const frame = useRef<number | null>(null);
    const pixelRef = useRef(Math.max(1, pixel));
    useEffect(() => {
      pixelRef.current = Math.max(1, pixel);
    }, [pixel]);

    const run = () => {
      if (frame.current !== null) return;
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;
      const step = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const px = pixelRef.current;
        particles.current = particles.current.filter(p => {
          p.life += 1;
          p.vy += p.gravity;
          p.x += p.vx;
          p.y += p.vy;
          if (p.life >= p.maxLife) return false;
          // Blink out during the last frames instead of fading: reads as 8-bit.
          if (p.maxLife - p.life < 8 && p.life % 2) return true;
          ctx.fillStyle = p.color;
          const size = p.size * px;
          ctx.fillRect(Math.round(p.x / px) * px, Math.round(p.y / px) * px, size, size);
          return true;
        });
        if (particles.current.length) frame.current = requestAnimationFrame(step);
        else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          frame.current = null;
        }
      };
      frame.current = requestAnimationFrame(step);
    };

    const burst = (x: number, y: number, count: number, colors: string[], speed: number, gravity: number, life: number, size = 1) => {
      const px = pixelRef.current;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = (0.4 + Math.random()) * speed * px * 0.5;
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity - (gravity ? speed * px * 0.25 : 0),
          gravity: gravity * px * 0.08,
          life: 0,
          maxLife: life + Math.floor(Math.random() * life * 0.5),
          size: Math.random() < 0.3 ? size + 1 : size,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      run();
    };

    useImperativeHandle(ref, () => ({
      emitFlagSparks: (x, y) => burst(x, y, 8, [MEADOW.grassLight, MEADOW.grassDark, MEADOW.grass], 2.2, 1, 22),
      emitExplosion: (x, y) => {
        burst(x, y, 26, [MEADOW.orange, MEADOW.yellow, MEADOW.red, MEADOW.white], 4.2, 0.6, 34, 1);
        burst(x, y, 18, [MEADOW.soilDark, MEADOW.pebble, "#4a3a2a", MEADOW.grassDark], 3.2, 1.4, 40, 1);
      },
      emitWaveRipple: (x, y) => burst(x, y, 3, [MEADOW.soilLight, MEADOW.soil], 1.2, 0.5, 16),
      emitVictoryBurst: (x, y) => burst(x, y, 40, [MEADOW.yellow, MEADOW.white, MEADOW.red, MEADOW.grassLight, "#3cbcfc"], 4, 0.9, 50),
      clear: () => {
        particles.current = [];
      },
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas?.parentElement) return;
      const parent = canvas.parentElement;
      const resize = () => {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(parent);
      return () => {
        observer.disconnect();
        if (frame.current !== null) cancelAnimationFrame(frame.current);
        frame.current = null;
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none z-30 ${className}`}
        style={{ imageRendering: "pixelated" }}
        aria-hidden="true"
      />
    );
  },
);

EffectsCanvas.displayName = "EffectsCanvas";
