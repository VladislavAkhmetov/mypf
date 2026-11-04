"use client";

import React, { useState } from "react";
import { site } from "@/data/site";
import { useLocale } from "@/lib/i18n";

export function NotepadWindow() {
  const { t, tr, locale } = useLocale();

  const defaultContent = `=====================================================
${tr("ВЛАД АХМЕТОВ // VLADISLAV AKHMETOV", "VLAD AKHMETOV")}
${t(site.role)}
=====================================================

[ ${tr("О СЕБЕ", "ABOUT")} ]
${t(site.note)}

[ ${tr("СЕЙЧАС", "NOW")} ]
${t(site.now)}

[ ${tr("СТУДИЯ И МЕСТО", "PRACTICE AND LOCATION")} ]
${t(site.workplace)}
${tr("Локация", "Location")}: ${t(site.location)}

[ ${tr("СТЕК И ДИСЦИПЛИНЫ", "STACK AND DISCIPLINES")} ]
${site.stack.map((s) => "• " + s[locale]).join("\n")}

[ ${tr("КОНТАКТЫ", "CONTACTS")} ]
• Telegram: ${site.telegram}
• Email:    ${site.email}
• Handle:   ${site.handle}

=====================================================
Windows XP Notepad Edition (C) 2001-2026 Microsoft Corp.
=====================================================`;

  const [content, setContent] = useState(defaultContent);
  // Reload the text in the new language when the interface language changes.
  const [shownLocale, setShownLocale] = useState(locale);
  if (shownLocale !== locale) {
    setShownLocale(locale);
    setContent(defaultContent);
  }

  return (
    <div className="flex-1 flex flex-col bg-white text-black overflow-hidden select-text">
      {/* Menu bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item">{tr("Файл", "File")}</span>
        <span className="xp-menu-item">{tr("Правка", "Edit")}</span>
        <span className="xp-menu-item">{tr("Формат", "Format")}</span>
        <span className="xp-menu-item">{tr("Вид", "View")}</span>
        <span className="xp-menu-item">{tr("Справка", "Help")}</span>
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
        <span>{tr("Стр 1, Стл 1", "Ln 1, Col 1")}</span>
        <span>Windows (CRLF)</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
