"use client";
import React, { useRef, useState } from "react";
import { getSolitaireLeaderboard, resetSolitaireLeaderboard } from "@/lib/xp/games/leaderboards";
import { useDialogFocus } from "@/lib/xp/use-dialog-focus";
import styles from "./solitaire-dialog.module.css";
import { useLocale } from "@/lib/i18n";

export function SolitaireLeaderboardModal({ isOpen, highlightRecordId, onClose }: { isOpen: boolean; highlightRecordId?: string; onClose: () => void }) {
  const { tr } = useLocale();
  const [records, setRecords] = useState(() => getSolitaireLeaderboard());
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(dialogRef, { isOpen, onClose });

  if (!isOpen) return null;
  return (
    <div ref={dialogRef} className={styles.overlay} style={{ zIndex: 60 }} role="dialog" aria-modal="true" aria-label={tr("Рекорды косынки", "Solitaire records")}>
      <section className={styles.panel}>
        <header>
          <h2>{tr("Лучшие партии", "Best games")}</h2>
          <button onClick={onClose} aria-label={tr("Закрыть рекорды", "Close records")}>{tr("Закрыть", "Close")}</button>
        </header>
        <p>{tr("Рекорды хранятся в этом браузере.", "Records are kept in this browser.")}</p>
        <div className={styles.tableScroll}>
          <table>
            <thead><tr><th>{tr("Игрок", "Player")}</th><th>{tr("Очки", "Score")}</th><th>{tr("Ходы", "Moves")}</th><th>{tr("Время", "Time")}</th></tr></thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id} className={record.id === highlightRecordId ? styles.highlight : undefined}>
                  <td>{index + 1}. {record.name}{record.isUser ? tr(" · вы", " · you") : ""}</td>
                  <td>{record.score.toLocaleString()}</td>
                  <td>{record.moves}</td>
                  <td>{Math.floor(record.seconds / 60)}:{String(record.seconds % 60).padStart(2, "0")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.actions}>
          <button onClick={() => { if (window.confirm(tr("Сбросить сохранённые рекорды косынки?", "Reset saved solitaire records?"))) { resetSolitaireLeaderboard(); setRecords(getSolitaireLeaderboard()); } }}>{tr("Сбросить рекорды", "Reset records")}</button>
        </div>
      </section>
    </div>
  );
}
