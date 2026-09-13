"use client";

import React, { useState } from "react";
import { getAdjacent, getProject, Project } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { Motif } from "@/components/motifs";

/* Custom Bespoke Specimen Components per Domain to avoid generic AI templates */

// 1. Kora Specimen: Interactive Typeface Tester & Metrics
function KoraSpecimen() {
  const [sampleText, setSampleText] = useState("В бумажном фонде архива края букв слоятся, как кора.");
  const [fontSize, setFontSize] = useState(28);

  return (
    <div className="bg-[#1a1c18] text-[#f4f2e9] p-4 sm:p-6 rounded-lg border border-[#3e4235] space-y-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3e4235] pb-3 text-xs font-mono">
        <span className="text-[#a4b58e] uppercase tracking-widest font-bold">
          TYPE SPECIMEN // KORA ARCHIVE GROTESQUE
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Кегль:</span>
          <input
            type="range"
            min={18}
            max={48}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-24 h-1.5 bg-[#2c3024] accent-[#a4b58e] rounded"
          />
          <span className="w-8 font-mono text-right">{fontSize}px</span>
        </div>
      </div>

      <div className="min-h-[90px] flex items-center">
        <p
          className="w-full font-black tracking-tight leading-snug outline-none border-b border-transparent focus:border-[#a4b58e] transition"
          style={{ fontSize: `${fontSize}px` }}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setSampleText(e.currentTarget.textContent || sampleText)}
        >
          {sampleText}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#3e4235] text-[10px] font-mono text-[#a4b58e]">
        <div>
          <span className="text-slate-500 block">НАЧЕРТАНИЕ:</span>
          <strong>Display Regular</strong>
        </div>
        <div>
          <span className="text-slate-500 block">МЕТРИКИ:</span>
          <strong>Cap 740 / X 520</strong>
        </div>
        <div>
          <span className="text-slate-500 block">ОПИЛ:</span>
          <strong>Слоистый срез</strong>
        </div>
        <div>
          <span className="text-slate-500 block">ФОРМАТ:</span>
          <strong>OpenType / WOFF2</strong>
        </div>
      </div>
    </div>
  );
}

// 2. Signalatlas Specimen: Spectral Interference Cartography
function SignalatlasSpecimen() {
  const [band, setBand] = useState<"VHF" | "UHF" | "AM">("VHF");

  return (
    <div className="bg-[#061814] text-[#86efac] p-4 sm:p-6 rounded-lg border border-[#134e40] space-y-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#134e40] pb-3 text-xs font-mono">
        <span className="text-[#34d399] uppercase tracking-widest font-bold">
          INTERFERENCE ATLAS // МЕРТВЫЕ ЗОНЫ РАДИОТИШИНЫ
        </span>
        <div className="flex gap-1">
          {(["VHF", "UHF", "AM"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                xpSound.click();
                setBand(b);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                band === b ? "bg-[#059669] text-white" : "bg-[#0a2e26] text-[#6ee7b7] hover:text-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Cartographic Frequency Matrix */}
      <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 p-3 bg-[#03100d] rounded border border-[#0d3b31] font-mono text-[9px]">
        {Array.from({ length: 36 }).map((_, i) => {
          const intensity = ((i * 17 + (band === "UHF" ? 7 : band === "AM" ? 13 : 3)) % 10) / 10;
          const isDeadZone = intensity < 0.25;
          return (
            <div
              key={i}
              className={`h-7 rounded flex items-center justify-center font-bold transition-all ${
                isDeadZone
                  ? "bg-red-950/80 border border-red-500/50 text-red-300"
                  : "border border-[#059669]/30 text-[#a7f3d0]"
              }`}
              style={{
                backgroundColor: isDeadZone ? undefined : `rgba(5, 150, 105, ${intensity * 0.4 + 0.1})`,
              }}
              title={isDeadZone ? `Сектор ${i + 1}: Полная радиотишина (0 dB)` : `Сектор ${i + 1}: Затухание ${(intensity * 100).toFixed(0)}%`}
            >
              {isDeadZone ? "Ø" : `${(intensity * 9).toFixed(0)}`}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-[#6ee7b7]">
        <span>Легенда: [Ø] Полная тишина связи</span>
        <span>Координаты: 55°45&apos;N, 37°37&apos;E • 144.200 MHz</span>
      </div>
    </div>
  );
}

// 3. Noclip Specimen: Spatial OS Architecture Schema
function NoclipSpecimen() {
  const [activeRoom, setActiveRoom] = useState<number>(0);
  const rooms = [
    { name: "Зал 01: Архитектурный гипс", syscall: "SYS_PROJECT_FACADE", windows: 3 },
    { name: "Зал 02: Фотоархив экспедиций", syscall: "SYS_READ_EXPOSURE", windows: 6 },
    { name: "Зал 03: Акустический купол", syscall: "SYS_LISTEN_SPECTRA", windows: 2 },
  ];

  return (
    <div className="bg-[#0a1120] text-[#93c5fd] p-4 sm:p-6 rounded-lg border border-[#1e3a8a] space-y-4 shadow-inner font-mono">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e3a8a] pb-3 text-xs">
        <span className="text-sky-400 uppercase tracking-widest font-bold">
          MUSEUM SPATIAL OS // ЗАЛЫ КАК СИСТЕМНЫЕ ВЫЗОВЫ
        </span>
        <span className="text-[10px] text-slate-400">Node: SPATIAL-CORE-01</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {rooms.map((r, idx) => (
          <button
            key={r.name}
            type="button"
            onClick={() => {
              xpSound.click();
              setActiveRoom(idx);
            }}
            className={`p-3 rounded border text-left transition ${
              activeRoom === idx
                ? "bg-blue-900/60 border-sky-400 text-white shadow-sm"
                : "bg-[#0d182e] border-[#1e3a8a]/60 text-slate-300 hover:border-sky-500"
            }`}
          >
            <div className="text-[10px] text-sky-400 font-bold mb-1">ROOM 0{idx + 1}</div>
            <div className="font-bold text-xs leading-snug">{r.name}</div>
            <div className="text-[9px] text-slate-400 mt-2 font-mono">{r.syscall}</div>
          </button>
        ))}
      </div>

      <div className="p-3 bg-[#050b17] border border-[#1e3a8a] rounded text-[11px] space-y-1">
        <div className="text-sky-300 font-bold">Активный контекст проекции:</div>
        <div className="text-slate-300">
          Привязка: <strong>{rooms[activeRoom].name}</strong> • Оконных проекций в пространстве:{" "}
          <strong>{rooms[activeRoom].windows}</strong>
        </div>
        <div className="text-slate-500 text-[10px]">
          Интерфейс не требует смартфона: датчики позиционирования передают состояние зала как параметры DOM-контейнеров на проекторах.
        </div>
      </div>
    </div>
  );
}

// 4. Default Bespoke Specimen (Motif & Engineering Canvas)
function GenericTactileSpecimen({ project }: { project: Project }) {
  return (
    <div
      className="relative w-full h-56 sm:h-72 rounded-lg border-2 border-slate-300 overflow-hidden shadow-inner flex items-center justify-center p-6"
      style={{
        background: `linear-gradient(135deg, ${project.glow[0]} 0%, ${project.glow[1]} 100%)`,
      }}
    >
      <Motif type={project.motif} className="opacity-45" />
      <div className="absolute inset-0 bg-radial from-transparent to-black/60 pointer-events-none" />

      <div className="relative z-10 text-center max-w-md space-y-2 text-white">
        <div className="inline-block px-2.5 py-0.5 bg-black/60 border border-white/20 rounded font-mono text-[10px] tracking-widest uppercase">
          {project.motif} MOTIF // ARCHIVAL SPECIMEN
        </div>
        <h2 className="text-2xl sm:text-3xl font-black drop-shadow-md tracking-tight">{project.title}</h2>
        <p className="text-xs sm:text-sm text-white/90 drop-shadow leading-relaxed">
          {project.kicker.ru}
        </p>
      </div>

      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] font-mono text-white/70">
        <span>C:\\Projects\\{project.slug.toUpperCase()}</span>
        <span>YEAR: {project.year}</span>
      </div>
    </div>
  );
}

export function ProjectExplorerWindow({ slug }: { slug: string }) {
  const { t, locale } = useLocale();
  const { openProject, showBalloon, openWindow } = useWindowManager();
  const project = getProject(slug);
  const { prev, next } = getAdjacent(slug);

  if (!project) {
    return (
      <div className="p-8 text-center text-sm text-red-600 bg-white flex-1">
        Проект не найден: {slug}
      </div>
    );
  }

  const tags = project.tags[locale];

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/?project=${project.slug}`;
      navigator.clipboard.writeText(url);
      showBalloon("Ссылка скопирована", `Прямая ссылка на проект «${project.title}» в буфере обмена.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-text text-xs">
      {/* Explorer Menu bar */}
      <div className="xp-menu-bar">
        <button
          type="button"
          onClick={() =>
            openWindow({
              id: "my-documents",
              type: "my-documents",
              title: "Мои работы — Проекты",
              iconType: "folder",
              x: 60,
              y: 50,
              width: 620,
              height: 420,
            })
          }
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          ← Все проекты
        </button>
        <span className="xp-menu-item text-slate-500">Правка</span>
        <span className="xp-menu-item text-slate-500">Вид</span>
        <span className="xp-menu-item text-slate-500">Справка</span>
      </div>

      {/* Explorer Toolbar with Navigation */}
      <div className="xp-toolbar flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => prev && openProject(prev.slug)}
            disabled={!prev}
            className="xp-toolbar-btn"
            title="Предыдущий проект"
            style={{ cursor: prev ? xpCursors.pointer : "default" }}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-600 grid place-items-center text-white text-xs font-bold shadow-xs">
              ←
            </div>
            <span>Предыдущий</span>
          </button>
          <button
            type="button"
            onClick={() => next && openProject(next.slug)}
            disabled={!next}
            className="xp-toolbar-btn"
            title="Следующий проект"
            style={{ cursor: next ? xpCursors.pointer : "default" }}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-600 grid place-items-center text-white text-xs font-bold shadow-xs">
              →
            </div>
            <span>Следующий</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLink}
            className="xp-toolbar-btn"
            style={{ cursor: xpCursors.pointer }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Поделиться</span>
          </button>
        </div>
      </div>

      {/* Address Bar */}
      <div className="xp-address-bar flex items-center gap-2">
        <span className="xp-address-label">Адрес</span>
        <div className="xp-address-input-wrap flex-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          <span className="text-xs font-mono text-slate-800 flex-1 truncate">
            C:\Projects\{project.slug.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Explorer Body: Left Task Pane + Editorial Case Dossier */}
      <div className="flex-1 flex overflow-hidden bg-white">
        {/* Left Tasks Pane */}
        <div className="w-52 bg-[#7ba2e7]/15 border-r border-[#9bbfe8] p-3 overflow-y-auto hidden sm:flex flex-col gap-3 text-[11px]">
          {/* Action Tasks */}
          <div className="bg-white/90 border border-[#7ba2e7] rounded shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#215dc6] to-[#3a7fe8] text-white px-2.5 py-1 font-bold flex items-center justify-between">
              <span>Действия</span>
              <span className="text-[10px]">▲</span>
            </div>
            <div className="p-2 space-y-1.5 text-slate-800">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-left flex items-center gap-1.5 py-1 px-1 hover:bg-blue-50 text-blue-900 font-bold rounded"
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>🌐</span>
                  <span>Открыть оригинал</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full text-left flex items-center gap-1.5 py-1 px-1 hover:bg-blue-50 text-slate-800 rounded"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>🔗</span>
                <span>Скопировать URL</span>
              </button>
              {next && (
                <button
                  type="button"
                  onClick={() => openProject(next.slug)}
                  className="w-full text-left flex items-center gap-1.5 py-1 px-1 hover:bg-blue-50 text-slate-800 rounded"
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>⏩</span>
                  <span className="truncate">Дальше: {next.title}</span>
                </button>
              )}
            </div>
          </div>

          {/* Project Details Group */}
          <div className="bg-white/90 border border-[#7ba2e7] rounded shadow-xs overflow-hidden">
            <div className="bg-gradient-to-r from-[#215dc6] to-[#3a7fe8] text-white px-2.5 py-1 font-bold flex items-center justify-between">
              <span>Паспорт объекта</span>
              <span className="text-[10px]">ℹ️</span>
            </div>
            <div className="p-2.5 space-y-1.5 text-[10px] text-slate-700">
              <div>
                <span className="text-slate-500 block">ГОД РЕАЛИЗАЦИИ:</span>
                <strong className="text-slate-900 font-mono text-xs">{project.year}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">СТИЛЬ & МОТИВ:</span>
                <strong className="text-blue-800 font-mono">{project.motif}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">КАТЕГОРИИ:</span>
                <span className="text-slate-800">{tags.join(", ")}</span>
              </div>
              <div>
                <span className="text-slate-500 block">РОЛЬ ВЛАДА:</span>
                <span className="text-slate-900 font-semibold">Дизайн-инженер (UI & System)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Editorial Dossier Content */}
        <div className="flex-1 p-4 sm:p-7 overflow-y-auto bg-white space-y-6">
          {/* Archival Classification Header */}
          <div className="border-b-2 border-slate-900 pb-4 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>DOSSIER // DE-{project.year}-{project.slug.toUpperCase()}</span>
              <span>АРХИВ ДИЗАЙН-ИНЖЕНЕРА</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {project.title}
            </h1>
            <p className="text-sm sm:text-base font-semibold text-blue-800 leading-snug">
              {t(project.kicker)}
            </p>
          </div>

          {/* Bespoke Tactile / Domain Specimen */}
          <div>
            {project.slug === "kora" && <KoraSpecimen />}
            {project.slug === "signalatlas" && <SignalatlasSpecimen />}
            {project.slug === "noclip" && <NoclipSpecimen />}
            {project.slug !== "kora" && project.slug !== "signalatlas" && project.slug !== "noclip" && (
              <GenericTactileSpecimen project={project} />
            )}
          </div>

          {/* Design Engineering Anatomy: Problem & Constraints, System, Implementation */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
              Анатомия решения
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Block 1: Problem & Constraints */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  01 // Контекст & Ограничения
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {t(project.body)}
                </p>
              </div>

              {/* Block 2: System & Visual Grammar */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  02 // Логика & Грамматика
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  Построение строгой модульной системы, исключающей случайные декоративные решения. Форма подчинена физическим свойствам носителя и условиям считывания.
                </p>
              </div>

              {/* Block 3: Engineering & Code Loop */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  03 // Код & Реализация
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  Модель и код объединены в одном цикле проверки: от интерактивных прототипов до стабильного рендеринга без просадок по производительности на целевых экранах.
                </p>
              </div>
            </div>
          </div>

          {/* Deliverables & Technical Spec Sheet */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Спецификация артефактов и сдачи
            </h3>
            <div className="border border-slate-300 rounded overflow-hidden">
              <table className="w-full text-left text-xs">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-700 w-44">Тип поставки:</td>
                    <td className="py-2 px-3 text-slate-900">
                      Интерактивная система, шрифтовые файлы / интерфейсный модуль
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-2 px-3 font-semibold text-slate-700">Стек и инструменты:</td>
                    <td className="py-2 px-3 text-blue-900 font-medium">
                      {tags.join(" • ")} • React • TypeScript • Canvas / WebGL
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="py-2 px-3 font-semibold text-slate-700">Готовность:</td>
                    <td className="py-2 px-3 text-emerald-800 font-bold">
                      Архивировано в портфолио ({project.year})
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center gap-3">
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm flex items-center gap-1.5 transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>{project.linkLabel ? t(project.linkLabel) : "Смотреть проект"}</span>
                <span>↗</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-300 font-semibold rounded shadow-xs transition"
              style={{ cursor: xpCursors.pointer }}
            >
              Скопировать ссылку
            </button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="xp-statusbar flex items-center justify-between">
        <span>Досье: {project.title} ({project.year})</span>
        <span className="text-slate-600">Дисциплина: {tags.join(", ")}</span>
      </div>
    </div>
  );
}
