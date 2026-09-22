"use client";

import React, { useState } from "react";
import { DifficultyLevel } from "@/lib/xp/minesweeper-game";
import {
  getMinesweeperLeaderboard,
  resetMinesweeperLeaderboard,
  MinesweeperRecord,
} from "@/lib/xp/games/leaderboards";

interface MinesweeperLeaderboardModalProps {
  isOpen: boolean;
  initialDifficulty: DifficultyLevel;
  highlightRecordId?: string;
  onClose: () => void;
}

const DIFFICULTIES: Array<{ id: DifficultyLevel; label: string }> = [
  { id: "sprint", label: "Спринт" },
  { id: "beginner", label: "Новичок" },
  { id: "intermediate", label: "Любитель" },
  { id: "expert", label: "Эксперт" },
];

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function MinesweeperLeaderboardModal({
  isOpen,
  initialDifficulty,
  highlightRecordId,
  onClose,
}: MinesweeperLeaderboardModalProps) {
  const [activeDiff, setActiveDiff] = useState<DifficultyLevel>(initialDifficulty);
  const [records, setRecords] = useState<MinesweeperRecord[]>(() =>
    getMinesweeperLeaderboard(initialDifficulty)
  );

  if (!isOpen) return null;

  const handleSelectDiff = (diff: DifficultyLevel) => {
    setActiveDiff(diff);
    setRecords(getMinesweeperLeaderboard(diff));
  };

  const handleReset = () => {
    resetMinesweeperLeaderboard(activeDiff);
    setRecords(getMinesweeperLeaderboard(activeDiff));
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-[#0f172a] border-2 border-[#38bdf8]/60 rounded-xl shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0369a1] via-[#0284c7] to-[#0369a1] px-4 py-2.5 flex items-center justify-between border-b border-[#38bdf8]/30">
          <div className="flex items-center gap-2 text-white font-bold text-sm tracking-wide">
            <span className="text-amber-300 text-base">🏆</span>
            <span>Таблица рекордов · Сапёр Pulse</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center text-white/80 hover:text-white hover:bg-red-500/80 transition text-sm cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Difficulty Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/60 p-1.5 gap-1">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleSelectDiff(d.id)}
              className={`flex-1 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                activeDiff === d.id
                  ? "bg-[#0284c7] text-white shadow-xs"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Table Content */}
        <div className="p-3 flex-1 overflow-y-auto max-h-72">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-[11px] font-medium">
                <th className="py-1.5 px-2 w-10 text-center">#</th>
                <th className="py-1.5 px-2">Игрок</th>
                <th className="py-1.5 px-2 text-right">Время</th>
                <th className="py-1.5 px-2 text-right">Дата</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => {
                const isHighlighted = rec.id === highlightRecordId || rec.isUser;
                const medal =
                  idx === 0 ? "🥇 " : idx === 1 ? "🥈 " : idx === 2 ? "🥉 " : `${idx + 1}.`;

                return (
                  <tr
                    key={rec.id}
                    className={`border-b border-slate-800/60 transition ${
                      isHighlighted
                        ? "bg-amber-500/20 text-amber-200 font-bold"
                        : "text-slate-300 hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-1.5 px-2 text-center font-mono text-[11px]">{medal}</td>
                    <td className="py-1.5 px-2">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate max-w-[140px]">{rec.name}</span>
                        {rec.isUser && (
                          <span className="px-1.5 py-0.2 text-[9px] bg-amber-400/30 text-amber-300 rounded font-normal">
                            Вы
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-right font-mono text-cyan-300">
                      {formatTime(rec.seconds)}
                    </td>
                    <td className="py-1.5 px-2 text-right text-[10px] text-slate-500 font-mono">
                      {rec.date}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer actions */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-400 text-xs border border-slate-700 transition cursor-pointer"
          >
            Сбросить
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
