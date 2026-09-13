"use client";

import React, { useState } from "react";
import { getProject } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "../window-manager-context";
import { ProjectFileIcon } from "../xp-icons";
import { xpCursors } from "@/lib/xp/cursors";
import { xpSound } from "@/lib/xp/sound";

export function PropertiesDialog({ slug }: { slug: string }) {
  const { t, locale } = useLocale();
  const { closeWindow, openProject } = useWindowManager();
  const [activeTab, setActiveTab] = useState<"general" | "summary">("general");

  const project = getProject(slug);

  if (!project) {
    return <div className="p-4 text-xs bg-white text-black">Файл не найден</div>;
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
          Общие
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
          Сводка
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
              <span className="w-28 text-slate-500">Тип файла:</span>
              <span className="font-semibold text-slate-900">
                Приложение (.exe) / Дизайн-система
              </span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Описание:</span>
              <span className="text-slate-800">{t(project.kicker)}</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Размещение:</span>
              <span className="font-mono text-slate-700">C:\Projects\{project.slug.toUpperCase()}</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px] text-slate-800">
            <div className="flex">
              <span className="w-28 text-slate-500">Размер:</span>
              <span className="font-semibold">3,42 МБ (3 586 048 байт)</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">На диске:</span>
              <span>3,45 МБ (3 612 672 байт)</span>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-2 space-y-1 text-[11px] text-slate-800">
            <div className="flex">
              <span className="w-28 text-slate-500">Год выпуска:</span>
              <span>{project.year} год</span>
            </div>
            <div className="flex">
              <span className="w-28 text-slate-500">Стиль:</span>
              <span className="capitalize font-semibold text-blue-700">{project.motif} motif</span>
            </div>
          </div>

          {/* Attributes */}
          <div className="border-t border-slate-200 pt-2 flex items-center gap-4 text-[11px]">
            <span className="w-28 text-slate-500">Атрибуты:</span>
            <label className="flex items-center gap-1 text-slate-800 cursor-pointer">
              <input type="checkbox" defaultChecked readOnly className="accent-blue-600" />
              <span>Только чтение</span>
            </label>
            <label className="flex items-center gap-1 text-slate-400">
              <input type="checkbox" disabled />
              <span>Скрытый</span>
            </label>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-white border border-slate-400 p-3 overflow-y-auto space-y-2 text-[11px] text-slate-800">
          <div className="font-bold text-slate-900 mb-1">Сведения о кейсе:</div>
          <div>
            <span className="font-semibold text-slate-700">Название: </span>
            <span>{project.title}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Теги и компетенции: </span>
            <span className="text-blue-700 font-medium">{tags.join(", ")}</span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">Автор: </span>
            <span>Влад Ахметов (Amazi Studio)</span>
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
              Запустить проект в Explorer
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
          ОК
        </button>
        <button
          type="button"
          onClick={() => closeWindow(`properties-${slug}`)}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs shadow-sm text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs shadow-sm text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          Применить
        </button>
      </div>
    </div>
  );
}
