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
import { Manrope, Playfair_Display } from "next/font/google";
import { DeckDefs, DeckMonogram } from "./solitaire/card-assets";
import styles from "./solitaire/solitaire.module.css";

// Self-hosted at build time (static hosting friendly); both have Cyrillic.
const displayFont = Playfair_Display({ subsets: ["latin", "cyrillic"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-display", display: "swap" });
const uiFont = Manrope({ subsets: ["latin", "cyrillic"], weight: ["500", "600", "700"], variable: "--font-ui", display: "swap" });

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
    <div className={`${styles.root} ${displayFont.variable} ${uiFont.variable}`}>
      <DeckDefs />
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
        <div className={styles.pause}>
          <section>
            <DeckMonogram className={styles.mark} />
            <h3 className={styles.display}>Пауза</h3>
            <p>Окно было свёрнуто или потеряло фокус.</p>
            <button onClick={() => solitaireStore.setPaused(false)}>Продолжить</button>
          </section>
        </div>
      )}
    </div>
  );
}
