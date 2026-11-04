"use client";
import React, { useEffect, useRef, useState } from "react";
import { gameSound } from "@/lib/xp/games/game-sound";
import { calculateSolitaireScore, isSolitaireHighScore, addSolitaireScore, getSavedPlayerName } from "@/lib/xp/games/leaderboards";
import { useDialogFocus } from "@/lib/xp/use-dialog-focus";
import styles from "./solitaire-dialog.module.css";
import { DeckMonogram } from "./card-assets";
import { useLocale } from "@/lib/i18n";

export function SolitaireVictory({ moveCount, elapsedSeconds, onNewGame, onOpenLeaderboard }: { moveCount: number; elapsedSeconds: number; onNewGame: () => void; onOpenLeaderboard: (recordId?: string) => void }) {
  const { tr } = useLocale();
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [savedId, setSavedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const score = calculateSolitaireScore(moveCount, elapsedSeconds);

  useDialogFocus(dialogRef, { isOpen: true });

  useEffect(() => { gameSound.solitaireVictory(); }, []);

  return (
    <div ref={dialogRef} className={styles.overlay} role="dialog" aria-modal="true" aria-label={tr("Победа", "Victory")}>
      <section className={`${styles.panel} ${styles.victory}`}>
        <DeckMonogram className={styles.victoryMark} />
        <h2>{tr("Красиво сыграно.", "Nicely played.")}</h2>
        <p>{tr("Все 52 карты на своих местах.", "All 52 cards in place.")}</p>
        <div className={styles.stats}>
          <span><b>{score.toLocaleString()}</b>{tr("очков", "points")}</span>
          <span><b>{moveCount}</b>{tr("ходов", "moves")}</span>
          <span><b>{Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}</b>{tr("время", "time")}</span>
        </div>
        {isSolitaireHighScore(score) && !savedId && (
          <form onSubmit={event => {
            event.preventDefault();
            if (!playerName.trim()) return;
            const { record } = addSolitaireScore(playerName.trim(), score, moveCount, elapsedSeconds);
            setSavedId(record.id);
            onOpenLeaderboard(record.id);
          }}>
            <label htmlFor="solitaire-player">{tr("Сохрани свой результат", "Save your result")}</label>
            <div className={styles.actions}>
              <input
                id="solitaire-player"
                value={playerName}
                onChange={event => setPlayerName(event.target.value)}
                maxLength={18}
                placeholder={tr("Твоё имя", "Your name")}
                required
              />
              <button type="submit">{tr("Сохранить", "Save")}</button>
            </div>
          </form>
        )}
        <div className={styles.actions}>
          <button className={styles.primary} onClick={onNewGame}>{tr("Начать новую партию", "Start a new game")}</button>
          <button onClick={() => onOpenLeaderboard(savedId ?? undefined)}>{tr("Рекорды", "Records")}</button>
        </div>
      </section>
    </div>
  );
}
