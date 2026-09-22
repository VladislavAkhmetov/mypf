"use client";
import React, { useState } from "react";
import { createDeck, getRankNameRu, getSuitNameRu } from "@/lib/xp/solitaire-deck";
import { CardBack, SolitaireCard } from "./solitaire-card";
import styles from "./solitaire-dialog.module.css";

export function DeckGalleryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [back, setBack] = useState(false);
  const deck = createDeck().map(card => ({ ...card, isFaceUp: true }));
  const selected = deck.find(card => card.id === selectedId);
  if (!isOpen) return null;
  return <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="Коллекция карт">
    <section className={`${styles.panel} ${styles.gallery}`}>
      <header><h2>Одна колода. 52 карты.</h2><button onClick={onClose}>Вернуться к игре</button></header>
      <p>Выбери карту, чтобы рассмотреть её поближе.</p>
      <div className={styles.cardGrid}>{deck.map(card => <button key={card.id} data-testid="gallery-card" aria-label={`${getRankNameRu(card.rank)}, ${getSuitNameRu(card.suit)}`} onClick={() => { setSelectedId(card.id); setBack(false); }}><SolitaireCard card={card} /></button>)}</div>
      {selected && <div className={styles.inspector}>
        <div className={styles.largeCard}>{back ? <CardBack /> : <SolitaireCard card={selected} />}</div>
        <div className={styles.actions}>
          <button onClick={() => setBack(!back)}>{back ? "Показать лицевую сторону" : "Показать рубашку"}</button>
          <button aria-label="Закрыть просмотр карты" onClick={() => setSelectedId(null)}>Закрыть</button>
        </div>
      </div>}
    </section>
  </div>;
}
