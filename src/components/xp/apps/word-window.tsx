"use client";

import React, { useState, useMemo, useRef } from "react";
import { documentsList, DocumentItem } from "@/data/documents";
import { site } from "@/data/site";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { WordDocIcon } from "../xp-icons";
import { useWindowManager } from "../window-manager-context";

type ZoomLevel = "normal" | "large" | "reading";

interface WordWindowProps {
  initialDocSlug?: string;
  docSlug?: string;
}

export function WordWindow({ initialDocSlug, docSlug }: WordWindowProps) {
  const { openWindow, openPortfolio } = useWindowManager();
  const targetSlug = docSlug || initialDocSlug || documentsList[0]?.slug || "profile";

  const [selectedSlug, setSelectedSlug] = useState<string>(() => targetSlug);
  const [prevPropSlug, setPrevPropSlug] = useState<string | undefined>(docSlug || initialDocSlug);
  const [zoom, setZoom] = useState<ZoomLevel>("normal");
  const [showToc, setShowToc] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync with prop changes during render (official React pattern)
  const incomingSlug = docSlug || initialDocSlug;
  if (incomingSlug && incomingSlug !== prevPropSlug) {
    setPrevPropSlug(incomingSlug);
    setSelectedSlug(incomingSlug);
  }

  const currentDoc: DocumentItem = useMemo(() => {
    return documentsList.find((d) => d.slug === selectedSlug) || documentsList[0];
  }, [selectedSlug]);

  const isProfile = currentDoc.slug === "profile";

  const handlePrint = () => {
    xpSound.click();
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportText = () => {
    xpSound.click();
    let text = `# ${currentDoc.title}\n${currentDoc.subtitle}\n\n`;
    text += `Автор: ${currentDoc.author} | Дата: ${currentDoc.date}\n`;
    text += `----------------------------------------\n\n`;

    currentDoc.sections.forEach((sec) => {
      if (sec.heading) {
        text += `## ${sec.heading}\n\n`;
      }
      sec.paragraphs.forEach((p) => {
        text += `${p}\n\n`;
      });
      if (sec.callout) {
        text += `> ${sec.callout}\n\n`;
      }
    });

    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDoc.slug}-vlad-akhmetov.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  const zoomClasses = {
    normal: "text-sm leading-relaxed",
    large: "text-base leading-relaxed",
    reading: "text-lg leading-loose",
  }[zoom];

  return (
    <div className="flex flex-col h-full bg-[#cbd5e1] select-text font-sans text-slate-800 text-xs">
      {/* Ribbon / Toolbar Header */}
      <div className="bg-[#f0f4f9] border-b border-[#a0b0c8] p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm flex-shrink-0">
        {/* Left: App icon and Document Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-1 text-blue-900 font-bold">
            <WordDocIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs">
              {isProfile ? "Влад Ахметов" : "Microsoft Word Reader"}
            </span>
          </div>

          {/* Compact document selector */}
          <div className="flex items-center gap-1">
            <label htmlFor="word-doc-select" className="sr-only">
              Выберите документ
            </label>
            <select
              id="word-doc-select"
              value={selectedSlug}
              onChange={(e) => {
                xpSound.click();
                setSelectedSlug(e.target.value);
              }}
              data-ym-goal="word_select_document"
              className="px-2 py-1 bg-white border border-[#a0b0c8] rounded text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-600 shadow-2xs"
              style={{ cursor: xpCursors.pointer }}
            >
              {documentsList.map((doc) => (
                <option key={doc.slug} value={doc.slug}>
                  {doc.slug === "profile" ? "Обо мне (профиль)" : doc.title.split(":")[0]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions for full essays (TOC, Zoom, Print, Export) */}
        {!isProfile && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setShowToc(!showToc)}
              className={`px-2 py-1 border rounded text-xs font-semibold flex items-center gap-1 transition ${
                showToc
                  ? "bg-blue-100 border-blue-400 text-blue-950"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Показать / скрыть оглавление"
            >
              <span>📑</span>
              <span className="hidden md:inline">Оглавление</span>
            </button>

            {/* Zoom toggle */}
            <div className="flex items-center border border-slate-300 rounded bg-white overflow-hidden">
              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  setZoom("normal");
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold ${
                  zoom === "normal"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                style={{ cursor: xpCursors.pointer }}
              >
                100%
              </button>
              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  setZoom("large");
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold border-l border-r border-slate-200 ${
                  zoom === "large"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                style={{ cursor: xpCursors.pointer }}
              >
                125%
              </button>
              <button
                type="button"
                onClick={() => {
                  xpSound.click();
                  setZoom("reading");
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold ${
                  zoom === "reading"
                    ? "bg-blue-600 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
                style={{ cursor: xpCursors.pointer }}
              >
                150%
              </button>
            </div>

            {/* Print Action */}
            <button
              type="button"
              onClick={handlePrint}
              data-ym-goal="word_print"
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-2xs active:translate-y-px"
              style={{ cursor: xpCursors.pointer }}
              title="Распечатать документ"
            >
              <span>🖨️</span>
              <span className="hidden sm:inline">Печать</span>
            </button>

            {/* Export Action */}
            <button
              type="button"
              onClick={handleExportText}
              data-ym-goal="word_export_text"
              className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-2xs active:translate-y-px"
              style={{ cursor: xpCursors.pointer }}
              title="Экспортировать текст в формате Markdown"
            >
              <span>💾</span>
              <span className="hidden sm:inline">Экспорт .md</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Reading Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table of contents sidebar (Only for long essays, hidden for profile) */}
        {!isProfile && showToc && (
          <aside className="w-64 bg-slate-100 border-r border-slate-300 p-4 overflow-y-auto hidden md:block flex-shrink-0">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
              Структура документа
            </div>
            <div className="text-xs font-semibold text-blue-900 mb-3 border-b border-slate-200 pb-1">
              {currentDoc.title}
            </div>

            <nav className="space-y-1">
              {currentDoc.sections.map((sec, idx) => {
                if (!sec.heading) return null;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const el = document.getElementById(`section-${idx}`);
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full text-left p-1.5 rounded hover:bg-slate-200/80 text-[11px] text-slate-700 font-medium leading-snug truncate"
                    style={{ cursor: xpCursors.pointer }}
                  >
                    {sec.heading}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 pt-4 border-t border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div>Объем: ~{currentDoc.wordCount} слов</div>
              <div>Время чтения: ~{Math.ceil(currentDoc.wordCount / 180)} мин</div>
              <div>Дата: {currentDoc.date}</div>
            </div>
          </aside>
        )}

        {/* Scrollable Document Container */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center bg-[#8c96a5]"
        >
          {isProfile ? (
            /* Vertical A4 Profile Sheet: 794px x 1123px, text in top portion, lower blank page scrollable */
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
                    {currentDoc.title}
                  </h1>
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    className="text-lg md:text-xl font-semibold text-slate-700 mt-2 leading-snug text-left outline-none"
                  >
                    {currentDoc.subtitle}
                  </p>
                </header>

                <div
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  className="text-[20px] leading-[1.55] text-slate-800 text-left mt-6 space-y-4 outline-none"
                >
                  {currentDoc.sections[0]?.paragraphs.map((p, idx, arr) => (
                    <p key={idx} className="text-left">
                      {p}
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
                    <span>Посмотреть проекты</span>
                    <span>→</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenResume}
                    data-ym-goal="word_open_resume"
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-900 border border-slate-300 font-semibold text-sm rounded shadow-xs transition"
                    style={{ cursor: xpCursors.pointer }}
                  >
                    <span>Резюме</span>
                    <span>↗</span>
                  </button>
                </div>

                {/* Contacts from site.ts */}
                <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">Контакты:</span>
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
                </div>
              </div>

              {/* Lower portion: blank page whitespace leading to A4 bottom footer */}
              <div className="pt-16 pb-2 text-center text-xs text-slate-400 font-sans select-none pointer-events-none">
                — 1 —
              </div>
            </article>
          ) : (
            /* Long Essay Layout */
            <article className="w-full max-w-[794px] min-h-[1123px] bg-white shadow-[0_4px_25px_rgba(0,0,0,0.35)] rounded-sm p-6 sm:p-12 md:p-16 border border-slate-300 font-serif text-slate-900 transition-all self-start">
              <header className="border-b-2 border-slate-900 pb-6 mb-8 font-sans">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-600 mb-2">
                  <span>ДОКУМЕНТ: {currentDoc.slug.toUpperCase()}</span>
                  <span>{currentDoc.date}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 font-serif leading-tight">
                  {currentDoc.title}
                </h1>
                <p className="text-sm text-slate-600 font-sans mt-2 leading-normal">
                  {currentDoc.subtitle}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-sans pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-900">
                    Автор: {currentDoc.author}
                  </span>
                  <span className="font-mono text-[11px]">
                    ~{currentDoc.wordCount} слов • {Math.ceil(currentDoc.wordCount / 180)} мин чтения
                  </span>
                </div>
              </header>

              <div className={`space-y-6 ${zoomClasses}`}>
                {currentDoc.sections.map((sec, idx) => (
                  <section key={idx} id={`section-${idx}`} className="space-y-3 scroll-mt-6">
                    {sec.heading && (
                      <h2 className="text-lg sm:text-xl font-bold text-slate-950 font-sans tracking-tight pt-2 border-b border-slate-200 pb-1">
                        {sec.heading}
                      </h2>
                    )}

                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx} className="text-slate-800 leading-relaxed text-justify">
                        {p}
                      </p>
                    ))}

                    {sec.callout && (
                      <blockquote className="my-4 p-4 border-l-4 border-blue-600 bg-blue-50/60 font-sans italic text-slate-900 rounded-r text-sm">
                        {sec.callout}
                      </blockquote>
                    )}
                  </section>
                ))}
              </div>

              <footer className="mt-16 pt-8 border-t border-slate-200 font-sans text-xs text-slate-600 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-slate-900">Влад Ахметов</div>
                  <div className="text-[11px]">Дизайн-инженер • Владивосток — Иннополис</div>
                </div>
                <div className="font-mono text-[11px] text-slate-600">
                  Отредактировано для личного компьютера v2.0
                </div>
              </footer>
            </article>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#7f9db9] px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-sans flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>Стр. 1 из 1</span>
          <span>•</span>
          {!isProfile && (
            <>
              <span>{currentDoc.wordCount} слов</span>
              <span>•</span>
            </>
          )}
          <span>Русский (Россия)</span>
        </div>
        {!isProfile && (
          <div className="flex items-center gap-2">
            <span>Режим чтения</span>
            <span>•</span>
            <span className="font-mono">
              {zoom === "normal" ? "100%" : zoom === "large" ? "125%" : "150%"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
