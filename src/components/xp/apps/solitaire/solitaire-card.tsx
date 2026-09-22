"use client";

import React from "react";
import { Card, getRankLabel, getSuitColor } from "@/lib/xp/solitaire-deck";
import { SuitPip } from "./card-assets";
import styles from "./solitaire-card.module.css";

interface SolitaireCardProps {
  card: Card;
  isSelected?: boolean;
  isHinted?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function CardBack({ className = "" }: { className?: string }) {
  return <div className={`${styles.card} ${styles.back} ${className}`} aria-hidden="true">
    <div className={styles.backMark}>
      <SuitPip suit="spades" color="currentColor" />
      <SuitPip suit="hearts" color="currentColor" />
      <SuitPip suit="clubs" color="currentColor" />
      <SuitPip suit="diamonds" color="currentColor" />
    </div>
  </div>;
}

export function SolitaireCard({ card, isSelected, isHinted, isDragging, onClick, onDoubleClick, className = "", style }: SolitaireCardProps) {
  const label = getRankLabel(card.rank);
  const corner = <><b>{label}</b><SuitPip suit={card.suit} color="currentColor" /></>;
  if (!card.isFaceUp) return <CardBack className={className} />;
  return <div
    data-card-id={card.id}
    className={`${styles.card} ${styles.face} ${getSuitColor(card.suit) === "red" ? styles.red : ""} ${isSelected ? styles.selected : ""} ${isHinted ? styles.hinted : ""} ${isDragging ? styles.dragging : ""} ${className}`}
    style={style} onClick={onClick} onDoubleClick={onDoubleClick}
  >
    <span className={styles.corner}>{corner}</span>
    <div className={styles.center} aria-hidden="true">
      {card.rank > 10 ? <b className={styles.courtRank}>{label}</b> : null}
      <SuitPip suit={card.suit} color="currentColor" />
    </div>
    <span className={`${styles.corner} ${styles.bottom}`}>{corner}</span>
  </div>;
}
