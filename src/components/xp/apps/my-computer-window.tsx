"use client";

import React, { useState } from "react";
import Image from "next/image";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpCursors } from "@/lib/xp/cursors";
import { xpSound } from "@/lib/xp/sound";

export function MyComputerWindow() {
  const { t, locale } = useLocale();
  const { openWindow } = useWindowManager();
  const [activeTab, setActiveTab] = useState<"drives" | "system">("system");

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-none">
      {/* Tab headers (Windows XP System Properties Style) */}
      <div className="flex items-center gap-1 px-3 pt-2 border-b border-[#9bbfe8] bg-[#ece9d8]">
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            setActiveTab("system");
          }}
          className={`px-3 py-1 text-xs rounded-t border-t border-x ${
            activeTab === "system"
              ? "bg-white border-[#7a9eb5] font-bold -mb-[1px] z-10"
              : "bg-[#d8e5f8] border-transparent text-slate-700 hover:bg-[#e4effc]"
          }`}
          style={{ cursor: xpCursors.pointer }}
        >
          Общие (Свойства системы)
        </button>
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            setActiveTab("drives");
          }}
          className={`px-3 py-1 text-xs rounded-t border-t border-x ${
            activeTab === "drives"
              ? "bg-white border-[#7a9eb5] font-bold -mb-[1px] z-10"
              : "bg-[#d8e5f8] border-transparent text-slate-700 hover:bg-[#e4effc]"
          }`}
          style={{ cursor: xpCursors.pointer }}
        >
          Диски и устройства
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "system" ? (
        <div className="flex-1 bg-white p-5 overflow-y-auto flex flex-col gap-4 text-xs">
          {/* Top Banner with XP Flag & System Specs */}
          <div className="flex items-start gap-6 border-b border-slate-200 pb-4">
            <div className="w-16 h-16 relative flex-shrink-0">
              <Image
                src={site.avatar}
                alt={site.name}
                width={64}
                height={64}
                className="rounded border border-slate-400 shadow-md object-cover"
                unoptimized
              />
            </div>
            <div className="space-y-1 text-slate-800">
              <div className="font-bold text-sm text-blue-900">
                Microsoft Windows XP Professional
              </div>
              <div className="text-slate-600">Версия 2026 (Service Pack 3)</div>
              <div className="text-slate-500 font-mono">Amazi OS Build 2600.x86</div>
            </div>
          </div>

          {/* Registered to */}
          <div className="border-b border-slate-200 pb-4 space-y-1">
            <div className="font-bold text-slate-900">Зарегистрировано на имя:</div>
            <div className="pl-3 font-semibold text-blue-800">{site.name}</div>
            <div className="pl-3 text-slate-600">{t(site.role)}</div>
            <div className="pl-3 text-slate-500">{site.handle} • {site.email}</div>
          </div>

          {/* Computer / Hardware specs */}
          <div className="space-y-1.5">
            <div className="font-bold text-slate-900">Спецификация рабочей станции:</div>
            <div className="pl-3 space-y-1 text-slate-700">
              <div>
                <span className="font-semibold">Процессор: </span>
                <span>Creative Intellect Core @ 4.8 GHz (Multi-threaded Design)</span>
              </div>
              <div>
                <span className="font-semibold">Оперативная память: </span>
                <span>64 GB (Infinite Creative Buffer)</span>
              </div>
              <div>
                <span className="font-semibold">Локация: </span>
                <span>{t(site.location)} • {t(site.presence)}</span>
              </div>
              <div>
                <span className="font-semibold">Стек технологий: </span>
                <span className="text-blue-700">
                  {site.stack.map((s) => s[locale]).join(", ")}
                </span>
              </div>
            </div>
          </div>

          {/* Buttons at bottom */}
          <div className="mt-auto pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                xpSound.click();
                openWindow({
                  id: "notepad",
                  type: "notepad",
                  title: "About_Vlad.txt - Блокнот",
                  iconType: "notepad",
                  x: 80,
                  y: 60,
                  width: 500,
                  height: 380,
                });
              }}
              className="px-4 py-1.5 bg-[#ece9d8] hover:bg-[#d8e5f8] border border-slate-400 rounded text-xs font-semibold shadow-sm"
              style={{ cursor: xpCursors.pointer }}
            >
              Открыть резюме (.txt)
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <div className="text-xs font-bold text-slate-600 uppercase mb-3 border-b pb-1">
            Жесткие диски и накопители
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Drive C */}
            <div
              onClick={() => {
                xpSound.click();
                openWindow({
                  id: "my-documents",
                  type: "my-documents",
                  title: "C:\\Projects — Мои проекты",
                  iconType: "folder",
                  x: 70,
                  y: 50,
                  width: 620,
                  height: 420,
                });
              }}
              className="flex items-center gap-3 p-2.5 border border-slate-300 rounded hover:bg-blue-50 cursor-pointer transition shadow-sm"
              style={{ cursor: xpCursors.pointer }}
            >
              <div className="w-10 h-10 rounded bg-slate-200 border border-slate-400 grid place-items-center text-lg shadow-inner">
                💾
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Локальный диск (C:)</div>
                <div className="text-[11px] text-slate-500">
                  {projects.length} проектов портфолио
                </div>
              </div>
            </div>

            {/* Drive D */}
            <div
              onClick={() => {
                xpSound.click();
                openWindow({
                  id: "stories",
                  type: "stories",
                  title: "D:\\Stories — Процессы и кадры",
                  iconType: "stories",
                  x: 90,
                  y: 70,
                  width: 580,
                  height: 430,
                });
              }}
              className="flex items-center gap-3 p-2.5 border border-slate-300 rounded hover:bg-blue-50 cursor-pointer transition shadow-sm"
              style={{ cursor: xpCursors.pointer }}
            >
              <div className="w-10 h-10 rounded bg-slate-200 border border-slate-400 grid place-items-center text-lg shadow-inner">
                💿
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Архив историй (D:)</div>
                <div className="text-[11px] text-slate-500">6 историй студии</div>
              </div>
            </div>

            {/* Network Drive Z */}
            <a
              href="https://t.me/amazi"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 p-2.5 border border-slate-300 rounded hover:bg-blue-50 cursor-pointer transition shadow-sm"
              style={{ cursor: xpCursors.pointer }}
            >
              <div className="w-10 h-10 rounded bg-sky-100 border border-sky-400 grid place-items-center text-lg shadow-inner">
                🌐
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">Telegram канал (Z:)</div>
                <div className="text-[11px] text-slate-500">t.me/amazi</div>
              </div>
            </a>
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="xp-statusbar">
        <span>Готово</span>
        <span>Мой компьютер</span>
      </div>
    </div>
  );
}
