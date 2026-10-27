"use client";
import React, { useRef, useState } from "react";
import { getSolitaireLeaderboard, resetSolitaireLeaderboard } from "@/lib/xp/games/leaderboards";
import { useDialogFocus } from "@/lib/xp/use-dialog-focus";
import styles from "./solitaire-dialog.module.css";

export function SolitaireLeaderboardModal({ isOpen, highlightRecordId, onClose }: { isOpen: boolean; highlightRecordId?: string; onClose: () => void }) {
  const [records, setRecords] = useState(() => getSolitaireLeaderboard());
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(dialogRef, { isOpen, onClose });

  if (!isOpen) return null;
  return (
    <div ref={dialogRef} className={styles.overlay} style={{ zIndex: 60 }} role="dialog" aria-modal="true" aria-label="Рекорды косынки">
      <section className={styles.panel}>
        <header>
          <h2>Лучшие партии</h2>
          <button onClick={onClose} aria-label="Закрыть рекорды">Закрыть</button>
        </header>
        <p>Рекорды хранятся в этом браузере.</p>
        <div className={styles.tableScroll}>
          <table>
            <thead><tr><th>Игрок</th><th>Очки</th><th>Ходы</th><th>Время</th></tr></thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.id} className={record.id === highlightRecordId ? styles.highlight : undefined}>
                  <td>{index + 1}. {record.name}{record.isUser ? " · вы" : ""}</td>
                  <td>{record.score.toLocaleString()}</td>
                  <td>{record.moves}</td>
                  <td>{Math.floor(record.seconds / 60)}:{String(record.seconds % 60).padStart(2, "0")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={styles.actions}>
          <button onClick={() => { if (window.confirm("Сбросить сохранённые рекорды косынки?")) { resetSolitaireLeaderboard(); setRecords(getSolitaireLeaderboard()); } }}>Сбросить рекорды</button>
        </div>
      </section>
    </div>
  );
}
