"use client";

import React, { useState, useEffect } from "react";
import {
  useSolitaireSession,
  solitaireStore,
} from "@/lib/xp/games/game-session-store";
import { SolitaireBoard } from "./solitaire/solitaire-board";
import { DeckGalleryModal } from "./solitaire/deck-gallery-modal";
import { SolitaireVictory } from "./solitaire/solitaire-victory";
import { SolitaireLeaderboardModal } from "./solitaire/solitaire-leaderboard-modal";
import { useWindowManager } from "../window-manager-context";

export function SolitaireWindow() {
  const session = useSolitaireSession();
  const { activeWindowId } = useWindowManager();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [highlightRecordId, setHighlightRecordId] = useState<string | undefined>(undefined);

  // Keyboard controls (Ctrl+Z for undo, F2 for new game)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeWindowId !== "solitaire" || isGalleryOpen || isLeaderboardOpen || session.isPaused) return;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        solitaireStore.undo();
      } else if (e.key === "F2") {
        e.preventDefault();
        solitaireStore.startNewGame();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeWindowId, isGalleryOpen, isLeaderboardOpen, session.isPaused]);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#315b4e] overflow-hidden select-none">
      {/* Active Board */}
      <SolitaireBoard
        key={session.sessionId}
        state={session.state}
        onApplyState={(nextState, isUndo) =>
          solitaireStore.applyState(nextState, isUndo)
        }
        onOpenDeckGallery={() => setIsGalleryOpen(true)}
        onOpenLeaderboard={() => {
          setHighlightRecordId(undefined);
          setIsLeaderboardOpen(true);
        }}
        onNewGame={() => solitaireStore.startNewGame()}
        onUndo={() => solitaireStore.undo()}
        canUndo={session.history.length > 0}
        elapsedSeconds={session.elapsedSeconds}
      />

      {/* 52-Card Deck Exhibition Gallery */}
      {isGalleryOpen && <DeckGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && <SolitaireLeaderboardModal
        isOpen={isLeaderboardOpen}
        highlightRecordId={highlightRecordId}
        onClose={() => setIsLeaderboardOpen(false)}
      />}

      {/* Victory Celebration */}
      {session.state.isWon && (
        <SolitaireVictory
          moveCount={session.state.moveCount}
          elapsedSeconds={session.elapsedSeconds}
          onNewGame={() => solitaireStore.startNewGame()}
          onOpenLeaderboard={(recordId) => {
            setHighlightRecordId(recordId);
            setIsLeaderboardOpen(true);
          }}
        />
      )}

      {/* Pause Screen Overlay */}
      {session.isPaused && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="p-8 rounded-3xl bg-[#fffcf5] text-center shadow-2xl">
            <h3 className="font-semibold text-2xl text-[#244b40] mb-2">
              Игра на паузе
            </h3>
            <p className="text-base text-[#52685d] mb-6">
              Окно было свернуто или потеряло фокус.
            </p>
            <button
              onClick={() => solitaireStore.setPaused(false)}
              className="px-6 py-3 rounded-xl font-semibold text-base bg-[#315b4e] text-white hover:bg-[#244b40] transition cursor-pointer"
            >
              Продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
