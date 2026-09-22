"use client";

import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { Cell } from "@/lib/xp/minesweeper-game";
import { FlagIcon, MineIcon, MisflaggedIcon, NUMBER_COLORS } from "./pulse-assets";
import styles from "./minesweeper.module.css";

interface PulseCellProps {
  cell: Cell;
  cellSize?: number;
  onClick: (event: React.MouseEvent) => void;
  onRightClick: (event: React.MouseEvent) => void;
  onLongPress?: () => void;
  onPointerPressStateChange?: (isPressing: boolean) => void;
  reducedMotion?: boolean;
}

export function PulseCell({
  cell,
  cellSize = 36,
  onClick,
  onRightClick,
  onLongPress,
  onPointerPressStateChange,
  reducedMotion = false,
}: PulseCellProps) {
  const [isPressing, setIsPressing] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const consumedLongPress = useRef(false);

  const finishPress = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
    startPosition.current = null;
    setIsPressing(false);
    onPointerPressStateChange?.(false);
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    if (cell.isOpen) return;
    consumedLongPress.current = false;
    setIsPressing(true);
    onPointerPressStateChange?.(true);
    startPosition.current = { x: event.clientX, y: event.clientY };
    if (onLongPress && event.pointerType !== "mouse") {
      longPressTimer.current = setTimeout(() => {
        consumedLongPress.current = true;
        onLongPress();
        finishPress();
      }, 360);
    }
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!startPosition.current || !longPressTimer.current) return;
    const distance = Math.hypot(event.clientX - startPosition.current.x, event.clientY - startPosition.current.y);
    if (distance > 8) finishPress();
  };

  const handleClick = (event: React.MouseEvent) => {
    if (consumedLongPress.current) {
      consumedLongPress.current = false;
      event.preventDefault();
      return;
    }
    onClick(event);
  };

  const iconSize = Math.max(12, Math.min(20, Math.round(cellSize * 0.6)));
  const fontSize = Math.max(10, Math.min(16, Math.round(cellSize * 0.52)));

  const toneClass = (cell.row + cell.col) % 3 === 1 ? styles.tone1 : (cell.row + cell.col) % 3 === 2 ? styles.tone2 : "";
  const label = cell.isOpen
    ? cell.isMine ? `Мина, строка ${cell.row + 1}, столбец ${cell.col + 1}` : `Открыто: ${cell.neighborMines || "пусто"}`
    : cell.isFlagged ? "Установлен флаг" : cell.isQuestion ? "Помечено вопросом" : "Закрытая клетка";

  if (cell.isOpen) {
    const className = `${styles.cell} ${styles.open} ${cell.neighborMines ? styles.openNumber : ""} ${cell.isExploded ? styles.exploded : ""}`;
    return (
      <motion.button
        type="button"
        data-cell={`${cell.row},${cell.col}`}
        className={className}
        style={{ width: cellSize, height: cellSize }}
        onClick={handleClick}
        onContextMenu={onRightClick}
        initial={false}
        animate={reducedMotion ? undefined : { scale: [0.72, 1.06, 1] }}
        transition={{ duration: .22, delay: Math.min(.22, (cell.bfsDist ?? 0) * .014) }}
        aria-label={label}
      >
        {cell.isMine ? (
          <MineIcon isExploded={cell.isExploded} className="flex-shrink-0" style={{ width: iconSize, height: iconSize }} />
        ) : cell.neighborMines > 0 ? (
          <span className={styles.number} style={{ color: NUMBER_COLORS[cell.neighborMines], fontSize }}>{cell.neighborMines}</span>
        ) : null}
      </motion.button>
    );
  }

  return (
    <button
      type="button"
      data-cell={`${cell.row},${cell.col}`}
      className={`${styles.cell} ${styles.closed} ${toneClass} ${isPressing ? styles.pressing : ""} ${cell.isFlagged ? styles.flagged : ""}`}
      style={{ width: cellSize, height: cellSize }}
      onClick={handleClick}
      onContextMenu={onRightClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPress}
      onPointerCancel={finishPress}
      aria-label={label}
    >
      {cell.isMisflagged ? (
        <MisflaggedIcon className="flex-shrink-0" style={{ width: iconSize, height: iconSize }} />
      ) : cell.isFlagged ? (
        <FlagIcon className="flex-shrink-0" style={{ width: iconSize, height: iconSize }} />
      ) : cell.isQuestion ? (
        <span className={styles.question} style={{ fontSize: fontSize + 1 }}>?</span>
      ) : null}
    </button>
  );
}
