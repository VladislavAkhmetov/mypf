"use client";

import React, { useState } from "react";
import Image from "next/image";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { changelogList } from "@/data/changelog";
import { toolsList } from "@/data/tools";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { ToolsIcon, WordDocIcon, SolitaireIcon } from "../xp-icons";

export function StarterWindow() {
  const { t } = useLocale();
  const { openWindow, openProject } = useWindowManager();
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Featured 3 curated projects as demanded by v2 spec: Kora (Hero), Signalatlas, Noclip
  const heroProject = projects.find((p) => p.slug === "kora") || projects[0];
  const secondaryProjects = projects.filter((p) => p.slug === "signalatlas" || p.slug === "noclip");

  const handleCopyEmail = () => {
    xpSound.click();
    navigator.clipboard.writeText(site.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleOpenWorks = () => {
    xpSound.click();
    openWindow({
      id: "my-documents",
      type: "my-documents",
      title: "Мои работы — Проекты",
      iconType: "folder",
      x: 70,
      y: 40,
      width: 680,
      height: 480,
    });
  };

  const handleOpenTools = () => {
    xpSound.click();
    openWindow({
      id: "tools",
      type: "tools",
      title: "Инструменты — Плагины и скрипты",
      iconType: "tools",
      x: 80,
      y: 45,
      width: 760,
      height: 520,
    });
  };

  const handleOpenDocuments = (slug = "about-vlad") => {
    xpSound.click();
    openWindow({
      id: "word",
      type: "word",
      title: "Документы — Влад Ахметов",
      iconType: "word",
      x: 85,
      y: 45,
      width: 740,
      height: 540,
      props: { initialSlug: slug },
    });
  };

  const handleOpenResume = () => {
    xpSound.click();
    openWindow({
      id: "resume",
      type: "resume",
      title: "Резюме_Влад_Ахметов.pdf — Резюме",
      iconType: "resume",
      x: 90,
      y: 50,
      width: 680,
      height: 520,
    });
  };

  const handleOpenSolitaire = () => {
    xpSound.click();
    openWindow({
      id: "solitaire",
      type: "solitaire",
      title: "Косынка — Maison Solitaire",
      iconType: "solitaire",
      x: 75,
      y: 35,
      width: 840,
      height: 620,
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-text min-h-0">
      {/* Menu Bar */}
      <div className="xp-menu-bar border-b border-slate-300">
        <span className="xp-menu-item text-blue-900 font-bold">Личный компьютер</span>
        <button
          type="button"
          onClick={handleOpenWorks}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          Работы
        </button>
        <button
          type="button"
          onClick={handleOpenTools}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          Инструменты
        </button>
        <button
          type="button"
          onClick={() => handleOpenDocuments("about-vlad")}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          Документы
        </button>
        <button
          type="button"
          onClick={handleOpenSolitaire}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer"
        >
          Косынка
        </button>
        <button
          type="button"
          onClick={handleOpenResume}
          className="xp-menu-item hover:bg-[#316ac5] hover:text-white px-2 py-0.5 rounded-sm transition cursor-pointer ml-auto font-bold text-blue-900"
        >
          Резюме PDF
        </button>
      </div>

      {/* Main Scrollable Canvas */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* 1. Profile Identity Hero Banner */}
        <div className="bg-white rounded-lg border border-slate-300 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={site.avatar}
                alt={site.name}
                width={72}
                height={72}
                className="rounded-full border-2 border-[#0055ea] shadow-md object-cover"
                unoptimized
              />
              <span
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white"
                title="Открыт к предложениям"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {site.name}
                </h1>
                <span className="px-2 py-0.5 bg-blue-100 text-[#0055ea] border border-blue-200 rounded-full text-xs font-bold font-mono">
                  {t(site.role)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
                Проектирую визуальные системы, типографику, кастомные микроутилиты и интерактивные
                интерфейсы. Работаю на стыке продуктового дизайна и инженерии.
              </p>
            </div>
          </div>

          {/* Quick Contact & Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <a
              href={site.telegram}
              target="_blank"
              rel="noreferrer"
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded text-xs shadow-xs transition"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>✈️</span>
              <span>Telegram</span>
            </a>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold rounded text-xs transition"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>✉️</span>
              <span>{copiedEmail ? "Скопировано!" : "Email"}</span>
            </button>
            <button
              type="button"
              onClick={handleOpenResume}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-semibold rounded text-xs transition"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>📄</span>
              <span>Резюме</span>
            </button>
          </div>
        </div>

        {/* 2. Featured Projects Grid (v2 Editorial Requirement: 1 Hero + 2 Compact) */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-slate-300 pb-1.5">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Избранные проекты (Featured Works)
              </h2>
              <div className="text-[11px] text-slate-500">
                Ключевые работы на стыке шрифта, картографии и пространственных ОС
              </div>
            </div>
            <button
              type="button"
              onClick={handleOpenWorks}
              className="text-xs font-bold text-[#0055ea] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Все проекты ({projects.length})</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Hero Project Card (2 cols on desktop) */}
            <div
              onClick={() => {
                xpSound.click();
                openProject(heroProject.slug);
              }}
              className="md:col-span-2 bg-white rounded-lg border border-slate-300 hover:border-[#0055ea] hover:shadow-md transition p-4 sm:p-5 cursor-pointer flex flex-col justify-between group"
              style={{ cursor: xpCursors.pointer }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold uppercase font-mono tracking-wider">
                      Hero Project
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{heroProject.year}</span>
                  </div>
                  <span className="text-xs text-blue-600 group-hover:translate-x-1 transition font-bold">
                    Открыть досье →
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 group-hover:text-[#0055ea] transition">
                  {heroProject.title}
                </h3>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {t(heroProject.kicker)}
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {t(heroProject.body)}
                </p>
              </div>

              {/* Interactive Specimen Snippet Preview */}
              <div className="mt-4 p-3 bg-slate-950 rounded-md border border-slate-800 text-white flex items-center justify-between overflow-hidden">
                <div className="font-serif text-2xl tracking-tighter text-amber-200">
                  Kora Archival 24pt
                </div>
                <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-800 text-sky-300">
                  Интерактивный глиф-тестер
                </span>
              </div>
            </div>

            {/* 2 Secondary Compact Projects Stack */}
            <div className="flex flex-col gap-4">
              {secondaryProjects.map((p) => (
                <div
                  key={p.slug}
                  onClick={() => {
                    xpSound.click();
                    openProject(p.slug);
                  }}
                  className="flex-1 bg-white rounded-lg border border-slate-300 hover:border-[#0055ea] hover:shadow-md transition p-4 cursor-pointer flex flex-col justify-between group"
                  style={{ cursor: xpCursors.pointer }}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                        {p.year}
                      </span>
                      <span className="text-[11px] text-blue-600 font-bold group-hover:translate-x-0.5 transition">
                        Досье →
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 group-hover:text-[#0055ea] transition">
                      {p.title}
                    </h4>
                    <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                      {t(p.kicker)}
                    </div>
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {p.tags.ru.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. "Что нового" (Public Changelog / Releases strip) */}
        <div className="bg-white rounded-lg border border-slate-300 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📢</span>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Что нового в коллекции и на сайте (Updates)
              </h2>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Публичный журнал</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {changelogList.slice(0, 3).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.targetType === "project") {
                    openProject(item.targetId);
                  } else if (item.targetType === "tool") {
                    handleOpenTools();
                  } else if (item.targetType === "app" && item.targetId === "solitaire") {
                    handleOpenSolitaire();
                  }
                }}
                className="p-3 rounded border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition cursor-pointer flex flex-col justify-between"
                style={{ cursor: xpCursors.pointer }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold font-mono">
                      {item.typeLabel}
                    </span>
                    <span className="text-slate-500 font-mono">{item.date}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-snug mt-1.5">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-slate-600 leading-normal mt-1 line-clamp-2">
                    {item.summary}
                  </div>
                </div>
                <div className="text-[10px] font-bold text-[#0055ea] mt-2 flex items-center gap-1">
                  <span>Перейти</span>
                  <span>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Three Pillars Cards: Tools, Documents, Games */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Tools Pillar */}
          <div
            onClick={handleOpenTools}
            className="p-4 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-lg border border-amber-200 hover:border-amber-400 shadow-xs cursor-pointer flex flex-col justify-between transition group"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="flex items-start gap-3">
              <ToolsIcon className="w-10 h-10 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-amber-950 group-hover:text-amber-800 transition">
                  Инструменты ({toolsList.length})
                </h3>
                <p className="text-[11px] text-amber-900/80 mt-1 leading-relaxed">
                  Плагины для Figma, скрипты Illustrator и утилиты для скачивания в работу.
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-amber-900 mt-3 flex items-center justify-between border-t border-amber-200/60 pt-2">
              <span>Открыть каталог</span>
              <span>→</span>
            </div>
          </div>

          {/* Documents Pillar */}
          <div
            onClick={() => handleOpenDocuments("principles")}
            className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-lg border border-blue-200 hover:border-blue-400 shadow-xs cursor-pointer flex flex-col justify-between transition group"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="flex items-start gap-3">
              <WordDocIcon className="w-10 h-10 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-blue-950 group-hover:text-blue-800 transition">
                  Документы и эссе
                </h3>
                <p className="text-[11px] text-blue-900/80 mt-1 leading-relaxed">
                  Принципы дизайн-инженерии, манифест о ремесле и заметки о типографике.
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-blue-900 mt-3 flex items-center justify-between border-t border-blue-200/60 pt-2">
              <span>Читать в Word</span>
              <span>→</span>
            </div>
          </div>

          {/* Games / Interactive Pillar */}
          <div
            onClick={handleOpenSolitaire}
            className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-lg border border-emerald-200 hover:border-emerald-400 shadow-xs cursor-pointer flex flex-col justify-between transition group"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="flex items-start gap-3">
              <SolitaireIcon className="w-10 h-10 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm text-emerald-950 group-hover:text-emerald-800 transition">
                  Авторская Косынка
                </h3>
                <p className="text-[11px] text-emerald-900/80 mt-1 leading-relaxed">
                  Коллекционная типографическая колода, сенсорная модель и 60 FPS салют.
                </p>
              </div>
            </div>
            <div className="text-[11px] font-bold text-emerald-900 mt-3 flex items-center justify-between border-t border-emerald-200/60 pt-2">
              <span>Сыграть партию</span>
              <span>→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Classic Statusbar */}
      <div className="h-6 px-3 bg-[#ece9d8] border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-700">
        <div className="flex items-center gap-2">
          <span>Готово</span>
          <span className="text-slate-400">|</span>
          <span>Личный компьютер Влада • v2.0</span>
        </div>
        <div className="flex items-center gap-3">
          <span>3 избранных проекта</span>
          <span className="text-slate-400">|</span>
          <span>{toolsList.length} инструмента</span>
        </div>
      </div>
    </div>
  );
}
