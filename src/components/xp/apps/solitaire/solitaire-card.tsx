"use client";

import React from "react";
import { motion } from "motion/react";
import { Card, getRankLabel, getSuitColor } from "@/lib/xp/solitaire-deck";
import {
  SuitPip,
  OrnateAceEngraving,
  NumberCardPips,
  CourtCardFigure,
  AtelierCardBack,
  ATELIER_COLORS,
} from "./card-assets";
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

export function SolitaireCard({
  card,
  isSelected = false,
  isHinted = false,
  isDragging = false,
  onClick,
  onDoubleClick,
  className = "",
  style,
}: SolitaireCardProps) {
  const isRed = getSuitColor(card.suit) === "red";
  const rankLabel = getRankLabel(card.rank);
  const textColor = isRed ? ATELIER_COLORS.inkRed : ATELIER_COLORS.inkDark;

  if (!card.isFaceUp) {
    return (
      <div
        onClick={onClick}
        className={`${styles.card} ${styles.back} ${className}`}
        style={{
          boxShadow: isDragging
            ? "0 14px 28px rgba(0,0,0,0.5), 0 6px 10px rgba(0,0,0,0.3)"
            : "0 2px 5px rgba(0,0,0,0.45), 0 1px 2px rgba(0,0,0,0.25)",
          ...style,
        }}
      >
        <AtelierCardBack />
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.12 }}
      className={`${styles.card} ${styles.face} ${
        isSelected
          ? styles.selected
          : isHinted
          ? styles.hinted
          : ""
      } ${className}`}
      style={{
        backgroundColor: ATELIER_COLORS.paper,
        boxShadow: isDragging
          ? "0 16px 32px rgba(0,0,0,0.5), 0 6px 12px rgba(0,0,0,0.3)"
          : isSelected
          ? undefined
          : "0 2px 5px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.2)",
        transformOrigin: "center center",
        ...style,
      }}
    >
      {/* Top Left Corner Index */}
      <div className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 flex flex-col items-center leading-none pointer-events-none z-10">
        <span
          className="font-serif font-black text-xs sm:text-sm md:text-base tracking-tight"
          style={{ color: textColor }}
        >
          {rankLabel}
        </span>
        <SuitPip suit={card.suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
      </div>

      {/* Card Centerpiece Illustration */}
      <div className="flex-1 relative w-full h-full">
        {card.rank === 1 ? (
          <OrnateAceEngraving suit={card.suit} />
        ) : card.rank >= 11 ? (
          <CourtCardFigure rank={card.rank} suit={card.suit} />
        ) : (
          <NumberCardPips rank={card.rank} suit={card.suit} />
        )}
      </div>

      {/* Bottom Right Inverted Corner Index */}
      <div className="absolute bottom-1 right-1 sm:bottom-1.5 sm:right-1.5 flex flex-col items-center leading-none pointer-events-none rotate-180 z-10">
        <span
          className="font-serif font-black text-xs sm:text-sm md:text-base tracking-tight"
          style={{ color: textColor }}
        >
          {rankLabel}
        </span>
        <SuitPip suit={card.suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
      </div>
    </motion.div>
  );
}
