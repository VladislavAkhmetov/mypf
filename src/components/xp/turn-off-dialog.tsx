"use client";

import React from "react";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

interface TurnOffDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TurnOffDialog({ isOpen, onClose }: TurnOffDialogProps) {
  if (!isOpen) return null;

  const handleRestart = () => {
    xpSound.startup();
    setTimeout(() => {
      window.location.reload();
    }, 400);
  };

  const handleTurnOff = () => {
    xpSound.click();
    document.body.style.filter = "grayscale(100%) brightness(20%)";
    setTimeout(() => {
      alert("Теперь питание компьютера можно отключить.");
      document.body.style.filter = "";
      onClose();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-[30000] bg-black/40 backdrop-grayscale flex items-center justify-center select-none"
      onClick={onClose}
      style={{ cursor: xpCursors.default }}
    >
      <div
        className="w-80 bg-gradient-to-b from-[#0055ea] via-[#003fb3] to-[#002d80] border-2 border-white rounded-lg shadow-2xl overflow-hidden p-4 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-blue-400 pb-2 mb-4">
          <span className="font-bold text-sm drop-shadow">Выключение компьютера</span>
          <span className="font-bold text-xs text-blue-200">Windows XP</span>
        </div>

        {/* 3 Action Buttons */}
        <div className="flex items-center justify-around py-4">
          {/* Standby */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
            }}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border-2 border-white shadow-md grid place-items-center group-hover:scale-105 transition-transform">
              <span className="text-white text-base">🌙</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-100 group-hover:text-white">
              Ждущий режим
            </span>
          </div>

          {/* Turn Off */}
          <div
            onClick={handleTurnOff}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-red-500 to-red-700 border-2 border-white shadow-md grid place-items-center group-hover:scale-105 transition-transform">
              <span className="text-white text-base">⏻</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-100 group-hover:text-white">
              Выключение
            </span>
          </div>

          {/* Restart */}
          <div
            onClick={handleRestart}
            className="flex flex-col items-center gap-2 cursor-pointer group"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 border-2 border-white shadow-md grid place-items-center group-hover:scale-105 transition-transform">
              <span className="text-white text-base">🔄</span>
            </div>
            <span className="text-[11px] font-semibold text-blue-100 group-hover:text-white">
              Перезагрузка
            </span>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-end pt-3 border-t border-blue-400/40">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs rounded shadow-sm border border-slate-400"
            style={{ cursor: xpCursors.pointer }}
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
