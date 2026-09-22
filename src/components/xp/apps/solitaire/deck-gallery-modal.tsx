"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createDeck, getRankNameRu, getSuitNameRu } from "@/lib/xp/solitaire-deck";
import { SolitaireCard } from "./solitaire-card";
import { AtelierCardBack } from "./card-assets";
import galleryStyles from "./deck-gallery.module.css";

interface DeckGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DeckGalleryModal({ isOpen, onClose }: DeckGalleryModalProps) {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isBackView, setIsBackView] = useState(false);

  // 52 cards arranged by suit (Spades, Hearts, Diamonds, Clubs)
  const fullDeck = useMemo(() => {
    const deck = createDeck();
    // Face-up for exhibition
    return deck.map((c) => ({ ...c, isFaceUp: true }));
  }, []);

  const selectedCard = useMemo(() => {
    if (!selectedCardId) return null;
    return fullDeck.find((c) => c.id === selectedCardId) || null;
  }, [selectedCardId, fullDeck]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md select-none">
      <div
        className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-xl overflow-hidden border border-[#d7bb7c]/60 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, #54162b 0%, #260a14 65%, #100408 100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#d7bb7c]/30 bg-[#15060c]/80">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-[#f2d999]">
              Maison Solitaire · 52 карты
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-sans font-semibold uppercase tracking-wider bg-[#d7bb7c]/20 text-[#f2d999] border border-[#d7bb7c]/40">
              Ручная гравировка
            </span>
          </div>

          <button
            onClick={onClose}
            aria-label="Вернуться к игре"
            className={galleryStyles.returnButton}
          >
            Вернуться к игре
          </button>
        </div>

        {/* Gallery Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
          <div className="text-xs text-[#d8cca8] mb-4 text-center">
            Выберите карту, чтобы рассмотреть рисунок, индексы и рубашку крупным планом.
          </div>

          <div className="grid grid-cols-7 sm:grid-cols-13 gap-2 sm:gap-3 place-items-center">
            {fullDeck.map((card) => (
              <button
                type="button"
                key={card.id}
                data-testid="gallery-card"
                aria-label={`${getRankNameRu(card.rank)}, ${getSuitNameRu(card.suit)}`}
                onClick={() => {
                  setSelectedCardId(card.id);
                  setIsBackView(false);
                }}
                className={galleryStyles.cardButton}
              >
                <SolitaireCard card={card} className="!w-12 !h-16 sm:!w-16 sm:!h-22" />
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Inspect Modal for Selected Card */}
        <AnimatePresence>
          {selectedCard && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-60 flex flex-col items-center justify-center p-4 bg-black/85 backdrop-blur-lg"
              onClick={() => setSelectedCardId(null)}
            >
              <div
                className="relative flex flex-col items-center gap-4 p-6 rounded-2xl border border-[#d7bb7c] bg-[#1c080f] shadow-[0_25px_60px_rgba(0,0,0,0.9)]"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Large Card View */}
                <motion.div
                  animate={{ rotateY: isBackView ? 180 : 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="relative w-52 h-[290px] sm:w-60 sm:h-[336px]"
                >
                  {isBackView ? (
                    <div className="w-full h-full rounded-lg overflow-hidden [transform:rotateY(180deg)]">
                      <AtelierCardBack className="!w-full !h-full" />
                    </div>
                  ) : (
                    <SolitaireCard
                      card={selectedCard}
                      className="!w-full !h-full shadow-2xl"
                    />
                  )}
                </motion.div>

                {/* Inspect Action Controls */}
                <div className="flex items-center gap-3 mt-1">
                  <button
                    onClick={() => setIsBackView(!isBackView)}
                    className={galleryStyles.flipButton}
                  >
                    {isBackView ? "Показать лицевую сторону" : "Показать рубашку Maison"}
                  </button>

                  <button
                    onClick={() => setSelectedCardId(null)}
                    aria-label="Закрыть просмотр карты"
                    className={galleryStyles.inspectClose}
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
