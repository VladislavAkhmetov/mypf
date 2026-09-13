"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

export function MediaPlayerWindow() {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(14);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const duration = 168; // 2:48 total showreel length
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Advance time when playing
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        if (prev >= duration) return 0;
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Audio Spectrum Canvas Visualizer (Authentic WMP 9/10 Visualizer mode)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      phase += isPlaying ? 0.08 : 0.01;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic WMP background
      ctx.fillStyle = "rgba(4, 10, 24, 0.45)";
      ctx.fillRect(0, 0, w, h);

      // Spectrum Bars
      const bars = 32;
      const barWidth = w / bars - 2;

      for (let i = 0; i < bars; i++) {
        const heightFactor = isPlaying
          ? Math.sin(phase + i * 0.35) * 0.4 +
            Math.cos(phase * 1.4 + i * 0.22) * 0.35 +
            0.45
          : 0.12;

        const barHeight = Math.max(4, heightFactor * (h - 20));
        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient from cyan to blue to gold
        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, "#38bdf8");
        grad.addColorStop(0.6, "#2563eb");
        grad.addColorStop(1, "#1e3a8a");

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);

        // Peak dot
        ctx.fillStyle = "#93c5fd";
        ctx.fillRect(x, Math.max(0, y - 3), barWidth, 1.5);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handlePlayPause = () => {
    xpSound.click();
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    xpSound.click();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(Number(e.target.value));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#121927] text-white overflow-hidden select-none">
      {/* Top Media Display area */}
      <div className="flex-1 relative flex flex-col min-h-0 bg-black overflow-hidden">
        {/* Cover / Video simulation */}
        <div className="absolute inset-0 opacity-70">
          <Image
            src="/placeholders/covers/noclip.jpg"
            alt="Showreel 2026"
            fill
            className="object-cover filter contrast-125 brightness-90"
            unoptimized
          />
        </div>

        {/* Ambient Overlay & Scanlines */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f] via-transparent to-black/60 pointer-events-none" />

        {/* Spectrum Canvas overlay */}
        <canvas
          ref={canvasRef}
          width={400}
          height={140}
          className="absolute inset-x-0 bottom-0 w-full h-32 opacity-75 pointer-events-none mix-blend-screen"
        />

        {/* Top Info overlay */}
        <div className="relative z-10 p-3.5 flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-sky-400 font-bold flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  isPlaying ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"
                }`}
              />
              {isPlaying ? "Визуализатор частот • Атлас волн" : "Пауза"}
            </div>
            <h2 className="text-base md:text-lg font-black text-white drop-shadow mt-1">
              Влад Ахметов — Атлас волн
            </h2>
            <p className="text-xs text-sky-200 drop-shadow mt-0.5 font-medium">
              Интерактивный Canvas 2D визуализатор спектра и гармоник
            </p>
          </div>

          <div className="bg-black/60 border border-sky-400/40 px-2 py-1 rounded text-[11px] text-sky-300 font-mono">
            Canvas 2D
          </div>
        </div>

        {/* Big Center Play indicator if paused */}
        {!isPlaying && (
          <div
            onClick={handlePlayPause}
            className="absolute inset-0 grid place-items-center z-20 cursor-pointer"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="w-16 h-16 rounded-full bg-blue-600/80 border-2 border-white/90 grid place-items-center shadow-2xl hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="translate-x-0.5">
                <polygon points="6,3 20,12 6,21" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Timeline Scrubber */}
      <div className="bg-[#182030] px-4 pt-2.5 pb-1 border-t border-[#253248] flex items-center gap-3">
        <span className="text-xs font-mono text-sky-200 font-bold w-10">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-2 bg-[#0a0f1a] accent-sky-400 rounded cursor-pointer"
          style={{ cursor: xpCursors.pointer }}
        />
        <span className="text-xs font-mono text-zinc-400 w-10">{formatTime(duration)}</span>
      </div>

      {/* Controls Bar (Metallic WMP style) */}
      <div className="h-14 bg-gradient-to-b from-[#2a364a] via-[#1d2737] to-[#121a26] border-t border-[#3b4b66] px-4 flex items-center justify-between">
        {/* Play / Stop */}
        <div className="flex items-center gap-3">
          {/* Big Play / Pause Jewel */}
          <button
            type="button"
            onClick={handlePlayPause}
            title={isPlaying ? "Пауза" : "Воспроизведение"}
            className="w-10 h-10 rounded-full bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#0369a1] border-2 border-white/90 grid place-items-center hover:brightness-110 active:scale-95 shadow-md"
            style={{ cursor: xpCursors.pointer }}
          >
            {isPlaying ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <rect x="5" y="4" width="4" height="16" rx="1" />
                <rect x="15" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" className="translate-x-0.5">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleStop}
            title="Остановить"
            className="w-8 h-8 rounded-full bg-gradient-to-b from-[#475569] to-[#1e293b] border border-[#64748b] grid place-items-center hover:brightness-125 active:scale-95 shadow"
            style={{ cursor: xpCursors.pointer }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="white">
              <rect x="4" y="4" width="16" height="16" rx="1" />
            </svg>
          </button>
        </div>

        {/* Volume Slider */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            className="text-zinc-300 hover:text-white"
            style={{ cursor: xpCursors.pointer }}
            title={isMuted ? "Включить звук" : "Выключить звук"}
          >
            {isMuted || volume === 0 ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-24 md:w-32 h-2 bg-[#0a0f1a] accent-sky-400 rounded cursor-pointer"
            style={{ cursor: xpCursors.pointer }}
          />
        </div>

        {/* Video Mode Badge */}
        <div className="text-[11px] text-sky-300 font-semibold hidden sm:block">
          Wave_Atlas.canvas
        </div>
      </div>
    </div>
  );
}
