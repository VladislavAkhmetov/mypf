"use client";

import React from "react";
import { DifficultyLevel, GameStatus } from "@/lib/xp/minesweeper-game";
import { MascotFace, MineIcon } from "./pulse-assets";
import styles from "./minesweeper.module.css";

interface MinesweeperHudProps {
  minesLeft: number;
  elapsedSeconds: number;
  status: GameStatus;
  isPressing: boolean;
  currentDifficulty: DifficultyLevel;
  onSelectDifficulty: (level: DifficultyLevel) => void;
  onRestart: () => void;
  onOpenLeaderboard: () => void;
}

const DIFFICULTIES: Array<{ id: DifficultyLevel; label: string; size: string }> = [
  { id: "sprint", label: "Спринт", size: "8×8" },
  { id: "beginner", label: "Новичок", size: "9×9" },
  { id: "intermediate", label: "Любитель", size: "16×16" },
  { id: "expert", label: "Эксперт", size: "16×30" },
];

function formatCounter(value: number) {
  const clamped = Math.max(-99, Math.min(999, value));
  return clamped < 0 ? `-${String(Math.abs(clamped)).padStart(2, "0")}` : String(clamped).padStart(3, "0");
}

function TimerIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 13l3-3"/></svg>;
}

export function MinesweeperHud({
  minesLeft,
  elapsedSeconds,
  status,
  isPressing,
  currentDifficulty,
  onSelectDifficulty,
  onRestart,
  onOpenLeaderboard,
}: MinesweeperHudProps) {
  return (
    <header className={styles.hud}>
      <div className={styles.hudTop}>
        <div className={`${styles.counter} ${styles.mineCount}`}>
          <span className={styles.counterIcon}><MineIcon /></span>
          <span className={styles.counterText}><small>Осталось</small><strong>{formatCounter(minesLeft)}</strong></span>
        </div>

        <button
          className={styles.restart}
          onClick={onRestart}
          title="Новая партия"
          aria-label="Начать новую партию"
          data-ym-goal="minesweeper_restart"
        >
          <MascotFace state={status} isPressing={isPressing} />
        </button>

        <div className={`${styles.counter} ${styles.timer}`}>
          <span className={styles.counterText}><small>Время</small><strong>{formatCounter(elapsedSeconds)}</strong></span>
          <span className={styles.counterIcon}><TimerIcon /></span>
        </div>
      </div>

      <nav className={styles.difficulty} aria-label="Сложность">
        {DIFFICULTIES.map(({ id, label, size }) => (
          <button
            key={id}
            className={currentDifficulty === id ? styles.active : ""}
            onClick={() => onSelectDifficulty(id)}
            aria-pressed={currentDifficulty === id}
            data-ym-goal="minesweeper_difficulty"
            data-ym-params={JSON.stringify({ difficulty: id })}
          >
            <b>{label}</b><small>{size}</small>
          </button>
        ))}
        <button
          type="button"
          onClick={onOpenLeaderboard}
          data-ym-goal="minesweeper_leaderboard_open"
          className={styles.leaderboardBtn}
          title="Таблица рекордов"
        >
          <span>🏆</span>
          <span>Топ</span>
        </button>
      </nav>
    </header>
  );
}
