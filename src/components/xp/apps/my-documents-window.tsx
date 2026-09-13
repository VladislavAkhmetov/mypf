"use client";

import React from "react";
import { projects } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpCursors } from "@/lib/xp/cursors";
import { xpSound } from "@/lib/xp/sound";
import { ProjectFileIcon } from "../xp-icons";

export function MyDocumentsWindow() {
  const { t } = useLocale();
  const { openProject } = useWindowManager();

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-none">
      {/* Menu bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item">Файл</span>
        <span className="xp-menu-item">Правка</span>
        <span className="xp-menu-item">Вид</span>
        <span className="xp-menu-item">Избранное</span>
        <span className="xp-menu-item">Сервис</span>
        <span className="xp-menu-item">Справка</span>
      </div>

      {/* Address Bar */}
      <div className="xp-address-bar">
        <span className="xp-address-label">Адрес</span>
        <div className="xp-address-input-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          <span className="text-xs font-mono text-slate-800 flex-1 truncate">
            C:\Projects
          </span>
        </div>
      </div>

      {/* Folder Content: Grid of projects */}
      <div className="flex-1 bg-white p-4 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {projects.map((p) => (
            <div
              key={p.slug}
              onDoubleClick={() => openProject(p.slug)}
              onClick={() => xpSound.click()}
              className="flex flex-col items-center p-2 rounded border border-transparent hover:border-blue-300 hover:bg-blue-50 cursor-pointer text-center group transition"
              style={{ cursor: xpCursors.pointer }}
              title={`Дважды щелкните, чтобы открыть ${p.title}`}
            >
              <div className="w-12 h-12 relative flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <ProjectFileIcon motif={p.motif} className="w-11 h-11" />
              </div>
              <span className="font-bold text-xs text-slate-900 group-hover:text-blue-700 truncate max-w-full">
                {p.title}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-full">
                {t(p.kicker)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Status bar */}
      <div className="xp-statusbar">
        <span>{projects.length} объектов</span>
        <span>Мой компьютер</span>
      </div>
    </div>
  );
}
