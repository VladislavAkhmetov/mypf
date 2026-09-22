import React from "react";
import { Suit, Rank, getSuitColor } from "@/lib/xp/solitaire-deck";

// Palette tokens
export const ATELIER_COLORS = {
  tableDeep: "#18070D",
  tableFelt: "#4A1023",
  paper: "#FFF9EA",
  paperBorder: "#D9C79E",
  inkDark: "#1A1718",
  inkRed: "#941D3D",
  gold: "#D7BB7C",
  goldDark: "#96733C",
  goldLight: "#F2D999",
  textLight: "#F8EDD2",
};

// Clean SVG Pips for Spades, Hearts, Diamonds, Clubs
export function SuitPip({
  suit,
  className = "w-4 h-4",
  color,
}: {
  suit: Suit;
  className?: string;
  color?: string;
}) {
  const isRed = getSuitColor(suit) === "red";
  const fill = color || (isRed ? ATELIER_COLORS.inkRed : ATELIER_COLORS.inkDark);

  switch (suit) {
    case "spades":
      return (
        <svg viewBox="0 0 24 24" className={className} fill={fill}>
          <path d="M12 2 C12 2 4 10 4 14.5 C4 18 7 20.5 10 20.5 C11.5 20.5 12 19.5 12 19.5 C12 19.5 12.5 20.5 14 20.5 C17 20.5 20 18 20 14.5 C20 10 12 2 12 2 Z" />
          <path d="M11 19 L8.5 23 L15.5 23 L13 19 Z" />
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
          <polygon points="12,1.5 21.5,12 12,22.5 2.5,12" />
        </svg>
      );
    case "clubs":
      return (
        <svg viewBox="0 0 24 24" className={className} fill={fill}>
          <circle cx="12" cy="7.2" r="4.6" />
          <circle cx="6.5" cy="14.5" r="4.6" />
          <circle cx="17.5" cy="14.5" r="4.6" />
          <path d="M11 13.5 L8.5 23 L15.5 23 L13 13.5 Z" />
        </svg>
      );
  }
}

// Ornate Ace Engraving
export function OrnateAceEngraving({ suit }: { suit: Suit }) {
  const isRed = getSuitColor(suit) === "red";
  const primary = isRed ? ATELIER_COLORS.inkRed : ATELIER_COLORS.inkDark;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-2 select-none">
      {/* Delicate filigree aura */}
      <svg viewBox="0 0 100 120" className="w-20 h-24 overflow-visible">
        <defs>
          <radialGradient id={`ace-glow-${suit}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={ATELIER_COLORS.goldLight} stopOpacity="0.4" />
            <stop offset="100%" stopColor={ATELIER_COLORS.gold} stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="50" cy="56" r="44" fill={`url(#ace-glow-${suit})`} />

        {/* Guilloche circular border */}
        <circle
          cx="50"
          cy="56"
          r="40"
          stroke={ATELIER_COLORS.gold}
          strokeWidth="1.2"
          strokeDasharray="2 3"
          fill="none"
          opacity="0.85"
        />
        <circle
          cx="50"
          cy="56"
          r="36"
          stroke={ATELIER_COLORS.goldDark}
          strokeWidth="0.6"
          fill="none"
          opacity="0.5"
        />

        {/* Vintage Corner Flourishes */}
        <path
          d="M20 20 Q50 32 80 20 Q50 26 20 20"
          fill={ATELIER_COLORS.gold}
          opacity="0.75"
        />
        <path
          d="M20 92 Q50 80 80 92 Q50 86 20 92"
          fill={ATELIER_COLORS.gold}
          opacity="0.75"
        />
      </svg>

      {/* Central Majestic Pip */}
      <div className="absolute inset-0 flex items-center justify-center">
        <SuitPip suit={suit} className="w-12 h-12 drop-shadow-[0_1px_2px_rgba(0,0,0,0.15)]" />
      </div>

      <div
        className="absolute bottom-1.5 text-[8px] tracking-[0.25em] uppercase font-serif font-bold opacity-80"
        style={{ color: primary }}
      >
        ATELIER
      </div>
    </div>
  );
}

// Classical Symmetric Pip Layout for Numbers 2-10
export function NumberCardPips({ rank, suit }: { rank: Rank; suit: Suit }) {
  // Classical standard playing card coordinates (normalized percentage coords [x, y, inverted?])
  // X: 25% (left col), 50% (center col), 75% (right col)
  const pips: Array<[number, number, boolean]> = [];

  switch (rank) {
    case 2:
      pips.push([50, 22, false], [50, 78, true]);
      break;
    case 3:
      pips.push([50, 22, false], [50, 50, false], [50, 78, true]);
      break;
    case 4:
      pips.push(
        [28, 22, false],
        [72, 22, false],
        [28, 78, true],
        [72, 78, true]
      );
      break;
    case 5:
      pips.push(
        [28, 22, false],
        [72, 22, false],
        [50, 50, false],
        [28, 78, true],
        [72, 78, true]
      );
      break;
    case 6:
      pips.push(
        [28, 22, false],
        [72, 22, false],
        [28, 50, false],
        [72, 50, false],
        [28, 78, true],
        [72, 78, true]
      );
      break;
    case 7:
      pips.push(
        [28, 22, false],
        [72, 22, false],
        [50, 36, false],
        [28, 50, false],
        [72, 50, false],
        [28, 78, true],
        [72, 78, true]
      );
      break;
    case 8:
      pips.push(
        [28, 22, false],
        [72, 22, false],
        [50, 36, false],
        [28, 50, false],
        [72, 50, false],
        [50, 64, true],
        [28, 78, true],
        [72, 78, true]
      );
      break;
    case 9:
      pips.push(
        [28, 20, false],
        [72, 20, false],
        [28, 40, false],
        [72, 40, false],
        [50, 50, false],
        [28, 60, true],
        [72, 60, true],
        [28, 80, true],
        [72, 80, true]
      );
      break;
    case 10:
      pips.push(
        [28, 18, false],
        [72, 18, false],
        [50, 31, false],
        [28, 44, false],
        [72, 44, false],
        [28, 62, true],
        [72, 62, true],
        [50, 69, true],
        [28, 82, true],
        [72, 82, true]
      );
      break;
  }

  return (
    <div className="absolute inset-0 mx-4 my-6 pointer-events-none select-none">
      {pips.map(([x, y, inv], i) => (
        <div
          key={i}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            transform: `translate(-50%, -50%) ${inv ? "rotate(180deg)" : ""}`,
          }}
        >
          <SuitPip suit={suit} className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-95" />
        </div>
      ))}
    </div>
  );
}

// 12 Unique Reversible Court Figures (Jack 11, Queen 12, King 13) across 4 suits
export function CourtCardFigure({ rank, suit }: { rank: Rank; suit: Suit }) {
  const isRed = getSuitColor(suit) === "red";
  const primary = isRed ? ATELIER_COLORS.inkRed : ATELIER_COLORS.inkDark;
  const accent = ATELIER_COLORS.gold;

  // Title name
  let title = "VALET";
  if (rank === 12) title = "DAME";
  if (rank === 13) title = "ROI";

  return (
    <div className="absolute inset-2 mx-auto my-3 overflow-hidden rounded-[4px] border border-[#d8cca8] bg-[#fbf5e7] flex flex-col justify-between select-none">
      {/* Upper Figure Half */}
      <div className="relative w-full h-1/2 flex items-center justify-center p-1">
        <svg viewBox="0 0 100 70" className="w-full h-full max-h-16 overflow-visible">
          {/* Decorative frame arch */}
          <path
            d="M 10,70 L 10,25 Q 50,5 90,25 L 90,70"
            fill="none"
            stroke={accent}
            strokeWidth="1.2"
            opacity="0.6"
          />

          {/* Robe / Garment pattern */}
          <path
            d="M 22,70 Q 30,38 50,38 Q 70,38 78,70 Z"
            fill={primary}
            opacity="0.88"
          />
          <path
            d="M 38,70 L 42,42 L 58,42 L 62,70 Z"
            fill={accent}
            opacity="0.65"
          />

          {/* Scepter / Attribute based on rank & suit */}
          {rank === 13 && (
            // Crown & Royal Sword
            <g>
              <polygon points="35,26 42,16 50,22 58,16 65,26 35,26" fill={accent} stroke={primary} strokeWidth="1" />
              <line x1="76" y1="20" x2="76" y2="68" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="76" cy="18" r="4" fill={primary} />
            </g>
          )}

          {rank === 12 && (
            // Royal Diadem & Golden Flower / Mirror
            <g>
              <path d="M 38,28 Q 50,18 62,28 Z" fill={accent} stroke={primary} strokeWidth="0.8" />
              <circle cx="74" cy="38" r="5" fill={accent} />
              <line x1="74" y1="43" x2="74" y2="68" stroke={accent} strokeWidth="1.5" />
            </g>
          )}

          {rank === 11 && (
            // Knight Helm / Feathered cap & Halberd Spear
            <g>
              <path d="M 40,28 Q 50,16 60,28 Q 66,22 55,14 Q 42,18 40,28" fill={accent} />
              <line x1="22" y1="12" x2="22" y2="68" stroke={primary} strokeWidth="2" strokeLinecap="round" />
              <polygon points="18,16 22,6 26,16" fill={accent} />
            </g>
          )}

          {/* Head & Collar */}
          <ellipse cx="50" cy="30" rx="10" ry="12" fill="#fff4e0" stroke={primary} strokeWidth="1.2" />
          {/* Eyes & Royal Expression */}
          <circle cx="46" cy="28" r="1.2" fill={primary} />
          <circle cx="54" cy="28" r="1.2" fill={primary} />
          <path d="M 47,35 Q 50,37 53,35" stroke={primary} strokeWidth="0.9" fill="none" />
        </svg>

        {/* Small suit crest in upper half */}
        <div className="absolute top-1 right-2 opacity-80">
          <SuitPip suit={suit} className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Dividing Center Line with Title Monogram */}
      <div className="relative w-full h-[14px] flex items-center justify-center border-y border-[#d8cca8] bg-[#f2e7cc]">
        <span
          className="text-[7.5px] font-serif font-bold tracking-[0.2em] uppercase"
          style={{ color: primary }}
        >
          {title}
        </span>
      </div>

      {/* Inverted Lower Figure Half (Classical reversible card) */}
      <div className="relative w-full h-1/2 flex items-center justify-center p-1 rotate-180">
        <svg viewBox="0 0 100 70" className="w-full h-full max-h-16 overflow-visible">
          <path
            d="M 10,70 L 10,25 Q 50,5 90,25 L 90,70"
            fill="none"
            stroke={accent}
            strokeWidth="1.2"
            opacity="0.6"
          />
          <path
            d="M 22,70 Q 30,38 50,38 Q 70,38 78,70 Z"
            fill={primary}
            opacity="0.88"
          />
          <path
            d="M 38,70 L 42,42 L 58,42 L 62,70 Z"
            fill={accent}
            opacity="0.65"
          />

          {rank === 13 && (
            <g>
              <polygon points="35,26 42,16 50,22 58,16 65,26 35,26" fill={accent} stroke={primary} strokeWidth="1" />
              <line x1="76" y1="20" x2="76" y2="68" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="76" cy="18" r="4" fill={primary} />
            </g>
          )}

          {rank === 12 && (
            <g>
              <path d="M 38,28 Q 50,18 62,28 Z" fill={accent} stroke={primary} strokeWidth="0.8" />
              <circle cx="74" cy="38" r="5" fill={accent} />
              <line x1="74" y1="43" x2="74" y2="68" stroke={accent} strokeWidth="1.5" />
            </g>
          )}

          {rank === 11 && (
            <g>
              <path d="M 40,28 Q 50,16 60,28 Q 66,22 55,14 Q 42,18 40,28" fill={accent} />
              <line x1="22" y1="12" x2="22" y2="68" stroke={primary} strokeWidth="2" strokeLinecap="round" />
              <polygon points="18,16 22,6 26,16" fill={accent} />
            </g>
          )}

          <ellipse cx="50" cy="30" rx="10" ry="12" fill="#fff4e0" stroke={primary} strokeWidth="1.2" />
          <circle cx="46" cy="28" r="1.2" fill={primary} />
          <circle cx="54" cy="28" r="1.2" fill={primary} />
          <path d="M 47,35 Q 50,37 53,35" stroke={primary} strokeWidth="0.9" fill="none" />
        </svg>

        <div className="absolute top-1 right-2 opacity-80">
          <SuitPip suit={suit} className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}

// Master Luxury Guilloche Card Back (VA Monogram & Gold Filigree)
export function AtelierCardBack({ className = "" }: { className?: string }) {
  return (
    <div
      className={`w-full h-full relative rounded-[6px] overflow-hidden select-none border border-[#d7bb7c] shadow-[inset_0_0_18px_rgba(0,0,0,0.72)] ${className}`}
      style={{
        background: "radial-gradient(ellipse at 45% 38%, #6a1b33 0%, #3b0d1d 52%, #17070d 100%)",
      }}
    >
      {/* Double Gold Guilloche Outer Border */}
      <div className="absolute inset-1 rounded-[4px] border border-[#c4a467]/70 pointer-events-none" />
      <div className="absolute inset-1.5 rounded-[3px] border border-[#c4a467]/30 border-dashed pointer-events-none" />

      {/* Geometric Guilloche SVG Pattern */}
      <svg className="w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
        <defs>
          <pattern
            id="guilloche-grid"
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="8" fill="none" stroke="#c4a467" strokeWidth="0.4" opacity="0.25" />
            <circle cx="10" cy="10" r="5" fill="none" stroke="#eed7a1" strokeWidth="0.3" opacity="0.2" />
            <path
              d="M 0,10 Q 10,0 20,10 Q 10,20 0,10"
              fill="none"
              stroke="#c4a467"
              strokeWidth="0.3"
              opacity="0.3"
            />
          </pattern>
        </defs>

        <rect x="6" y="6" width="88" height="128" fill="url(#guilloche-grid)" />

        {/* Central Medallion Frame */}
        <ellipse cx="50" cy="70" rx="28" ry="34" fill="#210910" stroke="#d7bb7c" strokeWidth="1.4" />
        <ellipse
          cx="50"
          cy="70"
          rx="25"
          ry="31"
          fill="none"
          stroke="#eed7a1"
          strokeWidth="0.6"
          strokeDasharray="2 2"
          opacity="0.8"
        />

        {/* Outer Corner Ornaments */}
        <path d="M 6,6 L 18,6 L 6,18 Z" fill="#c4a467" opacity="0.75" />
        <path d="M 94,6 L 82,6 L 94,18 Z" fill="#c4a467" opacity="0.75" />
        <path d="M 6,134 L 18,134 L 6,122 Z" fill="#c4a467" opacity="0.75" />
        <path d="M 94,134 L 82,134 L 94,122 Z" fill="#c4a467" opacity="0.75" />
      </svg>

      {/* Central VA Monogram Medallion */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-12 h-14 rounded-full flex flex-col items-center justify-center">
          <span className="font-serif font-black text-xs sm:text-sm tracking-[0.2em] text-[#f2d999] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            VA
          </span>
          <div className="w-6 h-[1px] bg-[#d7bb7c] my-0.5 opacity-80" />
          <span className="text-[6px] tracking-[0.25em] uppercase text-[#d7bb7c] font-semibold">
            MAISON
          </span>
        </div>
      </div>
    </div>
  );
}
