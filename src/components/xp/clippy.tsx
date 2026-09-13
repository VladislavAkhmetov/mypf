"use client";

import React, { useState, useEffect } from "react";
import { useWindowManager } from "./window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { site } from "@/data/site";

export function Clippy() {
  const { openWindow, openProject, focusWindow } = useWindowManager();
  const [isOpen, setIsOpen] = useState(true);
  const [currentPose, setCurrentPose] = useState<"rest" | "eyebrow" | "look-left" | "wave">("rest");

  // Subtle nostalgic idle animations (blinking, raising eyebrows, looking around)
  useEffect(() => {
    const cycle = [
      { pose: "rest" as const, duration: 4500 },
      { pose: "eyebrow" as const, duration: 1800 },
      { pose: "rest" as const, duration: 3500 },
      { pose: "look-left" as const, duration: 2200 },
      { pose: "rest" as const, duration: 4000 },
    ];

    let timer: NodeJS.Timeout;
    let step = 0;

    const runStep = () => {
      const current = cycle[step];
      setCurrentPose(current.pose);
      step = (step + 1) % cycle.length;
      timer = setTimeout(runStep, current.duration);
    };

    timer = setTimeout(runStep, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      xpSound.balloon();
    } else {
      xpSound.click();
    }
    setCurrentPose("wave");
    setIsOpen(!isOpen);
    setTimeout(() => {
      setCurrentPose("rest");
    }, 1500);
  };

  const handleOpenResume = () => {
    xpSound.click();
    openWindow({
      id: "resume",
      type: "resume",
      title: "Резюме_Влад_Ахметов.pdf — Executive Summary",
      iconType: "resume",
      x: 70,
      y: 40,
      width: 680,
      height: 520,
    });
  };

  const handleOpenShowreel = () => {
    xpSound.click();
    focusWindow("media-player");
  };

  const handleOpenTopProjects = () => {
    xpSound.click();
    openProject("kora");
  };

  const poseFileName =
    currentPose === "wave"
      ? "/clippy/wave-2.png"
      : currentPose === "eyebrow"
      ? "/clippy/eyebrow.png"
      : currentPose === "look-left"
      ? "/clippy/look-left.png"
      : "/clippy/rest.png";

  return (
    <div
      className="fixed bottom-14 right-5 z-[9990] flex flex-col items-end pointer-events-auto select-none"
      style={{ cursor: xpCursors.default }}
    >
      {/* Speech Bubble */}
      {isOpen && (
        <div className="w-80 bg-[#ffffe1] text-slate-900 border-2 border-black rounded-lg p-3.5 shadow-2xl mb-2 text-xs relative animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-amber-300 pb-1.5 mb-2.5">
            <span className="font-bold text-[12px] text-blue-950 flex items-center gap-1.5">
              <span>📎</span>
              <span>Помощник Office // Скрепка</span>
            </span>
            <button
              type="button"
              onClick={() => {
                xpSound.click();
                setIsOpen(false);
              }}
              className="text-slate-500 hover:text-red-600 font-bold px-1 text-sm leading-none transition-colors"
              title="Закрыть помощника"
              style={{ cursor: xpCursors.pointer }}
            >
              ✕
            </button>
          </div>

          <p className="text-[12px] leading-relaxed mb-3 text-slate-900 font-medium">
            Привет! Я <strong>Скрепка</strong>. Похоже, вы оцениваете портфолио <strong>Влада Ахметова</strong>. Чем могу помочь?
          </p>

          {/* Quick Action Options */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleOpenResume}
              className="w-full text-left px-3 py-2 bg-white hover:bg-[#316ac5] hover:text-white border border-slate-400 rounded text-[12px] font-semibold transition-colors flex items-center gap-2 shadow-sm text-slate-900"
              style={{ cursor: xpCursors.pointer }}
            >
              <span className="text-base">📄</span>
              <span>Открыть резюме и навыки (CV / HR)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenShowreel}
              className="w-full text-left px-3 py-2 bg-white hover:bg-[#316ac5] hover:text-white border border-slate-400 rounded text-[12px] font-semibold transition-colors flex items-center gap-2 shadow-sm text-slate-900"
              style={{ cursor: xpCursors.pointer }}
            >
              <span className="text-base">🎬</span>
              <span>Посмотреть шоурил 2026 (WMP)</span>
            </button>

            <button
              type="button"
              onClick={handleOpenTopProjects}
              className="w-full text-left px-3 py-2 bg-white hover:bg-[#316ac5] hover:text-white border border-slate-400 rounded text-[12px] font-semibold transition-colors flex items-center gap-2 shadow-sm text-slate-900"
              style={{ cursor: xpCursors.pointer }}
            >
              <span className="text-base">⭐</span>
              <span>Показать флагманский кейс (Kora)</span>
            </button>

            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer"
              className="w-full text-left px-3 py-2 bg-white hover:bg-[#316ac5] hover:text-white border border-slate-400 rounded text-[12px] font-semibold transition-colors flex items-center gap-2 shadow-sm text-slate-900"
              style={{ cursor: xpCursors.pointer }}
            >
              <span className="text-base">💬</span>
              <span>Написать в Telegram @amazi</span>
            </a>
          </div>

          {/* Speech Bubble Tail pointing directly down towards Clippy */}
          <div className="absolute -bottom-2.5 right-12 w-3.5 h-3.5 bg-[#ffffe1] border-r-2 border-b-2 border-black transform rotate-45" />
        </div>
      )}

      {/* Authentic Microsoft Clippy Character */}
      <div
        onClick={handleToggle}
        className="relative group cursor-pointer active:scale-95 transition-transform mr-4"
        title="Нажмите на Скрепку для подсказок"
        style={{ cursor: xpCursors.pointer }}
      >
        {!isOpen && (
          <div className="absolute -top-7 right-0 bg-[#ffffe1] text-[11px] font-bold text-slate-900 border border-black px-2 py-0.5 rounded shadow-md whitespace-nowrap animate-bounce">
            Помощь? 📎
          </div>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={poseFileName}
          alt="Помощник Microsoft Clippy"
          width={106}
          height={80}
          className="drop-shadow-[3px_6px_8px_rgba(0,0,0,0.55)] transition-transform duration-200 select-none pointer-events-none hover:scale-105"
          draggable={false}
        />
      </div>
    </div>
  );
}

