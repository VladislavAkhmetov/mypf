"use client";

import React, { useState } from "react";
import { getProject } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { ProjectFileIcon } from "../xp-icons";
import { xpCursors } from "@/lib/xp/cursors";
import { xpSound } from "@/lib/xp/sound";

export function PropertiesDialog({ slug }: { slug: string }) {
  const { t, tr, locale } = useLocale();
  const { closeWindow, openProject } = useWindowManager();
  const [activeTab, setActiveTab] = useState<"general" | "summary">("general");

  const project = getProject(slug);

  if (!project) {
    return <div className="p-4 text-xs bg-white text-black">{tr("Файл не найден", "File not found")}</div>;
  }

  const tags = project.tags[locale];

  const handleOk = () => {
    xpSound.click();
    closeWindow(`properties-${slug}`);
  };

  const handleApply = () => {
    xpSound.click();
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] p-3 text-xs text-black select-none">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#9bbfe8] mb-3">
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            setActiveTab("general");
          }}
          className={`px-3 py-1 text-xs rounded-t border-t border-x ${
            activeTab === "general"
              ? "bg-white border-[#7a9eb5] font-bold -mb-[1px] z-10 text-slate-900"
              : "bg-[#d8e5f8] border-transparent text-slate-700 hover:bg-[#e4effc]"
          }`}
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Общие", "General")}
        </button>
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            setActiveTab("summary");
          }}
          className={`px-3 py-1 text-xs rounded-t border-t border-x ${
            activeTab === "summary"
              ? "bg-white border-[#7a9eb5] font-bold -mb-[1px] z-10 text-slate-900"
              : "bg-[#d8e5f8] border-transparent text-slate-700 hover:bg-[#e4effc]"
          }`}
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Сводка", "Summary")}
        </button>
      </div>

      {activeTab === "general" ? (
        <div className="flex-1 bg-white border border-slate-400 p-3 overflow-y-auto space-y-3">
          {/* Header with icon and name */}
          <div className="flex items-center gap-3 border-b border-slate-200 pb-2">
            <ProjectFileIcon motif={project.motif} className="w-9 h-9 flex-shrink-0" />
            <div className="flex-1">
              <input
                type="text"
                readOnly
                value={`${project.title}.exe`}
                className="w-full font-bold text-xs bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-slate-900"
              />
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-1.5 text-[11px] text-slate-800">
            <div className="flex">
              <span className="w-28 text-slate-500">{tr("Тип файла:", "Type of file:")}</span>
              <span className="font-semibold text-slate-900">
                {tr("Приложение (.exe) / Дизайн-система", "Application (.exe) / Design system")}
              </span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">{tr("Описание:", "Description:")}</span>
              <span className="text-slate-800">{t(project.kicker)}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">{tr("Размещение:", "Location:")}</span>
              <span className="font-mono text-slate-700">C:\Projects\{project.slug.toUpperCase()}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px] text-slate-800">
            <div className="flex">
              <span className="w-28 text-slate-500">{tr("Размер:", "Size:")}</span>
              <span className="font-semibold">{tr("3,42 МБ (3 586 048 байт)", "3.42 MB (3,586,048 bytes)")}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">{tr("На диске:", "Size on disk:")}</span>
              <span>{tr("3,45 МБ (3 612 672 байт)", "3.45 MB (3,612,672 bytes)")}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px] text-slate-800">
            <div className="flex">
              <span className="w-28 text-slate-500">{tr("Год выпуска:", "Released:")}</span>
              <span>{project.year}{tr(" год", "")}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">{tr("Стиль:", "Style:")}</span>
              <span className="capitalize font-semibold text-blue-700">{project.motif} motif</span>
            </div>
          </div>

          {/* Attributes */}
          <div className="border-t border-slate-200 pt-2 flex items-center gap-4 text-[11px]">
            <span className="w-28 text-slate-500">{tr("Атрибуты:", "Attributes:")}</span>
            <label className="flex items-center gap-1 text-slate-800 cursor-pointer">
              <input type="checkbox" defaultChecked readOnly className="accent-blue-600" />
              <span>{tr("Только чтение", "Read-only")}</span>
            </label>
            <label className="flex items-center gap-1 text-slate-400">
              <input type="checkbox" disabled />
              <span>{tr("Скрытый", "Hidden")}</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-slate-400 p-3 overflow-y-auto space-y-2 text-[11px] text-slate-800">
          <div className="font-bold text-slate-900 mb-1">{tr("Сведения о кейсе:", "About the case:")}</div>
          <div>
            <span className="font-semibold text-slate-700">{tr("Название: ", "Title: ")}</span>
            <span>{project.title}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">{tr("Теги и компетенции: ", "Tags and skills: ")}</span>
            <span className="text-blue-700 font-medium">{tags.join(", ")}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">{tr("Автор: ", "Author: ")}</span>
            <span>{tr("Влад Ахметов (Amazi Studio)", "Vlad Akhmetov (Amazi Studio)")}</span>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                xpSound.click();
                closeWindow(`properties-${slug}`);
                openProject(slug);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold shadow"
              style={{ cursor: xpCursors.pointer }}
            >
              {tr("Запустить проект в Explorer", "Open project in Explorer")}
            </button>
          </div>
        </div>
      )}

      {/* Footer buttons */}
      <div className="flex justify-end gap-2 pt-2.5">
        <button
          type="button"
          onClick={handleOk}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs font-semibold shadow-sm text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("ОК", "OK")}
        </button>
        <button
          type="button"
          onClick={() => closeWindow(`properties-${slug}`)}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs shadow-sm text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Отмена", "Cancel")}
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs shadow-sm text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Применить", "Apply")}
        </button>
      </div>
    </div>
  );
}
