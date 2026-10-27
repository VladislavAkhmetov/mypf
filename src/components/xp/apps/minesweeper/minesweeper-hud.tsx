"use client";

import React from "react";
import { DifficultyLevel, GameStatus } from "@/lib/xp/minesweeper-game";
import { gameSound } from "@/lib/xp/games/game-sound";
import { faceUrl, spriteUrl } from "./pixel-art";
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
        <div className={styles.counter}>
          <span className={styles.icon} style={{ backgroundImage: spriteUrl("mine") }} aria-hidden="true" />
          <span className={styles.counterText}>
            <small>Мины</small>
            <strong className={styles.mineCount}>{formatCounter(minesLeft)}</strong>
          </span>
        </div>

        <button
          className={styles.restart}
          onClick={() => {
            gameSound.uiBlip();
            onRestart();
          }}
          title="Новая партия (F2)"
          aria-label="Начать новую партию"
          data-ym-goal="minesweeper_restart"
        >
          <span className={styles.face} style={{ backgroundImage: faceUrl(status, isPressing) }} aria-hidden="true" />
        </button>

        <div className={`${styles.counter} ${styles.counterRight}`}>
          <span className={styles.counterText}>
            <small>Время</small>
            <strong className={styles.timer}>{formatCounter(elapsedSeconds)}</strong>
          </span>
          <span className={styles.icon} style={{ backgroundImage: spriteUrl("clock") }} aria-hidden="true" />
        </div>
      </div>

      <nav className={styles.difficulty} aria-label="Сложность">
        {DIFFICULTIES.map(({ id, label, size }) => (
          <button
            key={id}
            className={currentDifficulty === id ? styles.active : ""}
            onClick={() => {
              gameSound.uiBlip();
              onSelectDifficulty(id);
            }}
            aria-pressed={currentDifficulty === id}
            data-ym-goal="minesweeper_difficulty"
            data-ym-params={JSON.stringify({ difficulty: id })}
          >
            <b>{label}</b>
            <small>{size}</small>
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            gameSound.uiBlip();
            onOpenLeaderboard();
          }}
          data-ym-goal="minesweeper_leaderboard_open"
          className={styles.leaderboardBtn}
          title="Таблица рекордов"
        >
          <span className={styles.icon} style={{ backgroundImage: spriteUrl("trophy") }} aria-hidden="true" />
          <span>Топ</span>
        </button>
      </nav>
    </header>
  );
}
