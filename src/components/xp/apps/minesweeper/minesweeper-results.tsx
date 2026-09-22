"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { DIFFICULTY_CONFIGS, DifficultyLevel, GameStatus } from "@/lib/xp/minesweeper-game";
import styles from "./minesweeper.module.css";

import {
  isMinesweeperHighScore,
  addMinesweeperScore,
  getSavedPlayerName,
} from "@/lib/xp/games/leaderboards";

interface MinesweeperResultsProps {
  status: GameStatus;
  difficulty: DifficultyLevel;
  elapsedSeconds: number;
  highScore: number | null;
  onRestart: () => void;
  onOpenLeaderboard: (recordId?: string) => void;
}

function ResultIcon({ won }: { won: boolean }) {
  return won ? (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m10 25 9 9 19-21"/><path d="M39 25a15 15 0 1 1-8-13"/></svg>
  ) : (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="24" cy="25" r="11" fill="currentColor"/><path d="M24 5v7M24 38v5M4 25h8M36 25h8M10 11l6 6M38 11l-6 6M10 39l6-6M38 39l-6-6"/><path d="m29 10 5-5"/><circle cx="34" cy="5" r="2" fill="currentColor"/></svg>
  );
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MinesweeperResults({
  status,
  difficulty,
  elapsedSeconds,
  highScore,
  onRestart,
  onOpenLeaderboard,
}: MinesweeperResultsProps) {
  const [dismissed, setDismissed] = useState(false);
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  if ((status !== "won" && status !== "lost") || dismissed) return null;
  const won = status === "won";
  const config = DIFFICULTY_CONFIGS[difficulty];
  const isEligible = won && isMinesweeperHighScore(difficulty, elapsedSeconds);

  const handleSaveScore = () => {
    if (!playerName.trim()) return;
    const { record } = addMinesweeperScore(difficulty, playerName, elapsedSeconds);
    setSavedRecordId(record.id);
    onOpenLeaderboard(record.id);
  };

  return (
    <motion.div className={styles.resultBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.section
        className={styles.result}
        style={{ "--result-color": won ? "#c8fa63" : "#ff6b63" } as React.CSSProperties}
        initial={{ scale: 0.88, y: 18 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 360, damping: 25 }}
      >
        <div className={styles.resultIcon}><ResultIcon won={won} /></div>
        <h3>{won ? "Поле очищено" : "Импульс потерян"}</h3>
        <p>{won ? `Все безопасные клетки уровня «${config.name}» открыты.` : "Одна мина оказалась быстрее. Поле осталось доступно для разбора."}</p>
        <div className={styles.resultStats}>
          <span><small>Время</small><b>{formatTime(elapsedSeconds)}</b></span>
          <span><small>Рекорд</small><b>{highScore === null ? "—" : formatTime(highScore)}</b></span>
        </div>

        {/* High Score Submission Prompt */}
        {isEligible && !savedRecordId && (
          <div className="my-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 w-full flex flex-col gap-1.5 text-xs">
            <span className="font-bold text-amber-300 text-[11px] flex items-center justify-center gap-1">
              <span>🎉</span> Новый рекорд! Введите имя:
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                className="flex-1 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-amber-400"
                placeholder="Ваш никнейм"
              />
              <button
                type="button"
                onClick={handleSaveScore}
                className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}

        <div className={styles.resultActions}>
          <button onClick={onRestart}>Сыграть ещё раз</button>
          <button onClick={() => onOpenLeaderboard(savedRecordId || undefined)} className="flex items-center justify-center gap-1">
            <span>🏆</span> Рекорды
          </button>
          <button onClick={() => setDismissed(true)}>Посмотреть поле</button>
        </div>
      </motion.section>
    </motion.div>
  );
}
