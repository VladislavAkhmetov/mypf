"use client";

import React, { useState } from "react";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { useWindowManager } from "../window-manager-context";

interface DeletedItem {
  name: string;
  originalLoc: string;
  dateDeleted: string;
  size: string;
}

const initialItems: DeletedItem[] = [
  { name: "concept_final_v14_real_final.psd", originalLoc: "C:\\Design", dateDeleted: "12.09.2026", size: "348 MB" },
  { name: "boring_corporate_template.pptx", originalLoc: "C:\\Work", dateDeleted: "10.09.2026", size: "12 MB" },
  { name: "unnecessary_sync_call.mp3", originalLoc: "C:\\Meetings", dateDeleted: "08.09.2026", size: "45 MB" },
  { name: "cookie_banner_v3.jsx", originalLoc: "C:\\Frontend", dateDeleted: "04.09.2026", size: "4 KB" },
];

export function RecycleBinWindow() {
  const { showBalloon } = useWindowManager();
  const [items, setItems] = useState<DeletedItem[]>(initialItems);

  const handleEmpty = () => {
    xpSound.recycle();
    setItems([]);
    showBalloon("Корзина очищена", "Все временные файлы и черновики успешно удалены.");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-black overflow-hidden select-none text-xs">
      {/* Menu bar */}
      <div className="xp-menu-bar">
        <span className="xp-menu-item">Файл</span>
        <span className="xp-menu-item">Правка</span>
        <span className="xp-menu-item">Вид</span>
        <span className="xp-menu-item">Справка</span>
      </div>

      {/* Toolbar */}
      <div className="xp-toolbar">
        <button
          type="button"
          onClick={handleEmpty}
          disabled={items.length === 0}
          className="xp-toolbar-btn font-bold text-red-700"
          style={{ cursor: items.length > 0 ? xpCursors.pointer : "default" }}
        >
          <span>🗑️</span>
          <span>Очистить корзину</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="flex-1 bg-white p-2 overflow-y-auto">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 font-semibold">
            Корзина пуста
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 font-semibold">
                <th className="py-1 px-2">Имя</th>
                <th className="py-1 px-2">Исходное размещение</th>
                <th className="py-1 px-2">Дата удаления</th>
                <th className="py-1 px-2">Размер</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.name} className="hover:bg-blue-50 border-b border-slate-100">
                  <td className="py-1.5 px-2 font-medium flex items-center gap-1.5">
                    <span>📄</span>
                    <span className="truncate">{item.name}</span>
                  </td>
                  <td className="py-1.5 px-2 text-slate-500">{item.originalLoc}</td>
                  <td className="py-1.5 px-2 text-slate-500">{item.dateDeleted}</td>
                  <td className="py-1.5 px-2 text-slate-500">{item.size}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status bar */}
      <div className="xp-statusbar">
        <span>{items.length} объект(ов)</span>
        <span>Корзина</span>
      </div>
    </div>
  );
}
