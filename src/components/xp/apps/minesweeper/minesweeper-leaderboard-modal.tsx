"use client";

import React, { useState } from "react";
import { DifficultyLevel } from "@/lib/xp/minesweeper-game";
import {
  getMinesweeperLeaderboard,
  resetMinesweeperLeaderboard,
  MinesweeperRecord,
} from "@/lib/xp/games/leaderboards";
import { spriteUrl } from "./pixel-art";
import styles from "./minesweeper.module.css";

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
    <div className={styles.resultBackdrop}>
      <section className={`${styles.result} ${styles.leaderboard}`} role="dialog" aria-label="Таблица рекордов">
        <header className={styles.leaderboardHead}>
          <span className={styles.icon} style={{ backgroundImage: spriteUrl("trophy") }} aria-hidden="true" />
          <h3>Рекорды</h3>
          <button type="button" onClick={onClose} aria-label="Закрыть таблицу рекордов">×</button>
        </header>

        <nav className={styles.difficulty} aria-label="Уровень">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => handleSelectDiff(d.id)}
              className={activeDiff === d.id ? styles.active : ""}
              aria-pressed={activeDiff === d.id}
            >
              <b>{d.label}</b>
            </button>
          ))}
        </nav>

        <div className={styles.leaderboardTable}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Игрок</th>
                <th>Время</th>
                <th>Дата</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => (
                <tr key={rec.id} className={rec.id === highlightRecordId || rec.isUser ? styles.highlightRow : ""}>
                  <td className={idx < 3 ? styles[`place${idx + 1}` as "place1"] : ""}>{idx + 1}</td>
                  <td>
                    {rec.name}
                    {rec.isUser && <em> (вы)</em>}
                  </td>
                  <td>{formatTime(rec.seconds)}</td>
                  <td>{rec.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.resultActions}>
          <button type="button" onClick={onClose}>Закрыть</button>
          <button type="button" onClick={handleReset}>Сбросить</button>
        </div>
      </section>
    </div>
  );
}
