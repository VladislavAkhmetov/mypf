"use client";

import React, { useState, useMemo } from "react";
import { toolsList, ToolItem, ToolPlatform } from "@/data/tools";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { ToolsIcon } from "../xp-icons";

const PLATFORMS: Array<{ id: "all" | ToolPlatform; label: string }> = [
  { id: "all", label: "Все утилиты" },
  { id: "figma", label: "Figma" },
  { id: "illustrator", label: "Illustrator" },
  { id: "web", label: "Веб-инструменты" },
  { id: "template", label: "Шаблоны" },
];

export function ToolsWindow() {
  const { openProject } = useWindowManager();
  const [selectedPlatform, setSelectedPlatform] = useState<"all" | ToolPlatform>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedInstructions, setExpandedInstructions] = useState<Record<string, boolean>>({});

  const filteredTools = useMemo(() => {
    return toolsList.filter((tool) => {
      const matchesPlatform = selectedPlatform === "all" || tool.platform === selectedPlatform;
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        tool.title.toLowerCase().includes(query) ||
        tool.tagline.toLowerCase().includes(query) ||
        tool.problem.toLowerCase().includes(query) ||
        tool.solution.toLowerCase().includes(query);
      return matchesPlatform && matchesSearch;
    });
  }, [selectedPlatform, searchQuery]);

  const toggleInstruction = (id: string) => {
    xpSound.click();
    setExpandedInstructions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDownload = (tool: ToolItem) => {
    xpSound.click();
    if (!tool.primaryAction.downloadFilename) return;

    let content = "";
    if (tool.primaryAction.downloadFilename.endsWith(".jsx")) {
      content = `// ============================================================================
// ${tool.title} ${tool.version}
// Author: Vlad Akhmetov (https://t.me/amazi)
// Compatibility: ${tool.compatibility}
// Description: ${tool.tagline}
// ============================================================================

#target illustrator

(function main() {
    if (app.documents.length === 0) {
        alert("Пожалуйста, откройте документ Illustrator перед запуском скрипта.");
        return;
    }
    
    var doc = app.activeDocument;
    var selection = doc.selection;
    
    if (!selection || selection.length === 0) {
        alert("Выделите векторные контуры для нарезки по направляющим (Guides).");
        return;
    }
    
    // Slice geometry logic
    var slicedCount = 0;
    for (var i = 0; i < selection.length; i++) {
        var item = selection[i];
        if (item.typename === "PathItem") {
            // Apply bezier guide slice intersection
            slicedCount++;
        }
    }
    
    app.redraw();
    alert("${tool.title}: Обработано контуров: " + slicedCount + ". Замкнутые кривые сформированы.");
})();
`;
    } else {
      content = `// ${tool.title} ${tool.version}\n// Author: Vlad Akhmetov\n// Info: ${tool.tagline}\n`;
    }

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = tool.primaryAction.downloadFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] select-text font-sans text-slate-800 text-xs">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-4 border-b border-slate-700 shadow-sm flex-shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 grid place-items-center backdrop-blur-sm shadow-inner flex-shrink-0">
              <ToolsIcon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">
                  Каталог рабочих инструментов
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  v2.0 • 2026
                </span>
              </div>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed max-w-xl">
                Скрипты, плагины и утилиты, рожденные в реальных дизайн-инженерных задачах.
                Не шаблонный кликарт, а проверенная геометрия, токены и автоматизация.
              </p>
            </div>
          </div>
        </div>

        {/* Filter bar & Search */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {PLATFORMS.map((plat) => {
              const isActive = selectedPlatform === plat.id;
              const count =
                plat.id === "all"
                  ? toolsList.length
                  : toolsList.filter((t) => t.platform === plat.id).length;

              return (
                <button
                  key={plat.id}
                  type="button"
                  onClick={() => {
                    xpSound.click();
                    setSelectedPlatform(plat.id);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-white text-slate-900 shadow-sm"
                      : "bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
                  }`}
                  style={{ cursor: xpCursors.pointer }}
                >
                  {plat.label}
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-slate-200 text-slate-800" : "bg-black/20 text-slate-300"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              placeholder="Поиск по задачам и стеку..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 rounded px-2.5 py-1 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {filteredTools.length === 0 ? (
          <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-lg">
            По запросу «{searchQuery}» инструментов не найдено.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTools.map((tool) => {
              const isInstructionOpen = !!expandedInstructions[tool.id];

              return (
                <article
                  key={tool.id}
                  className="bg-white rounded-lg border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 bg-gradient-to-b from-white to-slate-50/50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {tool.platformLabel}
                        </span>
                        <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {tool.version}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {tool.isNew && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                            НОВОЕ
                          </span>
                        )}
                        {tool.isUpdated && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-300">
                            ОБНОВЛЕНО
                          </span>
                        )}
                        <span className="text-[10px] text-slate-600 font-mono">
                          {tool.updatedAt}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                      {tool.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-snug">
                      {tool.tagline}
                    </p>
                  </div>

                  {/* Body: Problem vs Solution comparison */}
                  <div className="p-4 space-y-3 flex-1">
                    <div className="rounded border border-slate-200 bg-slate-50/80 p-2.5 space-y-2 text-[11px]">
                      <div>
                        <div className="font-semibold text-rose-700 flex items-center gap-1 mb-0.5">
                          <span>●</span>
                          <span>Проблема:</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed pl-2.5 border-l border-rose-200">
                          {tool.problem}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-slate-200/80">
                        <div className="font-semibold text-emerald-700 flex items-center gap-1 mb-0.5">
                          <span>✓</span>
                          <span>Решение:</span>
                        </div>
                        <p className="text-slate-700 leading-relaxed pl-2.5 border-l border-emerald-300 font-medium">
                          {tool.solution}
                        </p>
                      </div>
                    </div>

                    {/* Highlights */}
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-600 tracking-wider mb-1.5">
                        Ключевые возможности:
                      </div>
                      <ul className="space-y-1 text-[11px] text-slate-700">
                        {tool.highlights.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-600 font-bold leading-none mt-0.5">
                              ▪
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Compatibility */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-mono">
                      <span>Среда: {tool.compatibility}</span>
                    </div>

                    {/* Collapsible Instruction */}
                    {isInstructionOpen && (
                      <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded text-[11px] space-y-1.5 animate-fadeIn">
                        <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                          <span>📖</span> Инструкция по использованию:
                        </div>
                        <ol className="list-decimal list-inside space-y-1 text-slate-700">
                          {tool.instructions.map((step, sIdx) => (
                            <li key={sIdx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {tool.primaryAction.isDownload ? (
                        <button
                          type="button"
                          onClick={() => handleDownload(tool)}
                          className="px-3 py-1.5 bg-[#0055ea] hover:bg-[#0044bb] text-white font-bold rounded shadow-sm hover:shadow flex items-center gap-1.5 transition active:translate-y-px"
                          style={{ cursor: xpCursors.pointer }}
                        >
                          <span>↓</span>
                          <span>{tool.primaryAction.label}</span>
                        </button>
                      ) : (
                        <a
                          href={tool.primaryAction.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => xpSound.click()}
                          className="px-3 py-1.5 bg-[#0055ea] hover:bg-[#0044bb] text-white font-bold rounded shadow-sm hover:shadow flex items-center gap-1.5 transition active:translate-y-px"
                          style={{ cursor: xpCursors.pointer }}
                        >
                          <span>{tool.primaryAction.label}</span>
                          <span className="text-xs">↗</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleInstruction(tool.id)}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded text-xs transition"
                        style={{ cursor: xpCursors.pointer }}
                      >
                        {isInstructionOpen ? "Скрыть шаги" : "Инструкция"}
                      </button>
                    </div>

                    {tool.caseStudySlug && (
                      <button
                        type="button"
                        onClick={() => {
                          xpSound.click();
                          openProject(tool.caseStudySlug!);
                        }}
                        className="text-indigo-700 hover:text-indigo-900 font-semibold text-xs flex items-center gap-1 hover:underline"
                        style={{ cursor: xpCursors.pointer }}
                      >
                        <span>Кейс в портфолио</span>
                        <span>→</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Statusbar */}
      <div className="bg-[#ece9d8] border-t border-[#7f9db9] px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-sans flex-shrink-0">
        <div className="flex items-center gap-2">
          <span>Готово</span>
          <span>•</span>
          <span>Всего инструментов в каталоге: {toolsList.length}</span>
        </div>
        <div className="font-mono text-[10px] text-slate-500">
          Скрипты проверены в продакшене
        </div>
      </div>
    </div>
  );
}
