"use client";

import React from "react";
import { Card, getRankLabel, getSuitColor } from "@/lib/xp/solitaire-deck";
import { CardArt, SuitPip, patternFor } from "./card-assets";
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
  return <div className={`${styles.card} ${styles.back} ${className}`} style={{ backgroundImage: patternFor("back") }} aria-hidden="true" />;
}

export function SolitaireCard({ card, isSelected, isHinted, isDragging, onClick, onDoubleClick, className = "", style }: SolitaireCardProps) {
  if (!card.isFaceUp) return <CardBack className={className} />;
  const label = getRankLabel(card.rank);
  const red = getSuitColor(card.suit) === "red";
  const index = (
    <>
      <b>{label}</b>
      <SuitPip suit={card.suit} />
    </>
  );
  return (
    <div
      data-card-id={card.id}
      className={`${styles.card} ${styles.face} ${red ? styles.red : styles.black} ${isSelected ? styles.selected : ""} ${isHinted ? styles.hinted : ""} ${isDragging ? styles.dragging : ""} ${className}`}
      style={{ backgroundImage: patternFor(red ? "red" : "black"), ...style }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <CardArt rank={card.rank} suit={card.suit} />
      <span className={styles.index}>{index}</span>
      <span className={`${styles.index} ${styles.indexBottom}`}>{index}</span>
    </div>
  );
}
