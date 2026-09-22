"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  useMinesweeperSession,
  minesweeperStore,
  useGamePreferences,
} from "@/lib/xp/games/game-session-store";
import { useWindowManager } from "../window-manager-context";
import { MinesweeperHud } from "./minesweeper/minesweeper-hud";
import { MinesweeperBoard } from "./minesweeper/minesweeper-board";
import { MinesweeperResults } from "./minesweeper/minesweeper-results";
import { MinesweeperLeaderboardModal } from "./minesweeper/minesweeper-leaderboard-modal";
import {
  DifficultyLevel,
  getMinesweeperWindowBounds,
  MINESWEEPER_WINDOW_PRESETS,
} from "@/lib/xp/minesweeper-game";
import styles from "./minesweeper/minesweeper.module.css";

export function MinesweeperWindow() {
  const session = useMinesweeperSession();
  const preferences = useGamePreferences();
  const { windows, updateWindowBounds } = useWindowManager();
  const currentWin = windows.find((w) => w.id === "minesweeper");
  const [isPressing, setIsPressing] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [highlightRecordId, setHighlightRecordId] = useState<string | undefined>(undefined);
  const hasInitialAdjusted = React.useRef(false);

  // Auto-adapt window bounds on mount if opened with too-small window (e.g. legacy 560px for expert)
  useEffect(() => {
    if (hasInitialAdjusted.current || !currentWin || currentWin.isMaximized) return;
    const preset = MINESWEEPER_WINDOW_PRESETS[session.difficulty];
    if (preset && currentWin.width < preset.width * 0.8) {
      hasInitialAdjusted.current = true;
      const nextBounds = getMinesweeperWindowBounds(session.difficulty, {
        x: currentWin.x,
        y: currentWin.y,
        width: currentWin.width,
        height: currentWin.height,
      });
      updateWindowBounds("minesweeper", nextBounds);
    }
  }, [currentWin, session.difficulty, updateWindowBounds]);

  // Keyboard shortcut F2 to restart
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        minesweeperStore.startNewGame();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectDifficulty = useCallback(
    (lvl: DifficultyLevel) => {
      minesweeperStore.startNewGame(lvl);
      if (currentWin && !currentWin.isMaximized) {
        const nextBounds = getMinesweeperWindowBounds(lvl, {
          x: currentWin.x,
          y: currentWin.y,
          width: currentWin.width,
          height: currentWin.height,
        });
        updateWindowBounds("minesweeper", nextBounds);
      }
    },
    [currentWin, updateWindowBounds],
  );

  const handleRestart = useCallback(() => {
    minesweeperStore.startNewGame();
  }, []);

  return (
    <div className={styles.shell}>
      <MinesweeperHud
        minesLeft={session.state.minesLeft}
        elapsedSeconds={session.elapsedSeconds}
        status={session.state.status}
        isPressing={isPressing}
        currentDifficulty={session.difficulty}
        onSelectDifficulty={handleSelectDifficulty}
        onRestart={handleRestart}
        onOpenLeaderboard={() => {
          setHighlightRecordId(undefined);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* Main Playing Grid */}
      <MinesweeperBoard
        state={session.state}
        onApplyState={(nextState) => minesweeperStore.applyState(nextState)}
        onPointerPressStateChange={setIsPressing}
        allowQuestionMarks={preferences.allowQuestionMarks}
        effectsMode={preferences.effectsMode}
      />

      {/* Results and Victory Celebration Overlay */}
      <MinesweeperResults
        key={session.sessionId}
        status={session.state.status}
        difficulty={session.difficulty}
        elapsedSeconds={session.elapsedSeconds}
        highScore={session.highScores[session.difficulty]}
        onRestart={handleRestart}
        onOpenLeaderboard={(recordId) => {
          setHighlightRecordId(recordId);
          setIsLeaderboardOpen(true);
        }}
      />

      {/* Leaderboard Modal */}
      <MinesweeperLeaderboardModal
        isOpen={isLeaderboardOpen}
        initialDifficulty={session.difficulty}
        highlightRecordId={highlightRecordId}
        onClose={() => setIsLeaderboardOpen(false)}
      />

      {/* Pause Screen Overlay */}
      {session.isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-xs">
          <div className="p-6 rounded-xl border border-[#405DE8] bg-[#172244] text-center shadow-2xl">
            <h3 className="font-mono font-bold text-lg text-[#F4F7FF] mb-2">
              Операция приостановлена
            </h3>
            <p className="text-xs text-[#a5b4fc] mb-4">
              Окно свернуто или потеряло системный фокус.
            </p>
            <button
              onClick={() => minesweeperStore.setPaused(false)}
              className="px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-wider bg-[#405DE8] text-white hover:bg-[#728AFF] transition cursor-pointer"
            >
              Продолжить операцию
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
