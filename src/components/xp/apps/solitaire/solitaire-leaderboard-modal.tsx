"use client";

import React, { useState } from "react";
import {
  getSolitaireLeaderboard,
  resetSolitaireLeaderboard,
  SolitaireRecord,
} from "@/lib/xp/games/leaderboards";

interface SolitaireLeaderboardModalProps {
  isOpen: boolean;
  highlightRecordId?: string;
  onClose: () => void;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SolitaireLeaderboardModal({
  isOpen,
  highlightRecordId,
  onClose,
}: SolitaireLeaderboardModalProps) {
  const [records, setRecords] = useState<SolitaireRecord[]>(() => getSolitaireLeaderboard());

  if (!isOpen) return null;

  const handleReset = () => {
    resetSolitaireLeaderboard();
    setRecords(getSolitaireLeaderboard());
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-lg rounded-2xl border border-[#d7bb7c] shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col font-serif"
        style={{
          background: "radial-gradient(ellipse at 50% 15%, #441121 0%, #1e070f 65%, #0f0307 100%)",
        }}
      >
        {/* Header */}
        <div className="px-5 py-3 border-b border-[#d7bb7c]/30 flex items-center justify-between bg-black/30">
          <div className="flex items-center gap-2 text-[#f2d999] font-bold text-sm tracking-wider uppercase">
            <span className="text-lg">🏆</span>
            <span>Зал славы · Maison Solitaire</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-[#d8cca8] hover:text-white hover:bg-[#d7bb7c]/20 transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Table Content */}
        <div className="p-4 flex-1 overflow-y-auto max-h-80 font-sans text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d7bb7c]/20 text-[#d7bb7c] text-[11px] font-serif uppercase tracking-wider">
                <th className="py-2 px-2 w-10 text-center">#</th>
                <th className="py-2 px-2">Игрок</th>
                <th className="py-2 px-2 text-right">Очки</th>
                <th className="py-2 px-2 text-right">Ходы</th>
                <th className="py-2 px-2 text-right">Время</th>
                <th className="py-2 px-2 text-right">Дата</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => {
                const isHighlighted = rec.id === highlightRecordId || rec.isUser;
                const medal =
                  idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}.`;

                return (
                  <tr
                    key={rec.id}
                    className={`border-b border-[#d7bb7c]/10 transition ${
                      isHighlighted
                        ? "bg-[#d7bb7c]/20 text-[#fef08a] font-bold"
                        : "text-[#f5e6c8] hover:bg-white/5"
                    }`}
                  >
                    <td className="py-2 px-2 text-center text-xs">{medal}</td>
                    <td className="py-2 px-2">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate max-w-[130px]">{rec.name}</span>
                        {rec.isUser && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-[#d7bb7c]/30 text-[#f2d999] rounded font-normal font-sans">
                            Вы
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-[#f2d999]">
                      {rec.score.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-300">
                      {rec.moves}
                    </td>
                    <td className="py-2 px-2 text-right font-mono text-slate-300">
                      {formatTime(rec.seconds)}
                    </td>
                    <td className="py-2 px-2 text-right text-[10px] text-slate-400 font-mono">
                      {rec.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-black/40 border-t border-[#d7bb7c]/20 flex items-center justify-between font-sans">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-black/40 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-xs border border-white/10 transition cursor-pointer"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 rounded font-serif font-bold text-xs uppercase tracking-wider text-[#18070d] bg-gradient-to-r from-[#f2d999] via-[#d7bb7c] to-[#f2d999] hover:brightness-110 shadow-xs transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
