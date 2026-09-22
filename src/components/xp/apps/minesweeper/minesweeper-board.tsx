"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { GameState, chordCell, revealCell, toggleFlagCell } from "@/lib/xp/minesweeper-game";
import { gameSound } from "@/lib/xp/games/game-sound";
import { EffectsCanvas, EffectsCanvasHandle } from "./effects-canvas";
import { PulseCell } from "./pulse-cell";
import styles from "./minesweeper.module.css";

interface MinesweeperBoardProps {
  state: GameState;
  onApplyState: (nextState: GameState) => void;
  onPointerPressStateChange: (isPressing: boolean) => void;
  allowQuestionMarks?: boolean;
  effectsMode?: "full" | "reduced";
}

function ModeIcon({ flag = false }: { flag?: boolean }) {
  return flag
    ? <svg viewBox="0 0 24 24"><path d="M7 21V4m0 1h10l-3 4 3 4H7M4 21h7"/></svg>
    : <svg viewBox="0 0 24 24"><path d="m14 5 5 5M12 7l5 5M6 21l6-6M4 17l3 3 10-10-3-3L4 17Z"/></svg>;
}

export function MinesweeperBoard({
  state,
  onApplyState,
  onPointerPressStateChange,
  allowQuestionMarks = false,
  effectsMode = "full",
}: MinesweeperBoardProps) {
  const [touchMode, setTouchMode] = useState<"reveal" | "flag">("reveal");
  const [zoomScale, setZoomScale] = useState(1);
  const [shakeKey, setShakeKey] = useState(0);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const canvasRef = useRef<EffectsCanvasHandle>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const reducedMotion = effectsMode === "reduced" || systemReducedMotion;
  const cols = state.config.cols;
  const rows = state.config.rows;
  const isLargeBoard = cols >= 16;
  const gap = 4;

  // Track viewport container size to calculate responsive cell size
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const updateSize = () => {
      setViewportSize({
        width: el.clientWidth,
        height: el.clientHeight,
      });
    };
    updateSize();
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setViewportSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Reset zoom scale whenever difficulty changes
  useEffect(() => {
    setZoomScale(1);
  }, [state.difficulty]);

  const baseCellSize = useMemo(() => {
    if (!viewportSize || viewportSize.width <= 0 || viewportSize.height <= 0) {
      return isLargeBoard ? (cols >= 30 ? 28 : 30) : 36;
    }

    // GridFrame has 9px padding and 1px border on each side = 20px total
    // ContentRect of viewport already excludes viewport padding (13px * 2)
    // We deduct 24px for grid frame padding/border and subpixel margin
    const availW = Math.max(0, viewportSize.width - 24);
    const availH = Math.max(0, viewportSize.height - 24);

    const maxWCell = Math.floor((availW - (cols - 1) * gap) / cols);
    const maxHCell = Math.floor((availH - (rows - 1) * gap) / rows);
    const fitCell = Math.min(maxWCell, maxHCell);

    // Upper limit per board configuration
    const maxLimit = cols >= 30 ? 30 : cols >= 16 ? 34 : 40;
    // Lower limit so cell remains playable even on small screens
    const minLimit = 16;

    if (fitCell < minLimit) return minLimit;
    return Math.min(maxLimit, fitCell);
  }, [viewportSize, cols, rows, isLargeBoard]);

  const cellSize = Math.round(baseCellSize * zoomScale);
  const totalGridWidth = cols * cellSize + (cols - 1) * gap + 24;
  const hasOverflow = viewportSize ? totalGridWidth > viewportSize.width : false;

  const openedSafeCells = useMemo(
    () => state.grid.flat().filter((cell) => cell.isOpen && !cell.isMine).length,
    [state.grid],
  );
  const totalSafeCells = state.config.rows * state.config.cols - state.config.mines;
  const progress = totalSafeCells ? Math.round((openedSafeCells / totalSafeCells) * 100) : 0;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    canvasRef.current?.clear();
  }, []);

  const cellCenter = (row: number, col: number) => {
    const cell = gridRef.current?.querySelector(`[data-cell="${row},${col}"]`);
    if (!cell || !gridRef.current) return null;
    const rect = cell.getBoundingClientRect();
    const frame = gridRef.current.getBoundingClientRect();
    return { x: rect.left - frame.left + rect.width / 2, y: rect.top - frame.top + rect.height / 2 };
  };

  const explode = (row: number, col: number) => {
    gameSound.explosion();
    if (reducedMotion) return;
    setShakeKey((key) => key + 1);
    const point = cellCenter(row, col);
    if (point) canvasRef.current?.emitExplosion(point.x, point.y);
  };

  const revealWave = (wave: Array<{ row: number; col: number; dist: number }>) => {
    gameSound.cascadeWave(1);
    if (reducedMotion) return;
    const groups = new Map<number, Array<{ row: number; col: number }>>();
    wave.forEach(({ row, col, dist }) => groups.set(dist, [...(groups.get(dist) ?? []), { row, col }]));
    groups.forEach((cells, distance) => {
      const timer = setTimeout(() => {
        cells.slice(0, 4).forEach(({ row, col }) => {
          const point = cellCenter(row, col);
          if (point) canvasRef.current?.emitWaveRipple(point.x, point.y);
        });
      }, Math.min(260, distance * 14));
      timers.current.push(timer);
    });
  };

  const toggleFlag = (row: number, col: number, event?: React.MouseEvent) => {
    event?.preventDefault();
    const cell = state.grid[row][col];
    if (cell.isOpen || state.status === "lost" || state.status === "won") return;
    gameSound.flagPop();
    const next = toggleFlagCell(state, row, col, allowQuestionMarks);
    if (!cell.isFlagged && !reducedMotion) {
      const point = cellCenter(row, col);
      if (point) canvasRef.current?.emitFlagSparks(point.x, point.y);
    }
    onApplyState(next);
  };

  const openCell = (row: number, col: number) => {
    if (state.status === "lost" || state.status === "won") return;
    if (touchMode === "flag") {
      toggleFlag(row, col);
      return;
    }
    const cell = state.grid[row][col];
    if (cell.isOpen && cell.neighborMines > 0) {
      const next = chordCell(state, row, col);
      if (next === state) return;
      gameSound.chordSound();
      if (next.status === "lost") explode(next.lastEvent?.centerRow ?? row, next.lastEvent?.centerCol ?? col);
      if (next.status === "won") gameSound.minesweeperVictory();
      onApplyState(next);
      return;
    }
    if (cell.isOpen || cell.isFlagged) return;
    gameSound.cellClick();
    const next = revealCell(state, row, col);
    if (next.status === "lost") explode(row, col);
    else if (next.revealedWave && next.revealedWave.length > 1) revealWave(next.revealedWave);
    if (next.status === "won") gameSound.minesweeperVictory();
    onApplyState(next);
  };

  return (
    <div className={styles.board}>
      <div className={styles.progress} title={`Поле очищено на ${progress}%`}><i style={{ width: `${progress}%` }} /></div>
      {isLargeBoard && (
        <div className={styles.zoomBar}>
          <span>
            {cols}×{rows} {hasOverflow ? "· прокручивайте поле" : "· масштаб"}
          </span>
          <div className={styles.zoomButtons}>
            {[1, 0.82, 0.68].map((scale) => (
              <button
                key={scale}
                className={zoomScale === scale ? styles.zoomActive : ""}
                onClick={() => setZoomScale(scale)}
              >
                {Math.round(scale * 100)}%
              </button>
            ))}
          </div>
        </div>
      )}

      <motion.div
        ref={viewportRef}
        className={styles.viewport}
        animate={!reducedMotion && shakeKey ? { x: [0, -3, 3, -2, 1, 0], y: [0, 1, -1, 0] } : undefined}
        transition={{ duration: 0.18 }}
      >
        <div className={styles.gridFrame} ref={gridRef}>
          <EffectsCanvas ref={canvasRef} />
          <div className={styles.grid} style={{ gridTemplateColumns: `repeat(${state.config.cols}, ${cellSize}px)` }} role="grid" aria-label={`Поле сапёра ${state.config.cols} на ${state.config.rows}`}>
            {state.grid.flatMap((row, rowIndex) => row.map((cell, colIndex) => (
              <PulseCell
                key={`${rowIndex}-${colIndex}`}
                cell={cell}
                cellSize={cellSize}
                onClick={() => openCell(rowIndex, colIndex)}
                onRightClick={(event) => toggleFlag(rowIndex, colIndex, event)}
                onLongPress={() => toggleFlag(rowIndex, colIndex)}
                onPointerPressStateChange={onPointerPressStateChange}
                reducedMotion={reducedMotion}
              />
            )))}
          </div>
        </div>
      </motion.div>

      <footer className={styles.controlDock}>
        <span className={styles.modeLabel}>Режим касания</span>
        <div className={styles.modeSwitch}>
          <button className={touchMode === "reveal" ? styles.revealActive : ""} onClick={() => setTouchMode("reveal")} aria-pressed={touchMode === "reveal"}><ModeIcon /><span>Открывать</span></button>
          <button className={touchMode === "flag" ? styles.flagActive : ""} onClick={() => setTouchMode("flag")} aria-pressed={touchMode === "flag"}><ModeIcon flag /><span>Флаг</span></button>
        </div>
        <span className={styles.hint}>ЛКМ — открыть · ПКМ — флаг<br />Число — открыть соседей</span>
      </footer>
    </div>
  );
}
