"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { gameSound } from "@/lib/xp/games/game-sound";
import {
  calculateSolitaireScore,
  isSolitaireHighScore,
  addSolitaireScore,
  getSavedPlayerName,
} from "@/lib/xp/games/leaderboards";

interface SolitaireVictoryProps {
  moveCount: number;
  elapsedSeconds: number;
  onNewGame: () => void;
  onOpenLeaderboard: (recordId?: string) => void;
}

export function SolitaireVictory({
  moveCount,
  elapsedSeconds,
  onNewGame,
  onOpenLeaderboard,
}: SolitaireVictoryProps) {
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  const score = calculateSolitaireScore(moveCount, elapsedSeconds);
  const isEligible = isSolitaireHighScore(score);

  useEffect(() => {
    gameSound.solitaireVictory();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSaveScore = () => {
    if (!playerName.trim()) return;
    const { record } = addSolitaireScore(playerName, score, moveCount, elapsedSeconds);
    setSavedRecordId(record.id);
    onOpenLeaderboard(record.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none"
    >
      <div
        className="relative max-w-md w-full p-6 sm:p-8 rounded-2xl flex flex-col items-center text-center border border-[#d7bb7c] shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
        style={{
          background: "radial-gradient(ellipse at 50% 15%, #5a172c 0%, #260a14 62%, #120509 100%)",
        }}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center border border-[#d7bb7c] bg-[#d7bb7c]/10 shadow-[0_0_25px_rgba(215,187,124,0.35)] mb-3 text-[#f2d999]">
          <svg viewBox="0 0 48 48" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="24" cy="24" r="19" />
            <path d="M15 29h18l2-12-7 5-4-9-4 9-7-5 2 12Z" />
            <path d="M16 33h16" />
          </svg>
        </div>

        <h2 className="font-serif font-bold text-2xl text-[#f2d999] tracking-wide mb-1">
          Партия завершена!
        </h2>
        <p className="text-xs text-[#d8cca8] mb-5">
          Все 52 карты заняли свои места в коллекции Maison.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full mb-5">
          <div className="p-2.5 rounded-lg border border-[#d7bb7c]/30 bg-black/20 flex flex-col items-center">
            <span className="text-[10px] uppercase font-semibold text-[#d7bb7c] tracking-wider">
              Очки
            </span>
            <span className="font-serif font-black text-lg text-[#f2d999] mt-0.5">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-[#d7bb7c]/30 bg-black/20 flex flex-col items-center">
            <span className="text-[10px] uppercase font-semibold text-[#d7bb7c] tracking-wider">
              Ходы
            </span>
            <span className="font-serif font-black text-lg text-[#f2d999] mt-0.5">
              {moveCount}
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-[#d7bb7c]/30 bg-black/20 flex flex-col items-center">
            <span className="text-[10px] uppercase font-semibold text-[#d7bb7c] tracking-wider">
              Время
            </span>
            <span className="font-serif font-black text-lg text-[#f2d999] mt-0.5">
              {formatTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        {/* High Score Submission Prompt */}
        {isEligible && !savedRecordId && (
          <div className="mb-4 p-2.5 rounded-xl bg-[#d7bb7c]/15 border border-[#d7bb7c]/40 w-full flex flex-col gap-2 text-xs">
            <span className="font-serif font-bold text-[#f2d999] text-xs flex items-center justify-center gap-1">
              <span>🏆</span> Новый рекорд! Введите ваше имя:
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-[#d7bb7c]/40 text-[#f2d999] text-xs outline-none focus:border-[#f2d999]"
                placeholder="Имя игрока"
              />
              <button
                type="button"
                onClick={handleSaveScore}
                className="px-4 py-1.5 rounded-lg font-serif font-bold text-xs uppercase tracking-wider text-[#18070d] bg-gradient-to-r from-[#f2d999] to-[#d7bb7c] hover:brightness-110 shadow-xs transition cursor-pointer"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={onNewGame}
            className="w-full py-2.5 rounded-lg font-serif font-bold text-xs tracking-widest uppercase text-[#18070d] bg-gradient-to-r from-[#f2d999] via-[#d7bb7c] to-[#f2d999] hover:brightness-110 shadow-[0_4px_15px_rgba(215,187,124,0.35)] transition cursor-pointer"
          >
            Начать новую партию
          </button>
          <button
            type="button"
            onClick={() => onOpenLeaderboard(savedRecordId || undefined)}
            className="w-full py-2 rounded-lg font-serif font-semibold text-xs tracking-wider text-[#d8cca8] hover:text-[#f2d999] hover:bg-white/5 border border-[#d7bb7c]/30 transition cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>🏆</span>
            <span>Зал славы (Рекорды)</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
