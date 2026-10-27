"use client";
import React, { useEffect, useRef, useState } from "react";
import { gameSound } from "@/lib/xp/games/game-sound";
import { calculateSolitaireScore, isSolitaireHighScore, addSolitaireScore, getSavedPlayerName } from "@/lib/xp/games/leaderboards";
import { useDialogFocus } from "@/lib/xp/use-dialog-focus";
import styles from "./solitaire-dialog.module.css";

export function SolitaireVictory({ moveCount, elapsedSeconds, onNewGame, onOpenLeaderboard }: { moveCount: number; elapsedSeconds: number; onNewGame: () => void; onOpenLeaderboard: (recordId?: string) => void }) {
  const [playerName, setPlayerName] = useState(() => getSavedPlayerName());
  const [savedId, setSavedId] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const score = calculateSolitaireScore(moveCount, elapsedSeconds);

  useDialogFocus(dialogRef, { isOpen: true });

  useEffect(() => { gameSound.solitaireVictory(); }, []);

  return (
    <div ref={dialogRef} className={styles.overlay} role="dialog" aria-modal="true" aria-label="Победа">
      <section className={`${styles.panel} ${styles.victory}`}>
        <span className={styles.victoryMark} aria-hidden="true">♠</span>
        <h2>Красиво сыграно.</h2>
        <p>Все 52 карты на своих местах.</p>
        <div className={styles.stats}>
          <span><b>{score.toLocaleString()}</b>очков</span>
          <span><b>{moveCount}</b>ходов</span>
          <span><b>{Math.floor(elapsedSeconds / 60)}:{String(elapsedSeconds % 60).padStart(2, "0")}</b>время</span>
        </div>
        {isSolitaireHighScore(score) && !savedId && (
          <form onSubmit={event => {
            event.preventDefault();
            if (!playerName.trim()) return;
            const { record } = addSolitaireScore(playerName.trim(), score, moveCount, elapsedSeconds);
            setSavedId(record.id);
            onOpenLeaderboard(record.id);
          }}>
            <label htmlFor="solitaire-player">Сохрани свой результат</label>
            <div className={styles.actions}>
              <input
                id="solitaire-player"
                value={playerName}
                onChange={event => setPlayerName(event.target.value)}
                maxLength={18}
                placeholder="Твоё имя"
                required
              />
              <button type="submit">Сохранить</button>
            </div>
          </form>
        )}
        <div className={styles.actions}>
          <button className={styles.primary} onClick={onNewGame}>Начать новую партию</button>
          <button onClick={() => onOpenLeaderboard(savedId ?? undefined)}>Рекорды</button>
        </div>
      </section>
    </div>
  );
}
