"use client";

import React from "react";
import Image from "next/image";
import { getAdjacent, getProject } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { Motif } from "@/components/motifs";

export function ProjectExplorerWindow({ slug }: { slug: string }) {
  const { t, locale } = useLocale();
  const { openProject, showBalloon } = useWindowManager();
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
      showBalloon("Ссылка скопирована", `Ссылка на проект «${project.title}» в буфере обмена!`);
    }
  };

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

      {/* Explorer Toolbar */}
      <div className="xp-toolbar">
        <button
          type="button"
          onClick={() => prev && openProject(prev.slug)}
          disabled={!prev}
          className="xp-toolbar-btn"
          title="Назад"
          style={{ cursor: prev ? xpCursors.pointer : "default" }}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-600 grid place-items-center text-white text-xs font-bold shadow-sm">
            ←
          </div>
          <span>Назад</span>
        </button>
        <button
          type="button"
          onClick={() => next && openProject(next.slug)}
          disabled={!next}
          className="xp-toolbar-btn"
          title="Вперед"
          style={{ cursor: next ? xpCursors.pointer : "default" }}
        >
          <div className="w-5 h-5 rounded-full bg-emerald-600 grid place-items-center text-white text-xs font-bold shadow-sm">
            →
          </div>
          <span>Вперед</span>
        </button>
        <div className="xp-toolbar-sep" />
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

      {/* Address Bar */}
      <div className="xp-address-bar">
        <span className="xp-address-label">Адрес</span>
        <div className="xp-address-input-wrap">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#eab308">
            <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
          </svg>
          <span className="text-xs font-mono text-slate-800 flex-1 truncate">
            C:\Projects\{project.slug.toUpperCase()}
          </span>
        </div>
        <button type="button" className="xp-btn-go" onClick={() => xpSound.click()} style={{ cursor: xpCursors.pointer }}>
          <span className="text-emerald-700">Переход</span>
          <span className="text-emerald-700 font-bold">→</span>
        </button>
      </div>

      {/* Body: Left Tasks Pane + Right Main Content */}
      <div className="xp-explorer-body">
        {/* Left Tasks Pane */}
        <div className="xp-tasks-pane hidden sm:flex">
          {/* Group 1: Project Actions */}
          <div className="xp-task-group">
            <div className="xp-task-header">
              <span>Задачи для проекта</span>
              <span className="text-blue-600 font-bold text-xs">▲</span>
            </div>
            <div className="xp-task-content">
              {project.href && (
                <a
                  href={project.href}
                  target="_blank"
                  rel="noreferrer"
                  className="xp-task-link font-bold text-blue-800"
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>🌐</span>
                  <span>Открыть онлайн проект</span>
                </a>
              )}
              <button
                type="button"
                onClick={handleCopyLink}
                className="xp-task-link text-left w-full border-0 bg-transparent p-0"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>🔗</span>
                <span>Скопировать ссылку</span>
              </button>
              {next && (
                <button
                  type="button"
                  onClick={() => openProject(next.slug)}
                  className="xp-task-link text-left w-full border-0 bg-transparent p-0"
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>⏩</span>
                  <span>Следующий: {next.title}</span>
                </button>
              )}
            </div>
          </div>

          {/* Group 2: Project Metadata */}
          <div className="xp-task-group">
            <div className="xp-task-header">
              <span>Сведения</span>
              <span className="text-blue-600 font-bold text-xs">▲</span>
            </div>
            <div className="xp-task-content text-[11px] text-slate-700 space-y-1">
              <div>
                <span className="font-bold text-slate-900">Год: </span>
                <span>{project.year}</span>
              </div>
              <div>
                <span className="font-bold text-slate-900">Теги: </span>
                <span>{tags.join(", ")}</span>
              </div>
              <div>
                <span className="font-bold text-slate-900">Стиль: </span>
                <span className="capitalize">{project.motif}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="xp-explorer-main">
          {/* Top Title Section */}
          <div className="border-b border-slate-200 pb-4 mb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 uppercase tracking-wider mb-1">
              <span>{project.year}</span>
              <span>•</span>
              <span>{t(project.kicker)}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {project.title}
            </h1>
          </div>

          {/* Hero Cover with Motif & Glow */}
          <div
            className="relative w-full h-64 md:h-80 rounded border-2 border-slate-300 overflow-hidden shadow-inner mb-5"
            style={{
              background: `linear-gradient(135deg, ${project.glow[0]} 0%, ${project.glow[1]} 100%)`,
            }}
          >
            <Image
              src={project.cover}
              alt={project.title}
              fill
              className="object-cover mix-blend-overlay opacity-80"
              unoptimized
            />
            <Motif type={project.motif} className="opacity-40" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-xs font-mono uppercase tracking-widest bg-black/50 px-2 py-0.5 rounded border border-white/20">
                {project.motif} motif
              </span>
            </div>
          </div>

          {/* Project Body Description */}
          <div className="bg-slate-50 border border-slate-200 rounded p-4 mb-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">Описание проекта</h3>
            <p className="text-sm md:text-base text-slate-800 leading-relaxed font-normal">
              {t(project.body)}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-xs font-bold text-slate-500">Категории:</span>
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs bg-blue-50 border border-blue-200 text-blue-700 rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-3 pt-2">
            {project.href && (
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold text-xs rounded border border-blue-900 shadow flex items-center gap-2 transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>{project.linkLabel ? t(project.linkLabel) : "Перейти на сайт"}</span>
                <span>↗</span>
              </a>
            )}
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gradient-to-b from-slate-100 to-slate-200 hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded border border-slate-400 shadow-sm flex items-center gap-2 transition"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>Скопировать ссылку</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className="xp-statusbar">
        <span>1 элемент(ов) выбрано</span>
        <span>Размер: 1.42 MB</span>
        <span className="font-semibold text-slate-600">Мой компьютер</span>
      </div>
    </div>
  );
}
