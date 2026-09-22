"use client";

import React, { useRef, useEffect, useImperativeHandle, forwardRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: "dot" | "ring";
  radius?: number;
  growth?: number;
}

export interface EffectsCanvasHandle {
  emitFlagSparks: (x: number, y: number) => void;
  emitExplosion: (x: number, y: number) => void;
  emitWaveRipple: (x: number, y: number) => void;
  emitVictoryBurst: (x: number, y: number) => void;
  clear: () => void;
}

export const EffectsCanvas = forwardRef<EffectsCanvasHandle, { className?: string }>(
  ({ className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const rafIdRef = useRef<number | null>(null);

    // Stop and start loop based on particle count (zero RAF overhead in idle state)
    const runLoop = () => {
      if (rafIdRef.current !== null) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const step = () => {
        if (particlesRef.current.length === 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          rafIdRef.current = null;
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const alive: Particle[] = [];

        for (const p of particlesRef.current) {
          p.x += p.vx;
          p.y += p.vy;
          p.life += 1;

          const progress = p.life / p.maxLife;
          const alpha = Math.max(0, 1 - progress);

          ctx.save();
          ctx.globalAlpha = alpha;

          if (p.type === "ring") {
            p.radius = (p.radius || 2) + (p.growth || 2);
            ctx.strokeStyle = p.color;
            ctx.lineWidth = Math.max(1, p.size * (1 - progress));
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (1 - progress * 0.4), 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();

          if (p.life < p.maxLife) {
            alive.push(p);
          }
        }

        particlesRef.current = alive;
        rafIdRef.current = requestAnimationFrame(step);
      };

      rafIdRef.current = requestAnimationFrame(step);
    };

    // Add particles safely respecting max limit 160
    const addParticles = (newParticles: Particle[]) => {
      const maxLimit = 160;
      const current = particlesRef.current;
      const space = maxLimit - current.length;
      if (space <= 0) return;

      particlesRef.current = [...current, ...newParticles.slice(0, space)];
      runLoop();
    };

    useImperativeHandle(ref, () => ({
      emitFlagSparks(x: number, y: number) {
        const particles: Particle[] = [];
        const colors = ["#FF6B81", "#FDA4AF", "#FDE047", "#57E4FF"];
        for (let i = 0; i < 8; i++) {
          const angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5);
          const speed = 1.5 + Math.random() * 2.5;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.5,
            life: 0,
            maxLife: 16 + Math.floor(Math.random() * 10),
            size: 2 + Math.random() * 1.5,
            color: colors[i % colors.length],
            type: "dot",
          });
        }
        addParticles(particles);
      },

      emitExplosion(x: number, y: number) {
        const particles: Particle[] = [];
        // Shockwave ring
        particles.push({
          x,
          y,
          vx: 0,
          vy: 0,
          life: 0,
          maxLife: 22,
          size: 4,
          color: "#EF4444",
          type: "ring",
          radius: 4,
          growth: 4.5,
        });

        // Fragments and fire particles
        const colors = ["#EF4444", "#F97316", "#FBBF24", "#334155"];
        for (let i = 0; i < 28; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 2 + Math.random() * 6;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 20 + Math.floor(Math.random() * 16),
            size: 2.5 + Math.random() * 3,
            color: colors[i % colors.length],
            type: "dot",
          });
        }
        addParticles(particles);
      },

      emitWaveRipple(x: number, y: number) {
        const particles: Particle[] = [
          {
            x,
            y,
            vx: 0,
            vy: 0,
            life: 0,
            maxLife: 14,
            size: 2,
            color: "#57E4FF",
            type: "ring",
            radius: 2,
            growth: 2.2,
          },
        ];
        addParticles(particles);
      },

      emitVictoryBurst(x: number, y: number) {
        const particles: Particle[] = [];
        const colors = ["#C3F66A", "#57E4FF", "#FDE047", "#F472B6"];
        for (let i = 0; i < 24; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 4.5;
          particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 25 + Math.floor(Math.random() * 15),
            size: 2.5 + Math.random() * 2,
            color: colors[i % colors.length],
            type: "dot",
          });
        }
        addParticles(particles);
      },

      clear() {
        particlesRef.current = [];
        if (rafIdRef.current) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      },
    }));

    // Handle canvas resizing
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const updateSize = () => {
        const parent = canvas.parentElement;
        if (!parent) return;
        const rect = parent.getBoundingClientRect();
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;

        const ctx = canvas.getContext("2d");
        ctx?.scale(dpr, dpr);
      };

      updateSize();
      const ro = new ResizeObserver(updateSize);
      if (canvas.parentElement) {
        ro.observe(canvas.parentElement);
      }

      return () => {
        ro.disconnect();
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      };
    }, []);

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 pointer-events-none z-30 ${className}`}
      />
    );
  }
);

EffectsCanvas.displayName = "EffectsCanvas";
