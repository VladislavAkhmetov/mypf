"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { DIFFICULTY_CONFIGS, DifficultyLevel, GameStatus } from "@/lib/xp/minesweeper-game";
import styles from "./minesweeper.module.css";
import { faceUrl, spriteUrl } from "./pixel-art";

import {
  isMinesweeperHighScore,
  addMinesweeperScore,
  getSavedPlayerName,
} from "@/lib/xp/games/leaderboards";
import { useLocale } from "@/lib/i18n";

interface MinesweeperResultsProps {
  status: GameStatus;
  difficulty: DifficultyLevel;
  elapsedSeconds: number;
  highScore: number | null;
  onRestart: () => void;
  onOpenLeaderboard: (recordId?: string) => void;
}

function ResultIcon({ won }: { won: boolean }) {
  return <span className={styles.resultIcon} style={{ backgroundImage: won ? faceUrl("won", false) : spriteUrl("mine") }} aria-hidden="true" />;
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
  const { tr } = useLocale();
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
    <motion.div className={styles.resultBackdrop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.12, ease: "linear" }}>
      <motion.section
        className={`${styles.result} ${won ? styles.resultWon : styles.resultLost}`}
        initial={{ y: 16 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.16, ease: "linear" }}
      >
        <ResultIcon won={won} />
        <h3>{won ? tr("Поле очищено", "Field cleared") : tr("Бабах!", "Boom!")}</h3>
        <p>{won ? tr(`Уровень «${config.name}» пройден, все мины обойдены.`, `${config.nameEn} cleared, every mine avoided.`) : tr("Под травой оказалась мина. Поле можно рассмотреть и попробовать снова.", "There was a mine under the grass. Look over the field and try again.")}</p>
        <div className={styles.resultStats}>
          <span><small>{tr("Время", "Time")}</small><b>{formatTime(elapsedSeconds)}</b></span>
          <span><small>{tr("Рекорд", "Record")}</small><b>{highScore === null ? "—" : formatTime(highScore)}</b></span>
        </div>

        {isEligible && !savedRecordId && (
          <div className={styles.recordForm}>
            <span>{tr("Новый рекорд! Ваше имя:", "New record! Your name:")}</span>
            <div>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={18}
                placeholder={tr("Имя", "Name")}
                aria-label={tr("Имя для таблицы рекордов", "Name for best times")}
              />
              <button type="button" onClick={handleSaveScore}>OK</button>
            </div>
          </div>
        )}

        <div className={styles.resultActions}>
          <button onClick={onRestart}>{tr("Сыграть ещё раз", "Play again")}</button>
          <button onClick={() => onOpenLeaderboard(savedRecordId || undefined)}>{tr("Рекорды", "Records")}</button>
          <button onClick={() => setDismissed(true)}>{tr("Посмотреть поле", "View the field")}</button>
        </div>
      </motion.section>
    </motion.div>
  );
}
