"use client";

import React, { useState, useMemo } from "react";
import { projects } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpCursors } from "@/lib/xp/cursors";
import { xpSound } from "@/lib/xp/sound";
import { ProjectFileIcon } from "../xp-icons";

type ViewMode = "tiles" | "details";
type DisciplineFilter = "all" | "type" | "systems" | "identity";

export function MyDocumentsWindow() {
  const { t, locale } = useLocale();
  const { openProject } = useWindowManager();

  const [viewMode, setViewMode] = useState<ViewMode>("tiles");
  const [filter, setFilter] = useState<DisciplineFilter>("all");
  const [selectedSlug, setSelectedSlug] = useState<string>(projects[0]?.slug || "kora");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      // Discipline filter
      if (filter === "type") {
        const isType = p.tags.ru.some((tag) => tag.includes("шрифт") || tag.includes("издание") || tag.includes("карты"));
        if (!isType) return false;
      } else if (filter === "systems") {
        const isSystem = p.tags.ru.some((tag) => tag.includes("система") || tag.includes("product") || tag.includes("software"));
        if (!isSystem) return false;
      } else if (filter === "identity") {
        const isIdentity = p.tags.ru.some((tag) => tag.includes("айдентика") || tag.includes("упаковка") || tag.includes("носители") || tag.includes("билеты"));
        if (!isIdentity) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesKicker = t(p.kicker).toLowerCase().includes(q);
        const matchesTags = p.tags[locale].some((tag) => tag.toLowerCase().includes(q));
        return matchesTitle || matchesKicker || matchesTags;
      }

      return true;
    });
  }, [filter, searchQuery, t, locale]);

  const selectedProject = useMemo(() => {
    return projects.find((p) => p.slug === selectedSlug) || filteredProjects[0] || projects[0];
  }, [selectedSlug, filteredProjects]);

  const handleSelect = (slug: string) => {
    xpSound.click();
    setSelectedSlug(slug);
  };

  const handleOpen = (slug: string) => {
    openProject(slug);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-text text-xs">
      {/* Explorer Menu Bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item">Файл</span>
        <span className="xp-menu-item">Правка</span>
        <span className="xp-menu-item">Вид</span>
        <span className="xp-menu-item">Избранное</span>
        <span className="xp-menu-item">Сервис</span>
        <span className="xp-menu-item">Справка</span>
      </div>

      {/* Explorer Toolbar: Filters, View Mode & Search */}
      <div className="xp-toolbar flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1">
          {/* Discipline Filters */}
          <button
            type="button"
            onClick={() => {
              xpSound.click();
              setFilter("all");
            }}
            className={`xp-toolbar-btn ${filter === "all" ? "bg-white/80 border border-slate-400 font-bold shadow-sm" : ""}`}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>📁</span>
            <span>Все ({projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => {
              xpSound.click();
              setFilter("type");
            }}
            className={`xp-toolbar-btn ${filter === "type" ? "bg-white/80 border border-slate-400 font-bold shadow-sm" : ""}`}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>🔤</span>
            <span>Шрифты & Печать</span>
          </button>
          <button
            type="button"
            onClick={() => {
              xpSound.click();
              setFilter("systems");
            }}
            className={`xp-toolbar-btn ${filter === "systems" ? "bg-white/80 border border-slate-400 font-bold shadow-sm" : ""}`}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>⚡</span>
            <span>Интерфейсы & Системы</span>
          </button>
          <button
            type="button"
            onClick={() => {
              xpSound.click();
              setFilter("identity");
            }}
            className={`xp-toolbar-btn ${filter === "identity" ? "bg-white/80 border border-slate-400 font-bold shadow-sm" : ""}`}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>🏛️</span>
            <span>Айдентика & Пространство</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* View Modes (Tiles vs Details) */}
          <div className="flex items-center bg-white/70 border border-slate-300 rounded p-0.5">
            <button
              type="button"
              onClick={() => {
                xpSound.click();
                setViewMode("tiles");
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                viewMode === "tiles" ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Режим плитки"
            >
              Плитка
            </button>
            <button
              type="button"
              onClick={() => {
                xpSound.click();
                setViewMode("details");
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                viewMode === "details" ? "bg-blue-600 text-white shadow-xs" : "text-slate-700 hover:bg-slate-200"
              }`}
              style={{ cursor: xpCursors.pointer }}
              title="Таблица с деталями"
            >
              Таблица
            </button>
          </div>
        </div>
      </div>

      {/* Address & Filter Bar */}
      <div className="xp-address-bar flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <span className="xp-address-label">Адрес</span>
          <div className="xp-address-input-wrap flex-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
            </svg>
            <span className="text-xs font-mono text-slate-800 flex-1 truncate">
              C:\Projects\{filter.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Quick Search */}
        <div className="flex items-center gap-1">
          <span className="text-slate-500 text-[11px]">Поиск:</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Фильтр..."
            className="px-2 py-0.5 bg-white border border-slate-400 rounded text-xs text-slate-900 w-28 sm:w-36 outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Main Body: Explorer Tasks Sidebar + Projects Area */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Left Tasks & Preview Pane (Authentic XP Explorer) */}
        <div className="w-56 bg-[#7ba2e7]/15 border-r border-[#9bbfe8] p-3 overflow-y-auto hidden md:flex flex-col gap-3 text-[11px]">
          {/* Group: Folder Tasks */}
          <div className="bg-white/90 border border-[#7ba2e7] rounded shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#215dc6] to-[#3a7fe8] text-white px-2.5 py-1 font-bold flex items-center justify-between">
              <span>Задачи каталога</span>
              <span className="text-[10px]">▲</span>
            </div>
            <div className="p-2 space-y-1 text-slate-800">
              <button
                type="button"
                onClick={() => handleOpen(selectedProject.slug)}
                className="w-full text-left flex items-center gap-1.5 py-1 px-1 hover:bg-blue-50 text-blue-900 font-bold rounded"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📂</span>
                <span className="truncate">Открыть «{selectedProject.title}»</span>
              </button>
              <div className="text-[10px] text-slate-500 px-1">
                Двойной клик по строке или карточке открывает детальное досье проекта.
              </div>
            </div>
          </div>

          {/* Group: Selected Project Dossier Preview */}
          {selectedProject && (
            <div className="bg-white/90 border border-[#7ba2e7] rounded shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-[#215dc6] to-[#3a7fe8] text-white px-2.5 py-1 font-bold flex items-center justify-between">
                <span>Досье проекта</span>
                <span className="text-[10px]">ℹ️</span>
              </div>
              <div className="p-2.5 space-y-2 text-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-slate-100 border border-slate-300 grid place-items-center">
                    <ProjectFileIcon motif={selectedProject.motif} className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-slate-900">{selectedProject.title}</div>
                    <div className="text-[10px] text-blue-700 font-semibold">{selectedProject.year}</div>
                  </div>
                </div>

                <p className="text-[11px] leading-relaxed text-slate-600">
                  {t(selectedProject.body)}
                </p>

                <div className="pt-1 border-t border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                  <div>
                    <strong>Мотив: </strong>
                    <span className="font-mono">{selectedProject.motif}</span>
                  </div>
                  <div>
                    <strong>Теги: </strong>
                    <span>{selectedProject.tags[locale].join(", ")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpen(selectedProject.slug)}
                  className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-center shadow-xs transition"
                  style={{ cursor: xpCursors.pointer }}
                >
                  Изучить решение →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Content Area: Projects Grid or Detailed Table */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto bg-white">
          {filteredProjects.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <span className="text-2xl">🔍</span>
              <span className="font-semibold">Ничего не найдено по запросу</span>
              <button
                type="button"
                onClick={() => {
                  setFilter("all");
                  setSearchQuery("");
                }}
                className="text-blue-700 underline text-xs"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : viewMode === "tiles" ? (
            /* TILES VIEW (Карточки с типографикой и метаданными) */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredProjects.map((p) => {
                const isSelected = p.slug === selectedProject?.slug;
                return (
                  <div
                    key={p.slug}
                    onClick={() => handleSelect(p.slug)}
                    onDoubleClick={() => handleOpen(p.slug)}
                    className={`p-3 rounded border transition flex flex-col justify-between select-text ${
                      isSelected
                        ? "bg-blue-50/90 border-blue-500 shadow-sm ring-1 ring-blue-400"
                        : "bg-slate-50/70 border-slate-200 hover:border-blue-300 hover:bg-white"
                    }`}
                    style={{ cursor: xpCursors.pointer }}
                    title="Двойной клик для открытия"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded bg-white border border-slate-200 grid place-items-center flex-shrink-0 shadow-xs">
                            <ProjectFileIcon motif={p.motif} className="w-8 h-8" />
                          </div>
                          <div>
                            <div className="font-black text-sm text-slate-900 leading-tight">
                              {p.title}
                            </div>
                            <div className="text-[10px] text-blue-700 font-bold uppercase tracking-wider mt-0.5">
                              {p.year} • {t(p.kicker)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                        {t(p.body)}
                      </p>
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
                      <div className="flex flex-wrap gap-1">
                        {p.tags[locale].slice(0, 2).map((tVal) => (
                          <span key={tVal} className="px-1.5 py-0.5 bg-slate-200/80 text-slate-700 rounded font-medium">
                            {tVal}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpen(p.slug);
                        }}
                        className="font-bold text-blue-800 hover:underline flex items-center gap-0.5"
                      >
                        <span>Открыть</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* DETAILS TABLE VIEW (Инженерная детальная таблица) */
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-bold text-[11px]">
                    <th className="py-2 px-3">Название проекта</th>
                    <th className="py-2 px-3">Год</th>
                    <th className="py-2 px-3">Назначение / Задача</th>
                    <th className="py-2 px-3">Категории</th>
                    <th className="py-2 px-3">Стиль / Мотив</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((p) => {
                    const isSelected = p.slug === selectedProject?.slug;
                    return (
                      <tr
                        key={p.slug}
                        onClick={() => handleSelect(p.slug)}
                        onDoubleClick={() => handleOpen(p.slug)}
                        className={`border-b border-slate-100 transition ${
                          isSelected ? "bg-blue-100/70 font-semibold text-blue-950" : "hover:bg-slate-50 text-slate-800"
                        }`}
                        style={{ cursor: xpCursors.pointer }}
                      >
                        <td className="py-2 px-3 flex items-center gap-2">
                          <div className="w-5 h-5 flex-shrink-0">
                            <ProjectFileIcon motif={p.motif} className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-900">{p.title}</span>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">{p.year}</td>
                        <td className="py-2 px-3 text-slate-600 max-w-xs truncate">{t(p.kicker)}</td>
                        <td className="py-2 px-3 text-slate-500">{p.tags[locale].join(", ")}</td>
                        <td className="py-2 px-3 font-mono text-[11px] text-blue-700">{p.motif}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="xp-statusbar flex items-center justify-between">
        <span>
          {filteredProjects.length} из {projects.length} объектов
        </span>
        <span className="text-slate-600">
          Выбран: <strong>{selectedProject?.title}</strong> ({selectedProject?.year})
        </span>
      </div>
    </div>
  );
}
