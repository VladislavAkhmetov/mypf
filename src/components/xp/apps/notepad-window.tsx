"use client";

import React, { useState } from "react";
import { site } from "@/data/site";
import { useLocale } from "@/lib/i18n";

export function NotepadWindow() {
  const { t, locale } = useLocale();

  const defaultContent = `=====================================================
ВЛАД АХМЕТОВ // VLADISLAV AKHMETOV
${t(site.role)}
=====================================================

[ О СЕБЕ ]
${t(site.note)}

[ СЕЙЧАС ]
${t(site.now)}

[ СТУДИЯ И МЕСТО ]
${t(site.workplace)}
Локация: ${t(site.location)} (${t(site.presence)})

[ СТЕК И ДИСЦИПЛИНЫ ]
${site.stack.map((s) => "• " + s[locale]).join("\n")}

[ КОНТАКТЫ ]
• Telegram: ${site.telegram}
• Email:    ${site.email}
• Handle:   ${site.handle}

=====================================================
Windows XP Notepad Edition (C) 2001-2026 Microsoft Corp.
=====================================================`;

  const [content, setContent] = useState(defaultContent);

  return (
    <div className="flex-1 flex flex-col bg-white text-black overflow-hidden select-text">
      {/* Menu bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item">Файл</span>
        <span className="xp-menu-item">Правка</span>
        <span className="xp-menu-item">Формат</span>
        <span className="xp-menu-item">Вид</span>
        <span className="xp-menu-item">Справка</span>
      </div>

      {/* Editor text area */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 p-3 font-mono text-xs md:text-sm text-slate-900 border-0 outline-none resize-none overflow-y-auto leading-relaxed"
        spellCheck={false}
      />

      {/* Status bar */}
      <div className="xp-statusbar">
        <span>Стр 1, Стл 1</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
