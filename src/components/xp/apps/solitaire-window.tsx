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

export function SolitaireWindow() {
  const session = useSolitaireSession();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [highlightRecordId, setHighlightRecordId] = useState<string | undefined>(undefined);

  // Keyboard controls (Ctrl+Z for undo, F2 for new game)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col bg-[#16070c] overflow-hidden select-none">
      {/* Active Board */}
      <SolitaireBoard
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
      <DeckGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Leaderboard Modal */}
      <SolitaireLeaderboardModal
        isOpen={isLeaderboardOpen}
        highlightRecordId={highlightRecordId}
        onClose={() => setIsLeaderboardOpen(false)}
      />

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
          <div className="p-6 rounded-xl border border-[#d7bb7c] bg-[#1c080f] text-center shadow-2xl">
            <h3 className="font-serif font-bold text-xl text-[#f2d999] mb-2">
              Игра на паузе
            </h3>
            <p className="text-xs text-[#d8cca8] mb-4">
              Окно было свернуто или потеряло фокус.
            </p>
            <button
              onClick={() => solitaireStore.setPaused(false)}
              className="px-5 py-2 rounded-lg font-serif font-bold text-xs uppercase tracking-wider bg-[#d7bb7c] text-[#18070d] hover:bg-[#f2d999] transition cursor-pointer"
            >
              Продолжить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
