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
import { useLocale } from "@/lib/i18n";

interface MinesweeperLeaderboardModalProps {
  isOpen: boolean;
  initialDifficulty: DifficultyLevel;
  highlightRecordId?: string;
  onClose: () => void;
}

const difficultiesFor = (tr: Tr): Array<{ id: DifficultyLevel; label: string }> => [
  { id: "sprint", label: tr("Спринт", "Sprint") },
  { id: "beginner", label: tr("Новичок", "Beginner") },
  { id: "intermediate", label: tr("Любитель", "Intermediate") },
  { id: "expert", label: tr("Эксперт", "Expert") },
];

type Tr = (ru: string, en: string) => string;

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
  const { tr } = useLocale();
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
      <section className={`${styles.result} ${styles.leaderboard}`} role="dialog" aria-label={tr("Таблица рекордов", "Best times")}>
        <header className={styles.leaderboardHead}>
          <span className={styles.icon} style={{ backgroundImage: spriteUrl("trophy") }} aria-hidden="true" />
          <h3>{tr("Рекорды", "Records")}</h3>
          <button type="button" onClick={onClose} aria-label={tr("Закрыть таблицу рекордов", "Close best times")}>×</button>
        </header>

        <nav className={styles.difficulty} aria-label={tr("Уровень", "Level")}>
          {difficultiesFor(tr).map((d) => (
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
                <th>{tr("Игрок", "Player")}</th>
                <th>{tr("Время", "Time")}</th>
                <th>{tr("Дата", "Date")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec, idx) => (
                <tr key={rec.id} className={rec.id === highlightRecordId || rec.isUser ? styles.highlightRow : ""}>
                  <td className={idx < 3 ? styles[`place${idx + 1}` as "place1"] : ""}>{idx + 1}</td>
                  <td>
                    {rec.name}
                    {rec.isUser && <em> {tr("(вы)", "(you)")}</em>}
                  </td>
                  <td>{formatTime(rec.seconds)}</td>
                  <td>{rec.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.resultActions}>
          <button type="button" onClick={onClose}>{tr("Закрыть", "Close")}</button>
          <button type="button" onClick={handleReset}>{tr("Сбросить", "Reset")}</button>
        </div>
      </section>
    </div>
  );
}
