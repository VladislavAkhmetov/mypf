"use client";

import React, { useState, useMemo, useRef } from "react";
import { documentsList, DocumentItem } from "@/data/documents";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { WordDocIcon } from "../xp-icons";

type ZoomLevel = "normal" | "large" | "reading";

export function WordWindow({ initialDocSlug }: { initialDocSlug?: string }) {
  const [selectedSlug, setSelectedSlug] = useState<string>(
    () => initialDocSlug || documentsList[0]?.slug || "about-vlad"
  );
  const [zoom, setZoom] = useState<ZoomLevel>("normal");
  const [showToc, setShowToc] = useState(true);
  const contentRef = useRef<HTMLDivElement>(null);

  const currentDoc: DocumentItem = useMemo(() => {
    return documentsList.find((d) => d.slug === selectedSlug) || documentsList[0];
  }, [selectedSlug]);

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

  const zoomClasses = {
    normal: "text-sm leading-relaxed",
    large: "text-base leading-relaxed",
    reading: "text-lg leading-loose",
  }[zoom];

  return (
    <div className="flex flex-col h-full bg-[#cbd5e1] select-text font-sans text-slate-800 text-xs">
      {/* Word-like Ribbon / Control Bar */}
      <div className="bg-[#f0f4f9] border-b border-[#a0b0c8] p-2 flex flex-wrap items-center justify-between gap-2 shadow-sm flex-shrink-0">
        {/* Left: Document selector tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 mr-2 px-1 text-blue-900 font-bold">
            <WordDocIcon className="w-5 h-5" />
            <span className="hidden sm:inline text-xs">Microsoft Word Reader</span>
          </div>

          {documentsList.map((doc) => {
            const isActive = doc.slug === currentDoc.slug;
            return (
              <button
                key={doc.slug}
                type="button"
                onClick={() => {
                  xpSound.click();
                  setSelectedSlug(doc.slug);
                }}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-blue-900 font-bold border border-[#a0b0c8] shadow-sm"
                    : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                }`}
                style={{ cursor: xpCursors.pointer }}
              >
                {doc.title.split(":")[0]}
              </button>
            );
          })}
        </div>

        {/* Right: Actions (Print, Export, Zoom, TOC toggle) */}
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
                zoom === "normal" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
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
                zoom === "large" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
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
                zoom === "reading" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-100"
              }`}
              style={{ cursor: xpCursors.pointer }}
            >
              150%
            </button>
          </div>

          {/* Real Print Action */}
          <button
            type="button"
            onClick={handlePrint}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-2xs active:translate-y-px"
            style={{ cursor: xpCursors.pointer }}
            title="Распечатать документ или сохранить в PDF через системный диалог"
          >
            <span>🖨️</span>
            <span className="hidden sm:inline">Печать</span>
          </button>

          {/* Real Export Action */}
          <button
            type="button"
            onClick={handleExportText}
            className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded text-xs font-semibold text-slate-800 flex items-center gap-1 shadow-2xs active:translate-y-px"
            style={{ cursor: xpCursors.pointer }}
            title="Экспортировать текст в формате Markdown"
          >
            <span>💾</span>
            <span className="hidden sm:inline">Экспорт .md</span>
          </button>
        </div>
      </div>

      {/* Main Reading Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Table of contents sidebar */}
        {showToc && (
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

        {/* Scrollable Paper Container */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-[#94a3b8]/30"
        >
          {/* A4 Paper Sheet */}
          <article className="w-full max-w-3xl bg-white shadow-xl rounded-sm p-6 sm:p-12 md:p-16 border border-slate-300 min-h-full font-serif text-slate-900 transition-all">
            {/* Document Header */}
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

            {/* Document Sections */}
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

            {/* Document Footer Signature */}
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
        </div>
      </div>

      {/* Word Status Bar */}
      <div className="bg-[#ece9d8] border-t border-[#7f9db9] px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-sans flex-shrink-0">
        <div className="flex items-center gap-3">
          <span>Стр. 1 из 1</span>
          <span>•</span>
          <span>{currentDoc.wordCount} слов</span>
          <span>•</span>
          <span>Русский (Россия)</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Режим чтения</span>
          <span>•</span>
          <span className="font-mono">{zoom === "normal" ? "100%" : zoom === "large" ? "125%" : "150%"}</span>
        </div>
      </div>
    </div>
  );
}
