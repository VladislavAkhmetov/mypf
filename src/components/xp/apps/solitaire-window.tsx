"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  SolitaireState,
  Suit,
  Rank,
  getSuitColor,
  getRankLabel,
  dealSolitaire,
  drawCard,
  moveWasteToFoundation,
  moveWasteToTableau,
  moveTableauToFoundation,
  moveTableauToTableau,
  tryAutoMoveCardToFoundation,
  findHint,
  HintMove,
} from "@/lib/xp/solitaire-deck";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

// Custom Pip SVGs
function PipIcon({ suit, className = "w-3.5 h-3.5" }: { suit: Suit; className?: string }) {
  const isRed = suit === "hearts" || suit === "diamonds";
  const fill = isRed ? "#dc2626" : "#0f172a";

  switch (suit) {
    case "spades":
      return (
        <svg viewBox="0 0 24 24" className={className} fill={fill}>
          <path d="M12 2 C12 2 4 10 4 14.5 C4 18 7 20.5 10 20.5 C11.5 20.5 12 19.5 12 19.5 C12 19.5 12.5 20.5 14 20.5 C17 20.5 20 18 20 14.5 C20 10 12 2 12 2 Z" />
          <path d="M11 19 L9 23 L15 23 L13 19 Z" />
        </svg>
      );
    case "hearts":
      return (
        <svg viewBox="0 0 24 24" className={className} fill={fill}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      );
    case "diamonds":
      return (
        <svg viewBox="0 0 24 24" className={className} fill={fill}>
          <polygon points="12,2 21,12 12,22 3,12" />
        </svg>
      );
    case "clubs":
      return (
        <svg viewBox="0 0 24 24" className={className} fill={fill}>
          <circle cx="12" cy="7.5" r="4.5" />
          <circle cx="6.5" cy="14.5" r="4.5" />
          <circle cx="17.5" cy="14.5" r="4.5" />
          <path d="M11 14 L9 22 L15 22 L13 14 Z" />
        </svg>
      );
  }
}

// Royal Monograph Face Card
function RoyalMonograph({ rank, suit }: { rank: Rank; suit: Suit }) {
  const isRed = getSuitColor(suit) === "red";
  const color = isRed ? "#dc2626" : "#0f172a";

  if (rank === 13) {
    // King Monograph
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-1 relative select-none">
        <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
          <rect x="2" y="2" width="36" height="36" rx="2" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
          {/* Crown */}
          <polygon points="12,14 15,10 20,13 25,10 28,14 26,17 14,17" fill="#d97706" />
          {/* Typographic K */}
          <text x="20" y="32" fill={color} fontSize="18" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            K
          </text>
        </svg>
        <span className="text-[7px] font-mono tracking-widest uppercase opacity-70 mt-0.5" style={{ color }}>
          REX
        </span>
      </div>
    );
  }

  if (rank === 12) {
    // Queen Monograph
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-1 relative select-none">
        <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
          <circle cx="20" cy="20" r="17" stroke={color} strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
          {/* Typographic Q */}
          <text x="18" y="27" fill={color} fontSize="19" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            Q
          </text>
          <line x1="21" y1="23" x2="27" y2="30" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
        <span className="text-[7px] font-mono tracking-widest uppercase opacity-70 mt-0.5" style={{ color }}>
          REGINA
        </span>
      </div>
    );
  }

  if (rank === 11) {
    // Jack Monograph
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-1 relative select-none">
        <svg viewBox="0 0 40 40" className="w-9 h-9" fill="none">
          <rect x="5" y="5" width="30" height="30" stroke={color} strokeWidth="1" opacity="0.3" transform="rotate(45 20 20)" />
          {/* Typographic J */}
          <text x="20" y="28" fill={color} fontSize="19" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">
            J
          </text>
        </svg>
        <span className="text-[7px] font-mono tracking-widest uppercase opacity-70 mt-0.5" style={{ color }}>
          MILES
        </span>
      </div>
    );
  }

  // Ace
  if (rank === 1) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center select-none">
        <PipIcon suit={suit} className="w-8 h-8 filter drop-shadow-xs" />
      </div>
    );
  }

  // Numeric cards: show center pip cluster
  return (
    <div className="w-full h-full flex items-center justify-center select-none opacity-85">
      <PipIcon suit={suit} className="w-6 h-6" />
    </div>
  );
}

// Single Card View Component
interface CardViewProps {
  card: Card;
  isSelected?: boolean;
  isHinted?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  style?: React.CSSProperties;
}

function CardView({
  card,
  isSelected = false,
  isHinted = false,
  onClick,
  onDoubleClick,
  style,
}: CardViewProps) {
  const isRed = getSuitColor(card.suit) === "red";
  const label = getRankLabel(card.rank);

  if (!card.isFaceUp) {
    // Card Back ("Рубашка") - Minimalist Geometric Design
    return (
      <div
        onClick={onClick}
        className="xp-solitaire-card w-16 h-22 sm:w-20 sm:h-28 rounded-md bg-[#1e293b] border-2 border-white shadow-md relative overflow-hidden cursor-pointer select-none flex-shrink-0"
        style={style}
      >
        <div className="absolute inset-1 border border-blue-400/40 rounded-xs bg-[#0f172a] flex items-center justify-center overflow-hidden">
          {/* Modernist lattice grid */}
          <div
            className="w-full h-full opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(#60a5fa 1px, transparent 1px), radial-gradient(#60a5fa 1px, #0f172a 1px)",
              backgroundSize: "8px 8px",
              backgroundPosition: "0 0, 4px 4px",
            }}
          />
          <div className="absolute text-[8px] font-bold tracking-widest text-blue-300/80 font-mono rotate-45 select-none">
            VA • 2026
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`xp-solitaire-card w-16 h-22 sm:w-20 sm:h-28 rounded-md bg-white border border-slate-300 shadow-md relative flex flex-col justify-between p-1.5 cursor-pointer select-none flex-shrink-0 ${
        isSelected ? "is-selected" : ""
      } ${isHinted ? "is-hinted" : ""}`}
      style={style}
    >
      {/* Top Left Corner Index */}
      <div className="flex flex-col items-center leading-none select-none">
        <span
          className={`font-black text-xs sm:text-sm tracking-tighter ${
            isRed ? "text-red-600" : "text-slate-950"
          }`}
        >
          {label}
        </span>
        <PipIcon suit={card.suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
      </div>

      {/* Center Artwork */}
      <div className="flex-1 flex items-center justify-center my-0.5 overflow-hidden">
        <RoyalMonograph rank={card.rank} suit={card.suit} />
      </div>

      {/* Bottom Right Inverted Index */}
      <div className="flex flex-col items-center leading-none rotate-180 select-none">
        <span
          className={`font-black text-xs sm:text-sm tracking-tighter ${
            isRed ? "text-red-600" : "text-slate-950"
          }`}
        >
          {label}
        </span>
        <PipIcon suit={card.suit} className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5" />
      </div>
    </div>
  );
}

// Interactive Canvas Celebration Engine (Classic 60 FPS Win Bouncing Trail)
function SolitaireWinCanvas({ onFinish }: { onFinish?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 800;
    canvas.height = canvas.parentElement?.clientHeight || 600;

    // Card dimensions
    const cWidth = 64;
    const cHeight = 88;

    // Bouncing cards state
    let cardsRemaining = 52;
    let currentX = canvas.width - cWidth - 40;
    let currentY = 40;
    let vx = -(Math.random() * 5 + 3);
    let vy = -(Math.random() * 4 + 2);
    const gravity = 0.45;
    const bounceDamping = 0.82;

    let animId: number;

    const render = () => {
      // Draw card stamp at current position without clearing entire screen to produce legendary trails
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(currentX, currentY, cWidth, cHeight);
      ctx.strokeStyle = "#475467";
      ctx.lineWidth = 1;
      ctx.strokeRect(currentX, currentY, cWidth, cHeight);

      // Card center graphic
      ctx.fillStyle = cardsRemaining % 2 === 0 ? "#dc2626" : "#0f172a";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText("XP", currentX + 22, currentY + 48);

      // Physics step
      currentX += vx;
      currentY += vy;
      vy += gravity;

      // Bounce off bottom
      if (currentY + cHeight >= canvas.height) {
        currentY = canvas.height - cHeight;
        vy = -vy * bounceDamping;
      }

      // Check if off screen to the left
      if (currentX + cWidth < 0) {
        cardsRemaining -= 1;
        if (cardsRemaining > 0) {
          // Launch next card from foundation
          currentX = canvas.width - cWidth - 40;
          currentY = 40;
          vx = -(Math.random() * 6 + 3);
          vy = -(Math.random() * 4 + 1);
        } else {
          // Finished celebration
          cancelAnimationFrame(animId);
          if (onFinish) onFinish();
          return;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [onFinish]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-40 pointer-events-none" />;
}

export function SolitaireWindow() {
  const [game, setGame] = useState<SolitaireState>(dealSolitaire);
  const [history, setHistory] = useState<SolitaireState[]>([]);
  const [selected, setSelected] = useState<{
    type: "waste" | "tableau";
    colIndex?: number;
    cardIndex?: number;
    card: Card;
  } | null>(null);

  const [hint, setHint] = useState<HintMove | null>(null);
  const [showNotes, setShowNotes] = useState(false);
  const [showWinDemo, setShowWinDemo] = useState(false);
  const [timerSec, setTimerSec] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Game timer loop
  useEffect(() => {
    if (!isTimerRunning || game.isWon) return;
    const interval = setInterval(() => {
      setTimerSec((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, game.isWon]);

  // Restart / New Game
  const handleNewGame = useCallback(() => {
    xpSound.click();
    const newDeck = dealSolitaire();
    setGame(newDeck);
    setHistory([]);
    setSelected(null);
    setHint(null);
    setShowWinDemo(false);
    setTimerSec(0);
    setIsTimerRunning(true);
  }, []);

  // Save current state to history before a mutating move
  const commitMove = useCallback((nextState: SolitaireState) => {
    setHistory((prev) => [...prev, game]);
    setGame(nextState);
    setSelected(null);
    setHint(null);
    xpSound.click();
  }, [game]);

  // Undo last move
  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    xpSound.click();
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, h.length - 1));
    setGame(prev);
    setSelected(null);
    setHint(null);
  }, [history]);

  // Stock Click (Draw Card)
  const handleStockClick = useCallback(() => {
    const next = drawCard(game);
    commitMove(next);
  }, [game, commitMove]);

  // Waste Card Click
  const handleWasteClick = useCallback(() => {
    if (game.waste.length === 0) return;
    const topCard = game.waste[game.waste.length - 1];

    if (selected?.card.id === topCard.id) {
      setSelected(null);
    } else {
      xpSound.click();
      setSelected({
        type: "waste",
        card: topCard,
      });
    }
  }, [game.waste, selected]);

  // Foundation Pile Click
  const handleFoundationClick = useCallback(
    (foundationIndex: number) => {
      if (!selected) return;

      if (selected.type === "waste") {
        const next = moveWasteToFoundation(game, foundationIndex);
        if (next) commitMove(next);
      } else if (selected.type === "tableau" && selected.colIndex !== undefined) {
        const next = moveTableauToFoundation(game, selected.colIndex, foundationIndex);
        if (next) commitMove(next);
      }
    },
    [game, selected, commitMove],
  );

  // Tableau Column / Card Click
  const handleTableauCardClick = useCallback(
    (colIdx: number, cardIdx: number, card: Card) => {
      // If clicked card is face down: if it's top of column, flip it
      if (!card.isFaceUp) {
        if (cardIdx === game.tableau[colIdx].length - 1) {
          const next = { ...game };
          card.isFaceUp = true;
          commitMove(next);
        }
        return;
      }

      // If already selected another card: attempt to move to this column!
      if (selected) {
        if (selected.type === "waste") {
          const next = moveWasteToTableau(game, colIdx);
          if (next) {
            commitMove(next);
            return;
          }
        } else if (selected.type === "tableau" && selected.colIndex !== undefined) {
          if (selected.colIndex !== colIdx) {
            const next = moveTableauToTableau(
              game,
              selected.colIndex,
              selected.cardIndex || 0,
              colIdx,
            );
            if (next) {
              commitMove(next);
              return;
            }
          }
        }
      }

      // Otherwise, select this card for moving!
      if (selected?.card.id === card.id) {
        setSelected(null);
      } else {
        xpSound.click();
        setSelected({
          type: "tableau",
          colIndex: colIdx,
          cardIndex: cardIdx,
          card,
        });
      }
    },
    [game, selected, commitMove],
  );

  // Click on empty tableau slot
  const handleEmptyTableauClick = useCallback(
    (colIdx: number) => {
      if (!selected) return;

      if (selected.type === "waste") {
        const next = moveWasteToTableau(game, colIdx);
        if (next) commitMove(next);
      } else if (selected.type === "tableau" && selected.colIndex !== undefined) {
        const next = moveTableauToTableau(
          game,
          selected.colIndex,
          selected.cardIndex || 0,
          colIdx,
        );
        if (next) commitMove(next);
      }
    },
    [game, selected, commitMove],
  );

  // Double Click: Auto-move card to foundation
  const handleDoubleClickCard = useCallback(
    (cardId: string) => {
      const next = tryAutoMoveCardToFoundation(game, cardId);
      if (next) {
        commitMove(next);
      }
    },
    [game, commitMove],
  );

  // Request Hint
  const handleRequestHint = useCallback(() => {
    xpSound.click();
    const h = findHint(game);
    setHint(h);
  }, [game]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] text-xs select-none min-h-0 relative">
      {/* Classic Solitaire Menu Bar */}
      <div className="h-6 px-2 flex items-center gap-3 bg-[#ece9d8] border-b border-slate-300 text-slate-800 text-[11px]">
        <button
          type="button"
          onClick={handleNewGame}
          className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded cursor-pointer font-medium"
        >
          Новая игра (F2)
        </button>
        <button
          type="button"
          disabled={history.length === 0}
          onClick={handleUndo}
          className="hover:bg-[#316ac5] hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-800 px-1.5 py-0.5 rounded cursor-pointer font-medium"
        >
          Отменить (Ctrl+Z)
        </button>
        <button
          type="button"
          onClick={handleRequestHint}
          className="hover:bg-[#316ac5] hover:text-white px-1.5 py-0.5 rounded cursor-pointer font-medium text-amber-900"
        >
          Подсказка 💡
        </button>
        <button
          type="button"
          onClick={() => setShowNotes(!showNotes)}
          className={`px-1.5 py-0.5 rounded cursor-pointer font-medium ml-auto ${
            showNotes ? "bg-[#316ac5] text-white" : "hover:bg-[#316ac5] hover:text-white text-blue-900"
          }`}
        >
          О разработке (Spec) 📐
        </button>
        <button
          type="button"
          onClick={() => setShowWinDemo(!showWinDemo)}
          className="hover:bg-emerald-600 hover:text-white px-1.5 py-0.5 rounded cursor-pointer font-bold text-emerald-800"
          title="Проверить 60 FPS Canvas победную анимацию"
        >
          Победа (Демо) 🎉
        </button>
      </div>

      {/* Hint Alert Banner */}
      {hint && (
        <div className="bg-amber-100 border-b border-amber-300 px-3 py-1 flex items-center justify-between text-amber-950 font-medium text-xs">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>{hint.description}</span>
          </div>
          <button
            type="button"
            onClick={() => setHint(null)}
            className="text-amber-800 hover:text-black font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Green Felt Gaming Table */}
      <div className="flex-1 xp-solitaire-board p-3 sm:p-5 flex flex-col min-h-0 overflow-y-auto relative">
        {/* Canvas Win Animation */}
        {(game.isWon || showWinDemo) && (
          <SolitaireWinCanvas onFinish={() => setShowWinDemo(false)} />
        )}

        {/* Top Deck Row: Stock, Waste, and 4 Foundations */}
        <div className="flex items-center justify-between max-w-4xl mx-auto w-full mb-6">
          {/* Stock & Waste */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Stock Pile */}
            <div
              onClick={handleStockClick}
              className="xp-solitaire-slot w-16 h-22 sm:w-20 sm:h-28 rounded-md flex items-center justify-center cursor-pointer shadow-inner relative"
              style={{ cursor: xpCursors.pointer }}
              title="Колода запаса (добор карт)"
            >
              {game.stock.length > 0 ? (
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded bg-slate-900 shadow-md" />
                  <CardView card={game.stock[game.stock.length - 1]} />
                </div>
              ) : (
                <div className="text-white/40 text-lg font-bold">↺</div>
              )}
            </div>

            {/* Waste Pile (Open Draw) */}
            <div
              className="xp-solitaire-slot w-16 h-22 sm:w-20 sm:h-28 rounded-md flex items-center justify-center relative shadow-inner"
              title="Сброс (верхняя карта готова к ходу)"
            >
              {game.waste.length > 0 && (
                <CardView
                  card={game.waste[game.waste.length - 1]}
                  isSelected={selected?.card.id === game.waste[game.waste.length - 1].id}
                  onClick={handleWasteClick}
                  onDoubleClick={() =>
                    handleDoubleClickCard(game.waste[game.waste.length - 1].id)
                  }
                />
              )}
            </div>
          </div>

          {/* 4 Foundations (Дома для Тузов и Мастей) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {(["spades", "hearts", "diamonds", "clubs"] as Suit[]).map((suit, fIdx) => {
              const pile = game.foundations[fIdx];
              const topCard = pile.length > 0 ? pile[pile.length - 1] : null;

              return (
                <div
                  key={suit}
                  onClick={() => handleFoundationClick(fIdx)}
                  className={`xp-solitaire-slot w-16 h-22 sm:w-20 sm:h-28 rounded-md flex items-center justify-center relative shadow-inner cursor-pointer ${
                    selected ? "hover:ring-2 hover:ring-sky-400" : ""
                  }`}
                  style={{ cursor: xpCursors.pointer }}
                  title={`Основание для ${suit}`}
                >
                  {topCard ? (
                    <CardView card={topCard} />
                  ) : (
                    <div className="opacity-30">
                      <PipIcon suit={suit} className="w-8 h-8" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7 Tableau Columns */}
        <div className="flex-1 grid grid-cols-7 gap-1.5 sm:gap-3 max-w-4xl mx-auto w-full min-h-[360px]">
          {game.tableau.map((col, colIdx) => (
            <div
              key={colIdx}
              onClick={() => {
                if (col.length === 0) handleEmptyTableauClick(colIdx);
              }}
              className={`flex-1 flex flex-col items-center relative min-h-[140px] rounded-md ${
                col.length === 0 ? "xp-solitaire-slot border-dashed cursor-pointer" : ""
              }`}
              style={{ cursor: col.length === 0 && selected ? xpCursors.pointer : "default" }}
            >
              {col.map((card, cardIdx) => {
                // Vertical cascade overlap offset
                const offsetTop = cardIdx * (card.isFaceUp ? 24 : 14);
                const isCardSelected = selected?.card.id === card.id;

                return (
                  <div
                    key={card.id}
                    className="absolute w-full flex justify-center"
                    style={{ top: `${offsetTop}px`, zIndex: cardIdx + 1 }}
                  >
                    <CardView
                      card={card}
                      isSelected={isCardSelected}
                      onClick={() => handleTableauCardClick(colIdx, cardIdx, card)}
                      onDoubleClick={() => handleDoubleClickCard(card.id)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Engineering Notes Drawer */}
        {showNotes && (
          <div className="absolute right-0 top-0 bottom-0 w-80 sm:w-96 bg-white/95 backdrop-blur-md shadow-2xl border-l border-slate-300 z-50 p-4 overflow-y-auto flex flex-col text-slate-800 animate-in slide-in-from-right duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Анатомия солитера</h4>
                <div className="text-[10px] text-slate-500">Design-Engineering Spec Sheet</div>
              </div>
              <button
                type="button"
                onClick={() => setShowNotes(false)}
                className="w-6 h-6 rounded hover:bg-slate-200 grid place-items-center font-bold text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <section>
                <div className="font-bold text-blue-900 mb-1">1. Отказ от клипарта и типографика</div>
                <p className="text-slate-600 text-[11px]">
                  Вместо растровых средневековых королей и дам разработана авторская монохромная колода
                  с конструктивистскими монограммами K (Rex), Q (Regina), J (Miles) и швейцарскими акцидентными индексами.
                </p>
              </section>

              <section>
                <div className="font-bold text-blue-900 mb-1">2. Чистый функциональный стейт</div>
                <p className="text-slate-600 text-[11px]">
                  Логика игры изолирована в модуле <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded font-mono">solitaire-deck.ts</code>.
                  Каждый ход возвращает новый неизменяемый объект состояния с поддержкой стека отмены (Undo) и валидацией всех 52 уникальных карт.
                </p>
              </section>

              <section>
                <div className="font-bold text-blue-900 mb-1">3. Touch & Tap-to-Move</div>
                <p className="text-slate-600 text-[11px]">
                  На сенсорных экранах классический drag-and-drop карт часто приводит к случайным срывам.
                  Введена модель: 1-й тап выделяет карту и подсвечивает цели, 2-й тап совершает перенос. Двойной тап отправляет карту в дом.
                </p>
              </section>

              <section>
                <div className="font-bold text-blue-900 mb-1">4. 60 FPS Canvas Win Animation</div>
                <p className="text-slate-600 text-[11px]">
                  Культовый салют победы реализован на аппаратном 2D Canvas без очистки шлейфа с честной гравитацией и упругим отскоком.
                </p>
              </section>
            </div>
          </div>
        )}
      </div>

      {/* Classic Solitaire Statusbar */}
      <div className="h-6 px-3 bg-[#ece9d8] border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-700 font-medium">
        <div className="flex items-center gap-4">
          <span>Счёт: <strong className="text-blue-900">{game.score}</strong></span>
          <span>Ходов: <strong className="text-slate-900">{game.moveCount}</strong></span>
        </div>
        <div className="flex items-center gap-4">
          <span>Время: <strong className="font-mono text-slate-900">{formatTimer(timerSec)}</strong></span>
          <span className="text-slate-400">|</span>
          <span className="text-[10px] text-slate-500">Авторасклад: Двойной клик</span>
        </div>
      </div>
    </div>
  );
}
