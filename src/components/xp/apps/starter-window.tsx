"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { site } from "@/data/site";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

const GLYPHS = ["VA", "OS", "4D", "01", "Aa"] as const;

export function StarterWindow() {
  const { t } = useLocale();
  const { openWindow } = useWindowManager();

  // Interactive Typography & Kinetic Form state
  const [activeGlyph, setActiveGlyph] = useState<number>(0);
  const [stretch, setStretch] = useState<number>(100);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Canvas generative kinetic typography lattice
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const render = () => {
      time += 0.02;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Gradient background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, "#091428");
      bgGrad.addColorStop(1, "#030712");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Dynamic Grid Lattice (Design-Engineering aesthetic)
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(56, 189, 248, 0.12)";
      const step = 24;
      for (let x = step; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = step; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Orbital kinetic rings
      const cx = w / 2;
      const cy = h / 2;
      const ringRadius = 50 + Math.sin(time) * 4;

      ctx.strokeStyle = "rgba(147, 197, 253, 0.4)";
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
      ctx.setLineDash([4, 6]);
      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius + 16, time * 0.5, time * 0.5 + Math.PI * 1.5);
      ctx.stroke();
      ctx.setLineDash([]);

      // Center Monogram / Typographic Glyph
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${36 + Math.round((stretch - 100) * 0.15)}px var(--xp-font), sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(GLYPHS[activeGlyph], cx, cy);

      // Coordinates text
      ctx.fillStyle = "rgba(125, 211, 252, 0.75)";
      ctx.font = "9px monospace";
      ctx.fillText(`GLYPH:${GLYPHS[activeGlyph]} • STR:${stretch}% • LIVE`, cx, cy + 46);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeGlyph, stretch]);

  const handleOpenWorks = () => {
    xpSound.click();
    openWindow({
      id: "my-documents",
      type: "my-documents",
      title: "Мои работы — Проекты",
      iconType: "folder",
      x: 70,
      y: 40,
      width: 640,
      height: 440,
    });
  };

  const handleOpenAbout = () => {
    xpSound.click();
    openWindow({
      id: "notepad",
      type: "notepad",
      title: "About_Vlad.txt — Блокнот",
      iconType: "notepad",
      x: 80,
      y: 50,
      width: 540,
      height: 400,
    });
  };

  const handleOpenResume = () => {
    xpSound.click();
    openWindow({
      id: "resume",
      type: "resume",
      title: "Резюме_Влад_Ахметов.pdf — Резюме",
      iconType: "resume",
      x: 90,
      y: 50,
      width: 680,
      height: 520,
    });
  };

  const handleOpenSolitaire = () => {
    xpSound.click();
    openWindow({
      id: "solitaire",
      type: "solitaire",
      title: "Косынка — Авторская колода",
      iconType: "solitaire",
      x: 75,
      y: 35,
      width: 840,
      height: 620,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-text">
      {/* Menu Bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item text-blue-900 font-bold">Портфолио</span>
        <button
          type="button"
          onClick={handleOpenWorks}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          Работы
        </button>
        <button
          type="button"
          onClick={handleOpenAbout}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          Обо мне
        </button>
        <button
          type="button"
          onClick={handleOpenResume}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          Резюме (PDF)
        </button>
      </div>

      {/* Main Container */}
      <div className="flex-1 bg-white p-4 sm:p-6 overflow-y-auto flex flex-col md:flex-row gap-6 items-center md:items-stretch">
        {/* Left Column: Author, Role & Primary 1-Click CTAs */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 relative flex-shrink-0">
                <Image
                  src={site.avatar}
                  alt={site.name}
                  width={56}
                  height={56}
                  className="rounded-full border-2 border-blue-600 object-cover shadow"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {site.name}
                </h1>
                <div className="inline-block px-2 py-0.5 mt-0.5 bg-blue-100 text-blue-900 text-xs font-bold rounded">
                  {t(site.role)}
                </div>
              </div>
            </div>

            <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
              {t(site.roleDescription)}
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800">
                {t(site.workplace)} • {t(site.location)}
              </div>
              <div>{t(site.note)}</div>
            </div>
          </div>

          {/* Primary Quick CTAs */}
          <div className="space-y-2 pt-2">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Быстрый переход:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenWorks}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow transition active:scale-[0.98]"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📂</span>
                <span>Смотреть работы</span>
              </button>

              <button
                type="button"
                onClick={handleOpenResume}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs shadow transition active:scale-[0.98]"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📄</span>
                <span>Резюме (PDF / CV)</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAbout}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-semibold rounded text-xs transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📝</span>
                <span>Обо мне и опыт</span>
              </button>

              <a
                href={site.telegram}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-3 py-2 bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 font-semibold rounded text-xs transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>💬</span>
                <span>Написать в Telegram</span>
              </a>

              <button
                type="button"
                onClick={handleOpenSolitaire}
                className="col-span-1 sm:col-span-2 flex items-center justify-between px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-semibold rounded text-xs transition shadow-xs"
                style={{ cursor: xpCursors.pointer }}
              >
                <div className="flex items-center gap-2">
                  <span>🎴</span>
                  <span>Интерактивная лаборатория: <strong>Косынка (Solitaire)</strong></span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-700 text-white font-mono uppercase">
                  Play
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Design-Engineer Typographic Canvas */}
        <div className="w-full md:w-72 flex flex-col bg-slate-950 rounded-lg p-3 border border-slate-800 shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-sky-300 pb-2 border-b border-slate-800">
            <span className="font-bold font-mono">LIVE // PROTOTYPE</span>
            <span className="text-slate-400">Canvas 2D</span>
          </div>

          <div className="flex-1 flex items-center justify-center py-2">
            <canvas
              ref={canvasRef}
              width={260}
              height={170}
              className="rounded border border-slate-800 w-full max-w-[260px] h-auto shadow"
            />
          </div>

          {/* Interactive controls */}
          <div className="space-y-2 pt-2 border-t border-slate-800 text-[11px]">
            <div className="flex items-center justify-between text-slate-300">
              <span>Глиф:</span>
              <div className="flex gap-1">
                {GLYPHS.map((g, idx) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      xpSound.click();
                      setActiveGlyph(idx);
                    }}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                      activeGlyph === idx
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                    style={{ cursor: xpCursors.pointer }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span>Плотность:</span>
              <input
                type="range"
                min={80}
                max={140}
                value={stretch}
                onChange={(e) => setStretch(Number(e.target.value))}
                className="w-28 h-1.5 bg-slate-800 accent-sky-400 rounded"
                style={{ cursor: xpCursors.pointer }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="xp-statusbar flex items-center justify-between">
        <span>Влад Ахметов — Портфолио дизайн-инженера</span>
        <span className="text-slate-600">Готов к проектам • 2026</span>
      </div>
    </div>
  );
}
