"use client";

import React, { useState } from "react";
import { useWindowManager } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

const wallpapers = [
  { id: "bliss", name: "Bliss (Безмятежность)", src: "/images/bliss.jpg" },
  { id: "royale", name: "Energy Blue (Royale)", src: "linear-gradient(135deg, #0b4f8c 0%, #1783cf 50%, #032b57 100%)", isGradient: true },
  { id: "autumn", name: "Autumn (Осень)", src: "linear-gradient(135deg, #7c2d12 0%, #d97706 50%, #451a03 100%)", isGradient: true },
  { id: "classic", name: "Windows Classic 2000", src: "#008080", isColor: true },
  { id: "dark", name: "Luna Dark", src: "#0f172a", isColor: true },
];

export function DisplayPropertiesDialog() {
  const { wallpaper, setWallpaper, closeWindow } = useWindowManager();
  const [selectedWp, setSelectedWp] = useState(wallpaper);

  const handleApply = () => {
    xpSound.click();
    setWallpaper(selectedWp);
  };

  const handleOk = () => {
    xpSound.click();
    setWallpaper(selectedWp);
    closeWindow("display-properties");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] p-4 text-xs select-none">
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-[#9bbfe8] mb-3">
        <div className="px-3 py-1 bg-white border-t border-x border-[#7a9eb5] rounded-t font-bold -mb-[1px] z-10">
          Фоновый рисунок
        </div>
      </div>

      {/* Monitor CRT Preview */}
      <div className="flex justify-center mb-4">
        <div className="w-44 h-32 bg-[#d0d5dd] border-2 border-slate-500 rounded p-1.5 shadow-md flex flex-col items-center">
          <div
            className="w-full h-24 rounded border border-slate-600 overflow-hidden relative"
            style={{
              background: selectedWp.startsWith("/") ? `url(${selectedWp}) center/cover` : selectedWp,
            }}
          />
          <div className="w-10 h-2 bg-slate-400 mt-1 rounded-sm" />
        </div>
      </div>

      {/* Wallpaper Selection Box */}
      <div className="flex-1 flex flex-col mb-3">
        <span className="font-bold text-slate-800 mb-1">Выберите фоновый рисунок:</span>
        <div className="flex-1 bg-white border border-slate-400 rounded p-1 overflow-y-auto max-h-36">
          {wallpapers.map((wp) => (
            <div
              key={wp.id}
              onClick={() => {
                xpSound.click();
                setSelectedWp(wp.src);
              }}
              className={`px-2 py-1 rounded cursor-pointer ${
                selectedWp === wp.src ? "bg-[#316ac5] text-white font-bold" : "hover:bg-slate-100 text-slate-800"
              }`}
              style={{ cursor: xpCursors.pointer }}
            >
              {wp.name}
            </div>
          ))}
        </div>
      </div>

      {/* Buttons: OK, Cancel, Apply */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-300">
        <button
          type="button"
          onClick={handleOk}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs shadow-sm font-semibold"
          style={{ cursor: xpCursors.pointer }}
        >
          ОК
        </button>
        <button
          type="button"
          onClick={() => closeWindow("display-properties")}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs shadow-sm"
          style={{ cursor: xpCursors.pointer }}
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-1 bg-white hover:bg-slate-50 border border-slate-400 rounded text-xs shadow-sm"
          style={{ cursor: xpCursors.pointer }}
        >
          Применить
        </button>
      </div>
    </div>
  );
}
