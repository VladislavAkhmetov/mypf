"use client";

import React from "react";
import { profileDocument } from "@/data/documents";
import { site } from "@/data/site";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { useWindowManager } from "../window-manager-context";
import { useLocale } from "@/lib/i18n";

/** One page, no navigation: who I am, then projects, resume and contacts. */
export function WordWindow() {
  const { openWindow, openPortfolio } = useWindowManager();
  const { t, tr } = useLocale();

  const handleOpenPortfolio = () => {
    xpSound.click();
    if (openPortfolio) {
      openPortfolio();
    }
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

  return (
    <div className="flex flex-col h-full bg-[#cbd5e1] select-text font-sans text-slate-800 text-xs">
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-[#8c96a5]">
        <article className="w-full max-w-[794px] min-h-[1123px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.35)] p-8 md:p-14 border border-slate-300 self-start text-slate-900 text-left relative flex flex-col justify-between">
          {/* Top portion containing all text and actions */}
          <div>
            <header className="border-b border-slate-200 pb-5">
              <h1
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                className="text-[30px] md:text-[40px] font-bold leading-tight tracking-tight text-slate-950 font-serif text-left outline-none"
              >
                {t(profileDocument.title)}
              </h1>
              <p
                contentEditable
                suppressContentEditableWarning
                spellCheck={false}
                className="text-lg md:text-xl font-semibold text-slate-700 mt-2 leading-snug text-left outline-none"
              >
                {profileDocument.subtitle}
              </p>
            </header>

            <div
              contentEditable
              suppressContentEditableWarning
              spellCheck={false}
              className="text-[20px] leading-[1.55] text-slate-800 text-left mt-6 space-y-4 outline-none"
            >
              {profileDocument.paragraphs.map((p, idx, arr) => (
                <p key={idx} className="text-left">
                  {t(p)}
                  {idx === arr.length - 1 && (
                    <span
                      contentEditable={false}
                      className="inline-block w-[2px] h-[1.15em] bg-black align-baseline ml-0.5 animate-word-caret select-none pointer-events-none"
                      aria-hidden="true"
                    />
                  )}
                </p>
              ))}
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center gap-3 select-none">
              <button
                type="button"
                onClick={handleOpenPortfolio}
                data-ym-goal="word_open_portfolio"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded shadow-sm flex items-center gap-2 transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>{tr("Посмотреть проекты", "View projects")}</span>
                <span>→</span>
              </button>
              <button
                type="button"
                onClick={handleOpenResume}
                data-ym-goal="word_open_resume"
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 border border-slate-300 font-semibold text-sm rounded shadow-xs transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>{tr("Резюме", "Resume")}</span>
                <span>↗</span>
              </button>
            </div>

            {/* Contacts from site.ts */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">{tr("Контакты:", "Contacts:")}</span>
              {site.telegram && (
                <a
                  href={site.telegram}
                  target="_blank"
                  rel="noreferrer"
                  data-ym-goal="contact_telegram_word"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>Telegram</span>
                  <span>↗</span>
                </a>
              )}
              {site.email && (
                <a
                  href={`mailto:${site.email}`}
                  data-ym-goal="contact_email_word"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>{site.email}</span>
                </a>
              )}
              <span className="text-slate-500">{t(site.location)}</span>
            </div>
          </div>

          {/* Lower portion: blank page whitespace leading to A4 bottom footer */}
          <div className="pt-16 pb-2 text-center text-xs text-slate-400 font-sans select-none pointer-events-none">
            — 1 —
          </div>
        </article>
      </div>

      {/* Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#7f9db9] px-3 py-1 flex items-center gap-3 text-[11px] text-slate-600 font-sans flex-shrink-0">
        <span>{tr("Стр. 1 из 1", "Page 1 of 1")}</span>
        <span>•</span>
        <span>{tr("Русский (Россия)", "English (United States)")}</span>
      </div>
    </div>
  );
}
