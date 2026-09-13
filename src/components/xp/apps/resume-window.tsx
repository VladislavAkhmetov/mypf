"use client";

import React from "react";
import Image from "next/image";
import { site } from "@/data/site";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpCursors } from "@/lib/xp/cursors";
import { xpSound } from "@/lib/xp/sound";

export function ResumeWindow() {
  const { t } = useLocale();
  const { openProject } = useWindowManager();

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-none">
      {/* Menu bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item">Файл</span>
        <span className="xp-menu-item">Правка</span>
        <span className="xp-menu-item">Печать</span>
        <span className="xp-menu-item">Масштаб</span>
        <span className="xp-menu-item">Справка</span>
      </div>

      {/* Main Document Body (A4 sheet appearance) */}
      <div className="flex-1 bg-slate-200 p-3 sm:p-6 overflow-y-auto flex justify-center">
        <div className="w-full max-w-2xl bg-white shadow-lg border border-slate-300 p-6 sm:p-8 rounded text-xs space-y-6 text-slate-800">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-blue-600 pb-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 relative flex-shrink-0">
                <Image
                  src={site.avatar}
                  alt={site.name}
                  width={64}
                  height={64}
                  className="rounded-full border-2 border-blue-600 object-cover shadow"
                  unoptimized
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {site.name}
                </h1>
                <p className="text-blue-700 font-bold text-xs sm:text-sm mt-0.5">
                  Creative Technologist / Design Engineer / AI Product Designer
                </p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Москва • Удаленно / Гибрид • Независимая практика Amazi
                </p>
              </div>
            </div>

            {/* Quick Contact Buttons for HR / Leads */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
              <a
                href={site.telegram}
                target="_blank"
                rel="noreferrer"
                className="flex-1 text-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[11px] shadow transition"
                style={{ cursor: xpCursors.pointer }}
              >
                Telegram @amazi
              </a>
              <a
                href={`mailto:${site.email}`}
                className="flex-1 text-center px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-semibold rounded text-[11px] transition"
                style={{ cursor: xpCursors.pointer }}
              >
                {site.email}
              </a>
            </div>
          </div>

          {/* Section: Executive Summary (TL;DR) */}
          <div className="bg-blue-50/70 border border-blue-200 rounded p-3.5 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-blue-800 tracking-wider">
              Executive Summary // Для арт-директоров и лидов
            </div>
            <p className="text-slate-800 leading-relaxed text-xs">
              {t(site.note)} Собираю системы, которые можно пощупать: шрифт, пространство, интерфейс.
              Дизайн как инженерная дисциплина, а не просто картинка в Figma.
            </p>
          </div>

          {/* Section: Core Competencies */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1 text-blue-900">
              Ключевые компетенции и стек
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">🎨 Продуктовый и системный дизайн:</div>
                <div className="text-slate-600">
                  Figma, Design Systems, Typography (Cut & Grotesque), Spatial OS, Interaction Design, Прототипирование.
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">⚡ Frontend & Creative Tech:</div>
                <div className="text-slate-600">
                  Next.js, React, TypeScript, Shaders (GLSL), WebGL, Three.js, Canvas, Tailwind CSS, Motion Design.
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">🤖 AI Interfaces & Live Loop:</div>
                <div className="text-slate-600">
                  Интерфейсы для AI-продуктов, бесшовные петли обратной связи (модель, код и форма в одном контуре).
                </div>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 space-y-1">
                <div className="font-bold text-slate-900">🏛️ Фирменный стиль & Носители:</div>
                <div className="text-slate-600">
                  Айдентика институций, фестивалей, арт-дирекшн, навигация, выставочные пространства.
                </div>
              </div>
            </div>
          </div>

          {/* Section: Flagship Projects */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b pb-1 text-blue-900">
              Флагманские кейсы (Кликните для просмотра в окне)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  openProject("kora");
                }}
                className="flex items-center gap-2.5 p-2 rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <div className="w-8 h-8 rounded bg-orange-100 text-orange-700 font-bold grid place-items-center text-xs">
                  Aa
                </div>
                <div>
                  <div className="font-bold text-slate-900">Kora — Шрифт архива</div>
                  <div className="text-[10px] text-slate-500">Гротеск с корой вместо засечек</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  openProject("noclip");
                }}
                className="flex items-center gap-2.5 p-2 rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <div className="w-8 h-8 rounded bg-sky-100 text-sky-700 font-bold grid place-items-center text-xs">
                  OS
                </div>
                <div>
                  <div className="font-bold text-slate-900">Noclip — Spatial OS</div>
                  <div className="text-[10px] text-slate-500">Пространственная ОС музея</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  openProject("signalatlas");
                }}
                className="flex items-center gap-2.5 p-2 rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <div className="w-8 h-8 rounded bg-emerald-100 text-emerald-700 font-bold grid place-items-center text-xs">
                  RAD
                </div>
                <div>
                  <div className="font-bold text-slate-900">Signalatlas — Карты</div>
                  <div className="text-[10px] text-slate-500">Картография радиотишины</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  openProject("sieve");
                }}
                className="flex items-center gap-2.5 p-2 rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <div className="w-8 h-8 rounded bg-lime-100 text-lime-800 font-bold grid place-items-center text-xs">
                  01
                </div>
                <div>
                  <div className="font-bold text-slate-900">Sieve — Протокол</div>
                  <div className="text-[10px] text-slate-500">Визуальный язык и шум</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="xp-statusbar">
        <span>Резюме_Влад_Ахметов.pdf</span>
        <span>Страница 1 из 1 (100%)</span>
        <span className="font-semibold text-slate-600">Готово к печати</span>
      </div>
    </div>
  );
}
