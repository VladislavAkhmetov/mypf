"use client";
import React, { useRef, useState } from "react";
import { createDeck, getRankName, getSuitName } from "@/lib/xp/solitaire-deck";
import { useDialogFocus } from "@/lib/xp/use-dialog-focus";
import { CardBack, SolitaireCard } from "./solitaire-card";
import styles from "./solitaire-dialog.module.css";
import { useLocale } from "@/lib/i18n";

export function DeckGalleryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { tr, locale } = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [back, setBack] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useDialogFocus(dialogRef, {
    isOpen,
    onClose: selectedId ? () => setSelectedId(null) : onClose,
  });

  const deck = createDeck().map(card => ({ ...card, isFaceUp: true }));
  const selected = deck.find(card => card.id === selectedId);
  if (!isOpen) return null;

  return (
    <div ref={dialogRef} className={styles.overlay} role="dialog" aria-modal="true" aria-label={tr("Коллекция карт", "Card collection")}>
      <section className={`${styles.panel} ${styles.gallery}`}>
        <header>
          <h2>{tr("Одна колода. 52 карты.", "One deck. 52 cards.")}</h2>
          <button onClick={onClose} aria-label={tr("Вернуться к игре", "Back to the game")}>{tr("Вернуться к игре", "Back to the game")}</button>
        </header>
        <p>{tr("Выбери карту, чтобы рассмотреть её поближе.", "Pick a card to take a closer look.")}</p>
        <div className={styles.cardGrid}>
          {deck.map(card => (
            <button
              key={card.id}
              data-testid="gallery-card"
              aria-label={`${getRankName(card.rank, locale)}, ${getSuitName(card.suit, locale)}`}
              onClick={() => { setSelectedId(card.id); setBack(false); }}
            >
              <SolitaireCard card={card} />
            </button>
          ))}
        </div>
        {selected && (
          <div className={styles.inspector}>
            <div className={styles.largeCard}>{back ? <CardBack /> : <SolitaireCard card={selected} />}</div>
            <div className={styles.actions}>
              <button onClick={() => setBack(!back)}>{back ? tr("Показать лицевую сторону", "Show the face") : tr("Показать рубашку", "Show the back")}</button>
              <button aria-label={tr("Закрыть просмотр карты", "Close card view")} onClick={() => setSelectedId(null)}>{tr("Закрыть", "Close")}</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
