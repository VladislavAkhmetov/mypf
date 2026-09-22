"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Card,
  HintMove,
  SolitaireState,
  Suit,
  canAutoFinish,
  drawCard,
  findHint,
  getNextAutoFinishMove,
  moveFoundationToTableau,
  moveTableauToFoundation,
  moveTableauToTableau,
  moveWasteToFoundation,
  moveWasteToTableau,
  tryAutoMoveCardToFoundation,
} from "@/lib/xp/solitaire-deck";
import { gameSound } from "@/lib/xp/games/game-sound";
import { AtelierCardBack, SuitPip } from "./card-assets";
import { SolitaireCard } from "./solitaire-card";
import styles from "./solitaire.module.css";

interface SelectedCardInfo {
  source: "waste" | "tableau" | "foundation";
  columnIndex?: number;
  foundationIndex?: number;
  cardIndex?: number;
  card: Card;
  cards: Card[];
}

interface DragInfo {
  info: SelectedCardInfo;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

interface SolitaireBoardProps {
  state: SolitaireState;
  onApplyState: (nextState: SolitaireState, isUndo?: boolean) => void;
  onOpenDeckGallery: () => void;
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
  elapsedSeconds: number;
  onOpenLeaderboard?: () => void;
}

const SUITS: Suit[] = ["spades", "hearts", "clubs", "diamonds"];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

function ToolbarIcon({ name }: { name: "new" | "undo" | "hint" | "gallery" | "finish" | "trophy" }) {
  const paths = {
    new: <><path d="M12 4a8 8 0 1 0 7.4 11"/><path d="M12 1v6h6"/></>,
    undo: <><path d="M9 7 4 12l5 5"/><path d="M5 12h8a6 6 0 0 1 6 6"/></>,
    hint: <><path d="M9 18h6"/><path d="M10 22h4"/><path d="M8.2 14.3A7 7 0 1 1 15.8 14.3C14.7 15.1 14 16 14 17h-4c0-1-.7-1.9-1.8-2.7Z"/></>,
    gallery: <><rect x="3" y="4" width="14" height="17" rx="2"/><path d="m8 8 7 8"/><rect x="8" y="1" width="13" height="18" rx="2"/></>,
    finish: <><path d="m12 2 1.7 5.2H19l-4.3 3.1 1.7 5.2-4.4-3.2-4.4 3.2 1.7-5.2L5 7.2h5.3Z"/><path d="M5 19h14"/></>,
    trophy: <><path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/><path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H7v4h10v-4h-2c-.55 0-1-.45-1-1v-2.34"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8">{paths[name]}</svg>;
}

export function SolitaireBoard({
  state,
  onApplyState,
  onOpenDeckGallery,
  onNewGame,
  onUndo,
  canUndo,
  elapsedSeconds,
  onOpenLeaderboard,
}: SolitaireBoardProps) {
  const [selected, setSelected] = useState<SelectedCardInfo | null>(null);
  const [hint, setHint] = useState<HintMove | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isAutoFinishing, setIsAutoFinishing] = useState(false);
  const [dragging, setDragging] = useState<DragInfo | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSelection = () => {
    setSelected(null);
    setHint(null);
  };

  const apply = (next: SolitaireState | null) => {
    if (!next || next === state) return false;
    gameSound.cardPlace();
    onApplyState(next);
    clearSelection();
    setMessage(null);
    return true;
  };

  const selectWaste = () => {
    const card = state.waste.at(-1);
    if (!card) return;
    setSelected(selected?.source === "waste" ? null : { source: "waste", card, cards: [card] });
    setHint(null);
  };

  const selectFoundation = (foundationIndex: number) => {
    if (selected?.cards.length === 1) {
      const next = selected.source === "waste"
        ? moveWasteToFoundation(state, foundationIndex)
        : selected.source === "tableau" && selected.columnIndex !== undefined
          ? moveTableauToFoundation(state, selected.columnIndex, foundationIndex)
          : null;
      if (apply(next)) return;
    }

    const card = state.foundations[foundationIndex].at(-1);
    if (!card) return;
    setSelected(
      selected?.source === "foundation" && selected.foundationIndex === foundationIndex
        ? null
        : { source: "foundation", foundationIndex, card, cards: [card] },
    );
    setHint(null);
  };

  const selectTableau = (columnIndex: number, cardIndex?: number) => {
    if (selected) {
      const next = selected.source === "waste"
        ? moveWasteToTableau(state, columnIndex)
        : selected.source === "tableau" && selected.columnIndex !== undefined && selected.cardIndex !== undefined
          ? moveTableauToTableau(state, selected.columnIndex, selected.cardIndex, columnIndex)
          : selected.source === "foundation" && selected.foundationIndex !== undefined
            ? moveFoundationToTableau(state, selected.foundationIndex, columnIndex)
            : null;
      if (apply(next)) return;
      if (selected.source === "tableau" && selected.columnIndex === columnIndex) {
        setSelected(null);
        return;
      }
    }

    if (cardIndex === undefined) {
      setSelected(null);
      return;
    }
    const card = state.tableau[columnIndex][cardIndex];
    if (!card?.isFaceUp) return;
    setSelected({
      source: "tableau",
      columnIndex,
      cardIndex,
      card,
      cards: state.tableau[columnIndex].slice(cardIndex),
    });
    setHint(null);
  };

  const startDrag = (event: React.PointerEvent, info: SelectedCardInfo) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging({
      info,
      startX: event.clientX,
      startY: event.clientY,
      currentX: event.clientX,
      currentY: event.clientY,
    });
  };

  const endDrag = () => {
    if (!dragging) return;
    const { info, startX, startY, currentX, currentY } = dragging;
    setDragging(null);
    if (Math.hypot(currentX - startX, currentY - startY) < 7) return;

    const element = document.elementFromPoint(currentX, currentY);
    const tableau = element?.closest("[data-tableau-col]");
    if (tableau) {
      const target = Number(tableau.getAttribute("data-tableau-col"));
      const next = info.source === "waste"
        ? moveWasteToTableau(state, target)
        : info.source === "tableau" && info.columnIndex !== undefined && info.cardIndex !== undefined
          ? moveTableauToTableau(state, info.columnIndex, info.cardIndex, target)
          : info.source === "foundation" && info.foundationIndex !== undefined
            ? moveFoundationToTableau(state, info.foundationIndex, target)
            : null;
      if (apply(next)) return;
    }

    const foundation = element?.closest("[data-foundation-idx]");
    if (foundation && info.cards.length === 1) {
      const target = Number(foundation.getAttribute("data-foundation-idx"));
      const next = info.source === "waste"
        ? moveWasteToFoundation(state, target)
        : info.source === "tableau" && info.columnIndex !== undefined
          ? moveTableauToFoundation(state, info.columnIndex, target)
          : null;
      if (apply(next)) return;
    }

    setMessage("Эта карта сюда не подходит");
    window.setTimeout(() => setMessage(null), 1200);
  };

  const requestHint = () => {
    const found = findHint(state);
    setHint(found);
    setMessage(found?.description ?? "Очевидных ходов нет — проверьте запас");
    if (messageTimer.current) clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(null), 4200);
  };

  useEffect(() => () => {
    if (messageTimer.current) clearTimeout(messageTimer.current);
  }, []);

  useEffect(() => {
    if (!isAutoFinishing) return;
    const move = getNextAutoFinishMove(state);
    if (!move) {
      const stopTimer = setTimeout(() => setIsAutoFinishing(false), 0);
      return () => clearTimeout(stopTimer);
    }
    const timer = setTimeout(() => {
      const next = moveTableauToFoundation(state, move.fromCol, move.fIdx);
      if (next) onApplyState(next);
      else setIsAutoFinishing(false);
    }, 145);
    return () => clearTimeout(timer);
  }, [isAutoFinishing, onApplyState, state]);

  const handleStock = () => {
    const next = drawCard(state);
    if (next === state) return;
    gameSound.cardSlide();
    onApplyState(next);
    clearSelection();
  };

  const doubleClick = (card: Card) => {
    apply(tryAutoMoveCardToFoundation(state, card.id));
  };

  const eligibleForAutoFinish = canAutoFinish(state);

  return (
    <div
      className={styles.shell}
      onPointerMove={(event) => dragging && setDragging({ ...dragging, currentX: event.clientX, currentY: event.clientY })}
      onPointerUp={endDrag}
      onPointerCancel={() => setDragging(null)}
    >
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.monogram}>VA</span>
          <span><b>Maison Solitaire</b><small>Авторская косынка · выпуск 01</small></span>
        </div>
        <div className={styles.rule}><i /><span>Atelier de cartes</span><i /></div>
        <div className={styles.stats}>
          <span><small>Ходы</small><b>{String(state.moveCount).padStart(2, "0")}</b></span>
          <span><small>Время</small><b>{formatTime(elapsedSeconds)}</b></span>
        </div>
      </header>

      <main className={styles.table}>
        <div className={styles.tableGlow} />
        <section className={styles.topRow} aria-label="Запас, сброс и основания">
          <div className={styles.stockGroup}>
            <button className={`${styles.pile} ${styles.stock}`} onClick={handleStock} aria-label={`Запас: ${state.stock.length} карт`}>
              {state.stock.length ? <><AtelierCardBack /><em>{state.stock.length}</em></> : <span className={styles.recycle}>↻</span>}
            </button>
            <div className={styles.waste}>
              {state.waste.length ? (
                <div onClick={selectWaste} onPointerDown={(event) => startDrag(event, { source: "waste", card: state.waste.at(-1)!, cards: [state.waste.at(-1)!] })}>
                  <SolitaireCard card={state.waste.at(-1)!} isSelected={selected?.source === "waste"} isHinted={hint?.sourceType === "waste"} onDoubleClick={() => doubleClick(state.waste.at(-1)!)} />
                </div>
              ) : <div className={`${styles.pile} ${styles.emptyPile}`}><span>Сброс</span></div>}
            </div>
          </div>

          <div className={styles.foundations}>
            {SUITS.map((suit, index) => {
              const card = state.foundations[index].at(-1);
              return (
                <button
                  key={suit}
                  data-foundation-idx={index}
                  className={`${styles.foundation} ${hint?.targetType === "foundation" && hint.targetIndex === index ? styles.hinted : ""}`}
                  onClick={() => selectFoundation(index)}
                  onPointerDown={(event) => card && startDrag(event, { source: "foundation", foundationIndex: index, card, cards: [card] })}
                  aria-label={`Основание ${index + 1}`}
                >
                  {card ? <SolitaireCard card={card} isSelected={selected?.source === "foundation" && selected.foundationIndex === index} onDoubleClick={() => doubleClick(card)} /> : <><SuitPip suit={suit} /><small>A — K</small></>}
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.tableau} aria-label="Игровые колонки">
          {state.tableau.map((column, columnIndex) => {
            const targetHint = hint?.targetType === "tableau" && hint.targetIndex === columnIndex;
            return (
              <button
                type="button"
                key={columnIndex}
                data-tableau-col={columnIndex}
                className={`${styles.column} ${targetHint ? styles.hinted : ""}`}
                onClick={() => selectTableau(columnIndex)}
                aria-label={`Колонка ${columnIndex + 1}`}
              >
                {!column.length && <span className={styles.kingSlot}>K<small>пустая колонка</small></span>}
                {column.map((card, cardIndex) => {
                  const top = column.slice(0, cardIndex).reduce((sum, current) => sum + (current.isFaceUp ? 30 : 15), 0);
                  const chosen = selected?.source === "tableau" && selected.columnIndex === columnIndex && selected.cardIndex !== undefined && cardIndex >= selected.cardIndex;
                  const sourceHint = hint?.sourceType === "tableau" && hint.sourceIndex === columnIndex && (hint.cardId ? hint.cardId === card.id : cardIndex === column.length - 1);
                  return (
                    <span
                      key={card.id}
                      className={styles.cardPosition}
                      style={{ top, zIndex: cardIndex + 1 }}
                      onClick={(event) => { event.stopPropagation(); selectTableau(columnIndex, cardIndex); }}
                      onPointerDown={(event) => card.isFaceUp && startDrag(event, { source: "tableau", columnIndex, cardIndex, card, cards: column.slice(cardIndex) })}
                    >
                      <SolitaireCard card={card} isSelected={chosen} isHinted={sourceHint} onDoubleClick={() => doubleClick(card)} />
                    </span>
                  );
                })}
              </button>
            );
          })}
        </section>
      </main>

      <AnimatePresence>
        {message && <motion.div className={styles.toast} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>{message}</motion.div>}
      </AnimatePresence>

      {dragging && (
        <div className={styles.dragOverlay} style={{ left: dragging.currentX - 46, top: dragging.currentY - 56 }}>
          {dragging.info.cards.map((card, index) => <span key={card.id} style={{ marginTop: index ? -100 : 0 }}><SolitaireCard card={card} isDragging /></span>)}
        </div>
      )}

      <footer className={styles.toolbar}>
        <div>
          <button onClick={onNewGame} data-ym-goal="solitaire_new_game"><ToolbarIcon name="new" /><span>Новая</span></button>
          <button onClick={onUndo} disabled={!canUndo} data-ym-goal="solitaire_undo"><ToolbarIcon name="undo" /><span>Отменить</span></button>
          <button onClick={requestHint} data-ym-goal="solitaire_hint"><ToolbarIcon name="hint" /><span>Подсказка</span></button>
        </div>
        <div>
          {eligibleForAutoFinish && <button className={styles.finishButton} onClick={() => setIsAutoFinishing(true)} disabled={isAutoFinishing} data-ym-goal="solitaire_auto_finish"><ToolbarIcon name="finish" /><span>{isAutoFinishing ? "Завершаем" : "Собрать"}</span></button>}
          <button onClick={onOpenDeckGallery} data-ym-goal="solitaire_deck_gallery"><ToolbarIcon name="gallery" /><span>Коллекция</span></button>
          {onOpenLeaderboard && <button onClick={onOpenLeaderboard} data-ym-goal="solitaire_leaderboard_open"><ToolbarIcon name="trophy" /><span>Рекорды</span></button>}
        </div>
      </footer>
    </div>
  );
}
