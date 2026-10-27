"use client";

import React, { useRef, useState } from "react";
import { Cell } from "@/lib/xp/minesweeper-game";
import { ART, MEADOW, cellSpriteUrl, digitUrl } from "./pixel-art";
import styles from "./minesweeper.module.css";

export interface CellEdges {
  top: boolean;
  left: boolean;
  right: boolean;
  bottom: boolean;
}

interface MeadowCellProps {
  cell: Cell;
  cellSize: number;
  edges: CellEdges;
  onClick: (event: React.MouseEvent) => void;
  onRightClick: (event: React.MouseEvent) => void;
  onLongPress?: () => void;
  onPointerPressStateChange?: (isPressing: boolean) => void;
  reducedMotion?: boolean;
}

function Sprite({ url }: { url: string }) {
  return <span className={styles.sprite} style={{ backgroundImage: url }} aria-hidden="true" />;
}

export function MeadowCell({
  cell,
  cellSize,
  edges,
  onClick,
  onRightClick,
  onLongPress,
  onPointerPressStateChange,
  reducedMotion = false,
}: MeadowCellProps) {
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
    if (cell.isOpen || event.button === 2) return;
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
    if (Math.hypot(event.clientX - startPosition.current.x, event.clientY - startPosition.current.y) > 8) finishPress();
  };

  const handleClick = (event: React.MouseEvent) => {
    if (consumedLongPress.current) {
      consumedLongPress.current = false;
      event.preventDefault();
      return;
    }
    onClick(event);
  };

  const px = cellSize / ART;
  const label = cell.isOpen
    ? cell.isMine
      ? `Мина, строка ${cell.row + 1}, столбец ${cell.col + 1}`
      : `Открыто: ${cell.neighborMines || "пусто"}`
    : cell.isFlagged
      ? "Установлен флаг"
      : cell.isQuestion
        ? "Помечено вопросом"
        : "Закрытая клетка";

  // Texture continues across cells: offset by the cell's position inside a 4×4-cell tile.
  const style: React.CSSProperties = {
    width: cellSize,
    height: cellSize,
    backgroundPosition: `${-(cell.col % 4) * cellSize}px ${-(cell.row % 4) * cellSize}px`,
  };

  let className = styles.cell;
  let content: React.ReactNode = null;

  if (cell.isOpen) {
    const shadows: string[] = [];
    if (edges.left) shadows.push(`inset ${px}px 0 0 ${MEADOW.soilShadow}`);
    if (edges.right) shadows.push(`inset -${px}px 0 0 ${MEADOW.soilLight}`);
    if (edges.bottom) shadows.push(`inset 0 -${px}px 0 ${MEADOW.soilLight}`);
    if (shadows.length) style.boxShadow = shadows.join(", ");
    if (!reducedMotion) style.animationDelay = `${Math.min(220, (cell.bfsDist ?? 0) * 14)}ms`;
    className += ` ${styles.open} ${edges.top ? styles.fringe : ""} ${cell.isExploded ? styles.exploded : ""} ${reducedMotion ? "" : styles.dig}`;
    if (cell.isMine) content = <Sprite url={cellSpriteUrl("mine")} />;
    else if (cell.neighborMines > 0) {
      className += ` ${styles.openNumber}`;
      content = <Sprite url={digitUrl(cell.neighborMines)} />;
    }
  } else {
    className += ` ${styles.closed} ${isPressing ? styles.pressing : ""}`;
    if (cell.isMisflagged) content = <><Sprite url={cellSpriteUrl("flag")} /><Sprite url={cellSpriteUrl("cross")} /></>;
    else if (cell.isFlagged) content = <Sprite url={cellSpriteUrl("flag")} />;
    else if (cell.isQuestion) content = <Sprite url={cellSpriteUrl("question")} />;
  }

  return (
    <button
      type="button"
      data-cell={`${cell.row},${cell.col}`}
      className={className}
      style={style}
      onClick={handleClick}
      onContextMenu={onRightClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishPress}
      onPointerLeave={isPressing ? finishPress : undefined}
      onPointerCancel={finishPress}
      aria-label={label}
    >
      {content}
    </button>
  );
}
