"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  initGame,
  revealCell,
  toggleFlagCell,
  GameState,
  DifficultyLevel,
  DIFFICULTY_CONFIGS,
} from "@/lib/xp/minesweeper-game";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { MinesweeperIcon } from "../xp-icons";

const NUMBER_COLORS: Record<number, string> = {
  1: "#0000ff", // Blue
  2: "#008000", // Green
  3: "#ff0000", // Red
  4: "#000080", // Dark Blue
  5: "#800000", // Dark Red
  6: "#008080", // Cyan
  7: "#000000", // Black
  8: "#808080", // Gray
};

export function MinesweeperWindow() {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>("beginner");
  const [gameState, setGameState] = useState<GameState>(() => initGame("beginner"));
  const [isPressing, setIsPressing] = useState(false);
  const [touchMode, setTouchMode] = useState<"reveal" | "flag">("reveal");

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (gameState.status === "playing") {
      interval = setInterval(() => {
        setGameState((prev) => {
          if (prev.status !== "playing") return prev;
          return {
            ...prev,
            elapsedSeconds: Math.min(999, prev.elapsedSeconds + 1),
          };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameState.status]);

  // Handle Game Restart
  const handleRestart = useCallback(
    (lvl: DifficultyLevel = difficulty) => {
      xpSound.click();
      setDifficulty(lvl);
      setGameState(initGame(lvl));
    },
    [difficulty]
  );

  // Handle Left Click / Reveal
  const handleCellClick = (r: number, c: number) => {
    if (touchMode === "flag") {
      handleCellRightClick(r, c);
      return;
    }
    xpSound.click();
    setGameState((prev) => revealCell(prev, r, c));
  };

  // Handle Right Click / Flag
  const handleCellRightClick = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    xpSound.click();
    setGameState((prev) => toggleFlagCell(prev, r, c));
  };

  // Format 3-digit LED numbers
  const formatLed = (num: number) => {
    const clamped = Math.max(-99, Math.min(999, num));
    if (clamped < 0) {
      return `-${Math.abs(clamped).toString().padStart(2, "0")}`;
    }
    return clamped.toString().padStart(3, "0");
  };

  // Smiley icon state
  const getSmiley = () => {
    if (gameState.status === "won") return "😎";
    if (gameState.status === "lost") return "😵";
    if (isPressing) return "😮";
    return "🙂";
  };

  return (
    <div
      className="flex flex-col h-full bg-[#c0c0c0] select-none font-sans text-xs text-black"
      onMouseUp={() => setIsPressing(false)}
    >
      {/* Windows XP Menu Bar */}
      <div className="bg-[#ece9d8] border-b border-[#7b7b7b] px-2 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1.5 font-bold mr-2 text-slate-800">
            <MinesweeperIcon className="w-4 h-4" />
            <span>Сапёр</span>
          </div>

          {/* Difficulty quick selectors */}
          {(["sprint", "beginner", "intermediate"] as DifficultyLevel[]).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => handleRestart(lvl)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                difficulty === lvl
                  ? "bg-[#316ac5] text-white border-[#0055ea]"
                  : "bg-white/70 border-slate-300 text-slate-700 hover:bg-white"
              }`}
              style={{ cursor: xpCursors.pointer }}
            >
              {DIFFICULTY_CONFIGS[lvl].name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Mobile touch toggle mode */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setTouchMode("reveal")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1 ${
              touchMode === "reveal"
                ? "bg-slate-800 text-white border-black"
                : "bg-white border-slate-300 text-slate-700"
            }`}
            style={{ cursor: xpCursors.pointer }}
            title="Режим открытия ячеек"
          >
            <span>⛏️</span>
            <span className="hidden sm:inline">Открыть</span>
          </button>
          <button
            type="button"
            onClick={() => setTouchMode("flag")}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border flex items-center gap-1 ${
              touchMode === "flag"
                ? "bg-red-700 text-white border-red-900"
                : "bg-white border-slate-300 text-slate-700"
            }`}
            style={{ cursor: xpCursors.pointer }}
            title="Режим установки флага"
          >
            <span>🚩</span>
            <span className="hidden sm:inline">Флаг</span>
          </button>
        </div>
      </div>

      {/* Main Game Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 overflow-auto bg-[#c0c0c0]">
        {/* Beveled Outer Box */}
        <div className="border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#7b7b7b] p-3 bg-[#c0c0c0] shadow-md">
          {/* Top Scoreboard (Sunken Frame) */}
          <div className="border-t-2 border-l-2 border-[#7b7b7b] border-b-2 border-r-2 border-white p-2 mb-3 bg-[#c0c0c0] flex items-center justify-between">
            {/* Mines Count LED */}
            <div className="bg-black text-red-500 font-mono font-bold text-xl px-2 py-0.5 border border-[#7b7b7b] tracking-wider select-none">
              {formatLed(gameState.minesLeft)}
            </div>

            {/* Restart Face Button */}
            <button
              type="button"
              onClick={() => handleRestart()}
              className="w-8 h-8 rounded-sm bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#7b7b7b] active:border-t-2 active:border-l-2 active:border-[#7b7b7b] active:border-b-2 active:border-r-2 active:border-white text-lg flex items-center justify-center shadow-xs"
              style={{ cursor: xpCursors.pointer }}
              title="Новая игра"
            >
              {getSmiley()}
            </button>

            {/* Elapsed Time LED */}
            <div className="bg-black text-red-500 font-mono font-bold text-xl px-2 py-0.5 border border-[#7b7b7b] tracking-wider select-none">
              {formatLed(gameState.elapsedSeconds)}
            </div>
          </div>

          {/* Minesweeper Grid (Sunken Frame) */}
          <div
            className="border-t-2 border-l-2 border-[#7b7b7b] border-b-2 border-r-2 border-white bg-[#bdbdbd] p-1 inline-block"
            onMouseDown={() => setIsPressing(true)}
          >
            <div
              className="grid gap-[1px]"
              style={{
                gridTemplateColumns: `repeat(${gameState.config.cols}, minmax(0, 1fr))`,
              }}
            >
              {gameState.grid.map((row, r) =>
                row.map((cell, c) => {
                  let cellContent: React.ReactNode = null;
                  let cellBg = "bg-[#c0c0c0]";
                  let cellBorder =
                    "border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#7b7b7b]";

                  if (cell.isOpen) {
                    cellBg = "bg-[#c0c0c0]";
                    cellBorder = "border border-[#808080]";

                    if (cell.isMine) {
                      cellContent = <span className="text-sm">💣</span>;
                      if (cell.isExploded) {
                        cellBg = "bg-red-600 text-white";
                      }
                    } else if (cell.neighborMines > 0) {
                      cellContent = (
                        <span
                          className="font-bold font-mono text-sm leading-none"
                          style={{ color: NUMBER_COLORS[cell.neighborMines] }}
                        >
                          {cell.neighborMines}
                        </span>
                      );
                    }
                  } else if (cell.isFlagged) {
                    cellContent = <span className="text-sm text-red-600 font-bold">🚩</span>;
                  } else if (cell.isQuestion) {
                    cellContent = <span className="text-xs font-bold text-blue-900">?</span>;
                  }

                  return (
                    <button
                      key={`${r}-${c}`}
                      type="button"
                      onClick={() => handleCellClick(r, c)}
                      onContextMenu={(e) => handleCellRightClick(r, c, e)}
                      className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center select-none ${cellBg} ${cellBorder} active:bg-[#a0a0a0]`}
                      style={{ cursor: xpCursors.pointer }}
                    >
                      {cellContent}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Win / Loss Status Message */}
        {gameState.status === "won" && (
          <div className="mt-3 px-4 py-1.5 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded font-bold text-xs flex items-center gap-2 animate-bounce">
            <span>🏆</span>
            <span>Поздравляем! Поле очищено за {gameState.elapsedSeconds} сек!</span>
          </div>
        )}
        {gameState.status === "lost" && (
          <div className="mt-3 px-4 py-1.5 bg-rose-100 border border-rose-400 text-rose-900 rounded font-bold text-xs flex items-center gap-2">
            <span>💥</span>
            <span>Мина взорвана! Нажмите на смайлик для новой попытки.</span>
          </div>
        )}
      </div>

      {/* Footer Instructions */}
      <div className="bg-[#ece9d8] border-t border-[#7b7b7b] px-3 py-1 flex items-center justify-between text-[11px] text-slate-600 font-sans flex-shrink-0">
        <div>ЛКМ — открыть клетку • ПКМ — поставить флаг</div>
        <div className="font-mono text-[10px]">Гарантия безопасного первого клика</div>
      </div>
    </div>
  );
}
