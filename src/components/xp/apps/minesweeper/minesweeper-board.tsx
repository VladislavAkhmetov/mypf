"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { GameState, chordCell, revealCell, toggleFlagCell } from "@/lib/xp/minesweeper-game";
import { gameSound } from "@/lib/xp/games/game-sound";
import { EffectsCanvas, EffectsCanvasHandle } from "./effects-canvas";
import { MeadowCell, type CellEdges } from "./meadow-cell";
import { ART, fringeTexture, grassTexture, hedgeTexture, soilTexture, spriteUrl } from "./pixel-art";
import styles from "./minesweeper.module.css";

interface MinesweeperBoardProps {
  state: GameState;
  onApplyState: (nextState: GameState) => void;
  onPointerPressStateChange: (isPressing: boolean) => void;
  allowQuestionMarks?: boolean;
  effectsMode?: "full" | "reduced";
}

const ZOOM_STEPS = [1, 0.82, 0.68];

/** Snap to whole art pixels so every sprite pixel has the same on-screen size. */
function snapCell(size: number) {
  return Math.max(ART * 2, Math.floor(size / ART) * ART);
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
  const [prevDifficulty, setPrevDifficulty] = useState(state.difficulty);
  if (state.difficulty !== prevDifficulty) {
    setPrevDifficulty(state.difficulty);
    setZoomScale(1);
  }
  const [shakeKey, setShakeKey] = useState(0);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const canvasRef = useRef<EffectsCanvasHandle>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState<{ width: number; height: number } | null>(null);
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const reducedMotion = effectsMode === "reduced" || systemReducedMotion;
  const { cols, rows } = state.config;
  const isLargeBoard = cols >= 16;

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setViewportSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const baseCellSize = useMemo(() => {
    if (!viewportSize || viewportSize.width <= 0 || viewportSize.height <= 0) return isLargeBoard ? 30 : 40;
    // The hedge frame is half a cell thick on each side: one extra cell per axis.
    const fit = Math.min((viewportSize.width - 24) / (cols + 1), (viewportSize.height - 24) / (rows + 1));
    const maxLimit = cols >= 30 ? 30 : cols >= 16 ? 40 : 50;
    return Math.min(maxLimit, snapCell(fit));
  }, [viewportSize, cols, rows, isLargeBoard]);

  const cellSize = zoomScale === 1 ? baseCellSize : snapCell(baseCellSize * zoomScale);
  const pixel = cellSize / ART;
  const framePad = cellSize / 2;
  const totalGridWidth = cols * cellSize + framePad * 2;
  const hasOverflow = viewportSize ? totalGridWidth > viewportSize.width - 24 : false;

  const textures = useMemo(
    () =>
      ({
        "--tex-grass": grassTexture(),
        "--tex-soil": soilTexture(),
        "--tex-fringe": fringeTexture(),
        "--tex-hedge": hedgeTexture(),
        "--sprite-brackets": spriteUrl("brackets"),
      }) as React.CSSProperties,
    [],
  );

  const openedSafeCells = useMemo(() => state.grid.flat().filter(cell => cell.isOpen && !cell.isMine).length, [state.grid]);
  const totalSafeCells = rows * cols - state.config.mines;
  const progress = totalSafeCells ? Math.round((openedSafeCells / totalSafeCells) * 100) : 0;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout);
      canvasRef.current?.clear();
    },
    [],
  );

  const isClosed = (row: number, col: number) => {
    const cell = state.grid[row]?.[col];
    return Boolean(cell && !cell.isOpen);
  };

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
    setShakeKey(key => key + 1);
    const point = cellCenter(row, col);
    if (point) canvasRef.current?.emitExplosion(point.x, point.y);
  };

  const celebrate = () => {
    gameSound.minesweeperVictory();
    if (reducedMotion || !gridRef.current) return;
    const { width, height } = gridRef.current.getBoundingClientRect();
    canvasRef.current?.emitVictoryBurst(width / 2, height / 2);
  };

  const revealWave = (wave: Array<{ row: number; col: number; dist: number }>) => {
    gameSound.cascadeWave(Math.max(...wave.map(cell => cell.dist)));
    if (reducedMotion) return;
    const groups = new Map<number, Array<{ row: number; col: number }>>();
    wave.forEach(({ row, col, dist }) => groups.set(dist, [...(groups.get(dist) ?? []), { row, col }]));
    groups.forEach((cells, distance) => {
      const timer = setTimeout(() => {
        cells.slice(0, 3).forEach(({ row, col }) => {
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
    if (cell.isFlagged) gameSound.flagRemove();
    else gameSound.flagPop();
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
      if (next.status === "won") celebrate();
      onApplyState(next);
      return;
    }
    if (cell.isOpen || cell.isFlagged) return;
    const next = revealCell(state, row, col);
    if (next.status === "lost") explode(row, col);
    else if (next.revealedWave && next.revealedWave.length > 1) revealWave(next.revealedWave);
    else gameSound.cellClick();
    if (next.status === "won") celebrate();
    onApplyState(next);
  };

  const selectMode = (mode: "reveal" | "flag") => {
    gameSound.uiBlip();
    setTouchMode(mode);
  };

  return (
    <div className={styles.board} style={{ "--px": `${pixel}px` } as React.CSSProperties}>
      <div className={styles.progress} title={`Поле очищено на ${progress}%`} aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </div>
      {isLargeBoard && (
        <div className={styles.zoomBar}>
          <span>
            {cols}×{rows} {hasOverflow ? "· листайте поле" : "· масштаб"}
          </span>
          <div className={styles.zoomButtons}>
            {ZOOM_STEPS.map(scale => (
              <button
                key={scale}
                className={zoomScale === scale ? styles.zoomActive : ""}
                onClick={() => {
                  gameSound.uiBlip();
                  setZoomScale(scale);
                }}
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
        animate={!reducedMotion && shakeKey ? { x: [0, -pixel * 2, pixel * 2, -pixel, pixel, 0] } : undefined}
        transition={{ duration: 0.22, ease: "linear" }}
      >
        <div className={styles.gridFrame} ref={gridRef} style={{ ...textures, padding: framePad }}>
          <EffectsCanvas ref={canvasRef} pixel={pixel} />
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`, "--cell": `${cellSize}px` } as React.CSSProperties}
            role="grid"
            aria-label={`Поле сапёра ${cols} на ${rows}`}
          >
            {state.grid.flatMap((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const edges: CellEdges = {
                  top: rowIndex > 0 && isClosed(rowIndex - 1, colIndex),
                  left: colIndex > 0 && isClosed(rowIndex, colIndex - 1),
                  right: colIndex < cols - 1 && isClosed(rowIndex, colIndex + 1),
                  bottom: rowIndex < rows - 1 && isClosed(rowIndex + 1, colIndex),
                };
                return (
                  <MeadowCell
                    key={`${rowIndex}-${colIndex}`}
                    cell={cell}
                    cellSize={cellSize}
                    edges={edges}
                    onClick={() => openCell(rowIndex, colIndex)}
                    onRightClick={event => toggleFlag(rowIndex, colIndex, event)}
                    onLongPress={() => toggleFlag(rowIndex, colIndex)}
                    onPointerPressStateChange={onPointerPressStateChange}
                    reducedMotion={reducedMotion}
                  />
                );
              }),
            )}
          </div>
        </div>
      </motion.div>

      <footer className={styles.controlDock}>
        <div className={styles.modeSwitch} role="group" aria-label="Режим касания">
          <button className={touchMode === "reveal" ? styles.modeActive : ""} onClick={() => selectMode("reveal")} aria-pressed={touchMode === "reveal"}>
            <span className={styles.icon} style={{ backgroundImage: spriteUrl("shovel") }} aria-hidden="true" />
            <span>Копать</span>
          </button>
          <button className={touchMode === "flag" ? styles.modeActive : ""} onClick={() => selectMode("flag")} aria-pressed={touchMode === "flag"}>
            <span className={styles.icon} style={{ backgroundImage: spriteUrl("flag") }} aria-hidden="true" />
            <span>Флаг</span>
          </button>
        </div>
        <span className={styles.hint}>
          ЛКМ копать · ПКМ флаг
          <br />
          Цифра: открыть соседей
        </span>
      </footer>
    </div>
  );
}
