"use client";

import React, { useState } from "react";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { useWindowManager } from "../window-manager-context";

interface RejectedDecision {
  id: string;
  name: string;
  project: string;
  dateDeleted: string;
  size: string;
  context: string;
  alluring: string;
  whyRejected: string;
  finalSolution: string;
}

const initialRejectedDecisions: RejectedDecision[] = [
  {
    id: "kora-serifs",
    name: "kora_classic_didot_serifs.otf",
    project: "Kora",
    dateDeleted: "14.04.2026",
    size: "420 KB",
    context: "Шрифт для государственного архива и описей фонда",
    alluring: "Академическая строгость, прямая ассоциация с историческими документами XIX века.",
    whyRejected: "Выглядело как музейная стилизация под дореволюционную типографику. Терялась фактура бумажного фонда и специфика советских картонных папок.",
    finalSolution: "Отказ от засечек в пользу авторского гротеска со слоистым срезом штрихов (кора вместо засечек).",
  },
  {
    id: "noclip-mesh",
    name: "noclip_heavy_webgl_mesh.ts",
    project: "Noclip",
    dateDeleted: "19.01.2026",
    size: "2.4 MB",
    context: "Пространственная система навигации по залам музея",
    alluring: "Впечатляющая трехмерная полигональная модель музейного здания с динамическим светом.",
    whyRejected: "Музейные сенсорные терминалы и проекторы работают без перерыва по 12 часов. Тяжелый WebGL приводил к троттлингу GPU и просадкам FPS.",
    finalSolution: "Архитектура на основе легких CSS Matrix проекций: интерфейс работает на уровне системных вызовов со стабильными 60 FPS.",
  },
  {
    id: "signal-splines",
    name: "signalatlas_bezier_splines.geojson",
    project: "Signalatlas",
    dateDeleted: "08.02.2026",
    size: "1.1 MB",
    context: "Картография мертвых зон и интерференции радиосигнала",
    alluring: "Гладкие, мягкие изолинии, как в модных погодных или топографических картах.",
    whyRejected: "Сглаживание сглаживало реальные резкие границы радиопомех от скал и бетона, искажая физику распространения волн.",
    finalSolution: "Дискретная ступенчатая сетка без декоративного сглаживания — строгая фиксация мертвых зон связи.",
  },
  {
    id: "dockyard-pastels",
    name: "dockyard_pastel_subtle_tokens.json",
    project: "Dockyard",
    dateDeleted: "11.11.2025",
    size: "18 KB",
    context: "Дизайн-система портовой логистики и отгрузки контейнеров",
    alluring: "Мягкие, стильные пастельные оттенки современной SaaS-дизайн-системы.",
    whyRejected: "При прямом полуденном солнце в порту и через защитные очки операторов кранов пастельные оттенки становились невидимыми серыми пятнами.",
    finalSolution: "Сверхвысокий контраст, крупные сигнальные люмены (желтый/черный/бирюзовый) и элементы управления под рабочие перчатки.",
  },
];

export function RecycleBinWindow() {
  const { showBalloon } = useWindowManager();
  const [items, setItems] = useState<RejectedDecision[]>(initialRejectedDecisions);
  const [selectedId, setSelectedId] = useState<string>(initialRejectedDecisions[0].id);

  const selectedItem = items.find((i) => i.id === selectedId) || items[0];

  const handleEmpty = () => {
    xpSound.recycle();
    setItems([]);
    showBalloon("Корзина очищена", "Архив отвергнутых решений очищен в текущей сессии.");
  };

  const handleRestore = () => {
    xpSound.restore();
    setItems(initialRejectedDecisions);
    showBalloon("Архив восстановлен", "Все решения возвращены в архив анализа.");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-text text-xs">
      {/* Menu bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item font-bold">Файл</span>
        <span className="xp-menu-item text-slate-500">Правка</span>
        <span className="xp-menu-item text-slate-500">Вид</span>
        <span className="xp-menu-item text-slate-500">Справка</span>
      </div>

      {/* Toolbar */}
      <div className="xp-toolbar flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleEmpty}
            disabled={items.length === 0}
            className="xp-toolbar-btn font-semibold text-red-700"
            style={{ cursor: items.length > 0 ? xpCursors.pointer : "default" }}
          >
            <span>🗑️</span>
            <span>Очистить корзину</span>
          </button>
          {items.length === 0 && (
            <button
              type="button"
              onClick={handleRestore}
              className="xp-toolbar-btn font-semibold text-blue-800"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>↺</span>
              <span>Восстановить архив решений</span>
            </button>
          )}
        </div>

        <div className="text-[11px] text-slate-500 hidden sm:block">
          Архив отбора: реальные инженерные компромиссы и отброшенные варианты
        </div>
      </div>

      {/* Main Container: Table Top, Critique Detail Bottom */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {/* Table of items */}
        <div className="flex-1 overflow-y-auto border-b border-slate-300">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6">
              <span className="text-3xl">🗑️</span>
              <span className="font-semibold text-sm">Корзина пуста</span>
              <button
                type="button"
                onClick={handleRestore}
                className="mt-2 text-blue-700 underline text-xs"
              >
                Вернуть архив решений
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-600 font-bold text-[11px]">
                  <th className="py-2 px-3">Файл решения</th>
                  <th className="py-2 px-3">Проект</th>
                  <th className="py-2 px-3">Дата отсева</th>
                  <th className="py-2 px-3">Вес</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isSelected = item.id === selectedItem?.id;
                  return (
                    <tr
                      key={item.id}
                      onClick={() => {
                        xpSound.click();
                        setSelectedId(item.id);
                      }}
                      className={`border-b border-slate-100 transition ${
                        isSelected ? "bg-blue-100/80 font-semibold text-blue-950" : "hover:bg-slate-50 text-slate-800"
                      }`}
                      style={{ cursor: xpCursors.pointer }}
                    >
                      <td className="py-2 px-3 flex items-center gap-2">
                        <span className="text-sm">📄</span>
                        <span className="font-mono text-[11px]">{item.name}</span>
                      </td>
                      <td className="py-2 px-3 font-semibold text-slate-700">{item.project}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{item.dateDeleted}</td>
                      <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">{item.size}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Selected Decision Anatomy (Разбор отсева) */}
        {selectedItem && items.length > 0 && (
          <div className="p-4 bg-slate-50 overflow-y-auto max-h-56 border-t-2 border-slate-300 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                  АНАТОМИЯ ОТБОРА
                </span>
                <span className="font-bold text-slate-900 text-sm">{selectedItem.project}: {selectedItem.name}</span>
              </div>
              <span className="text-[11px] text-slate-500">{selectedItem.context}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* What was alluring */}
              <div className="p-2.5 bg-white border border-slate-200 rounded space-y-1">
                <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  ✓ Что казалось привлекательным
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {selectedItem.alluring}
                </p>
              </div>

              {/* Why rejected */}
              <div className="p-2.5 bg-red-50/70 border border-red-200 rounded space-y-1">
                <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider">
                  ✕ Почему вариант отвергнут
                </div>
                <p className="text-slate-800 leading-relaxed text-[11px]">
                  {selectedItem.whyRejected}
                </p>
              </div>

              {/* Final decision */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded space-y-1">
                <div className="text-[10px] font-bold text-blue-900 uppercase tracking-wider">
                  → Что изменилось в финале
                </div>
                <p className="text-slate-800 leading-relaxed text-[11px]">
                  {selectedItem.finalSolution}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="xp-statusbar flex items-center justify-between">
        <span>{items.length} отвергнутых гипотез в архиве</span>
        <span className="text-slate-600">Кликните по строке для изучения причин отказа</span>
      </div>
    </div>
  );
}
