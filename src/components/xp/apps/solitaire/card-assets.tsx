import React from "react";
import { Rank, Suit, getSuitColor } from "@/lib/xp/solitaire-deck";

// "Atelier" deck: full-bleed tone-on-tone patterned faces (garnet for red suits,
// emerald for black suits), ivory pips with an embossed star texture.
export const DECK = {
  ivory: "#f4ecdc",
  ivoryShade: "#e2d4b8",
  gold: "#c9a45c",
  garnet: { base: "#a3141f", light: "#b6222c", dark: "#7f0d16" },
  emerald: { base: "#0f4c34", light: "#17603f", dark: "#0a3a27" },
  midnight: { base: "#15203a", light: "#1c2a4a", dark: "#0d1528" },
};

type Tone = { base: string; light: string; dark: string };

export function suitTone(suit: Suit): Tone {
  return getSuitColor(suit) === "red" ? DECK.garnet : DECK.emerald;
}

function rosetteTile(tone: Tone, accent = tone.light, dot = tone.dark): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<rect width="24" height="24" fill="${tone.base}"/>
<g fill="${accent}"><rect x="7.5" y="7.5" width="9" height="9"/><rect x="7.5" y="7.5" width="9" height="9" transform="rotate(45 12 12)"/></g>
<circle cx="12" cy="12" r="2.2" fill="${dot}"/>
<g fill="${dot}" opacity=".7"><path d="M0 -3 3 0 0 3 -3 0Z"/><path d="M24 -3 27 0 24 3 21 0Z"/><path d="M0 21 3 24 0 27 -3 24Z"/><path d="M24 21 27 24 24 27 21 24Z"/></g>
<g fill="${accent}" opacity=".55"><circle cx="12" cy="0" r="1"/><circle cx="12" cy="24" r="1"/><circle cx="0" cy="12" r="1"/><circle cx="24" cy="12" r="1"/></g>
</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

const tileCache = new Map<string, string>();
/** CSS background for a card face or back. */
export function patternFor(kind: "red" | "black" | "back"): string {
  let value = tileCache.get(kind);
  if (!value) {
    value = kind === "back" ? rosetteTile(DECK.midnight, "#2a3a5f", DECK.gold) : rosetteTile(kind === "red" ? DECK.garnet : DECK.emerald);
    tileCache.set(kind, value);
  }
  return value;
}

/** Classic suit silhouettes on a 24×24 grid. */
export function SuitShape({ suit }: { suit: Suit }) {
  switch (suit) {
    case "spades":
      return <path d="M12 1.5C9.2 5.8 3 9.1 3 14a4.6 4.6 0 0 0 8.1 3c-.2 2.3-1 4-2.7 5.5h7.2c-1.7-1.5-2.5-3.2-2.7-5.5A4.6 4.6 0 0 0 21 14c0-4.9-6.2-8.2-9-12.5Z" />;
    case "hearts":
      return <path d="M12 21.6C10.4 19.6 2.5 14.5 2.5 8.6a4.9 4.9 0 0 1 9.5-2.4 4.9 4.9 0 0 1 9.5 2.4c0 5.9-7.9 11-9.5 13Z" />;
    case "diamonds":
      return <path d="M12 1.5c2.2 3.9 5.2 7.4 8.5 10.5-3.3 3.1-6.3 6.6-8.5 10.5C9.8 18.6 6.8 15.1 3.5 12 6.8 8.9 9.8 5.4 12 1.5Z" />;
    case "clubs":
      return (
        <>
          <circle cx="12" cy="6.6" r="4.4" />
          <circle cx="6.9" cy="13.4" r="4.4" />
          <circle cx="17.1" cy="13.4" r="4.4" />
          <path d="M10 9h4v6h-4z" />
          <path d="M11 13.5h2c.2 3.5 1.2 6.2 3.4 9H7.6c2.2-2.8 3.2-5.5 3.4-9Z" />
        </>
      );
  }
}

export function SuitPip({ suit, className, color }: { suit: Suit; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={color || "currentColor"} aria-hidden="true">
      <SuitShape suit={suit} />
    </svg>
  );
}

/** Shared SVG defs (embossed ivory) — rendered once by the window. */
export const IVORY_FILL = "url(#kosynka-ivory-stars)";
export function DeckDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="kosynka-ivory-stars" width="5" height="5" patternUnits="userSpaceOnUse">
          <rect width="5" height="5" fill={DECK.ivory} />
          <path d="M2.5 1.1 3 2 3.9 2.5 3 3 2.5 3.9 2 3 1.1 2.5 2 2Z" fill={DECK.ivoryShade} opacity=".75" />
        </pattern>
        <linearGradient id="kosynka-ivory-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".55" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Standard pip positions on the 100×140 face; pips in the lower half are inverted.
const L = 34, C = 50, R = 66;
const T = 34, B = 106; // top / bottom pip rows
const PIP_LAYOUT: Record<number, Array<[number, number]>> = {
  2: [[C, T], [C, B]],
  3: [[C, T], [C, 70], [C, B]],
  4: [[L, T], [R, T], [L, B], [R, B]],
  5: [[L, T], [R, T], [C, 70], [L, B], [R, B]],
  6: [[L, T], [R, T], [L, 70], [R, 70], [L, B], [R, B]],
  7: [[L, T], [R, T], [C, 52], [L, 70], [R, 70], [L, B], [R, B]],
  8: [[L, T], [R, T], [C, 52], [L, 70], [R, 70], [C, 88], [L, B], [R, B]],
  9: [[L, T], [R, T], [L, 58], [R, 58], [C, 70], [L, 82], [R, 82], [L, B], [R, B]],
  10: [[L, T], [R, T], [C, 46], [L, 58], [R, 58], [L, 82], [R, 82], [C, 94], [L, B], [R, B]],
};
const PIP_SIZE: Record<number, number> = { 2: 24, 3: 24, 4: 24, 5: 23, 6: 23, 7: 22, 8: 22, 9: 21, 10: 20 };

function Pip({ suit, x, y, size, flip = false }: { suit: Suit; x: number; y: number; size: number; flip?: boolean }) {
  const s = size / 24;
  return (
    <g transform={`translate(${x} ${y}) rotate(${flip ? 180 : 0}) scale(${s}) translate(-12 -12)`}>
      <g fill="#000" opacity=".28" transform={`translate(0 ${flip ? -0.9 : 0.9})`}><SuitShape suit={suit} /></g>
      <g fill={IVORY_FILL}><SuitShape suit={suit} /></g>
      <g fill="url(#kosynka-ivory-sheen)"><SuitShape suit={suit} /></g>
    </g>
  );
}

const COURT_NAMES: Record<number, string> = { 11: "J", 12: "Q", 13: "K" };

/** Face artwork on a 100×140 grid (cards are exactly 5:7). Indices are HTML. */
export function CardArt({ rank, suit }: { rank: Rank; suit: Suit }) {
  if (rank === 1) {
    return (
      <svg viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="50" cy="70" r="33" fill="none" stroke={DECK.ivory} strokeWidth=".8" opacity=".55" />
        <circle cx="50" cy="70" r="36.5" fill="none" stroke={DECK.ivory} strokeWidth=".4" opacity=".35" />
        <Pip suit={suit} x={50} y={70} size={46} />
      </svg>
    );
  }
  if (rank > 10) {
    const tone = suitTone(suit);
    return (
      <svg viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
        <rect x="23" y="24" width="54" height="92" rx="6" fill={tone.dark} opacity=".55" />
        <rect x="23" y="24" width="54" height="92" rx="6" fill="none" stroke={DECK.ivory} strokeWidth="1" />
        <rect x="26.5" y="27.5" width="47" height="85" rx="4" fill="none" stroke={DECK.ivory} strokeWidth=".45" opacity=".6" />
        <path d="M50 19.5 53 24 50 28.5 47 24Z M50 111.5 53 116 50 120.5 47 116Z" fill={DECK.ivory} />
        <text
          x="50"
          y="76"
          textAnchor="middle"
          fill={IVORY_FILL}
          style={{ fontFamily: "var(--font-display), Georgia, serif", fontSize: 40, fontWeight: 600 }}
        >
          {COURT_NAMES[rank]}
        </text>
        <Pip suit={suit} x={50} y={95} size={15} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 100 140" preserveAspectRatio="none" aria-hidden="true">
      {PIP_LAYOUT[rank].map(([x, y], i) => (
        <Pip key={i} suit={suit} x={x} y={y} size={PIP_SIZE[rank]} flip={y > 70} />
      ))}
    </svg>
  );
}

/** Monogram for the back and the window header. */
export function DeckMonogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="19" fill={DECK.midnight.base} stroke={DECK.gold} strokeWidth="1" />
      <circle cx="20" cy="20" r="15.5" fill="none" stroke={DECK.gold} strokeWidth=".5" opacity=".7" />
      <g transform="translate(20 20) scale(.62) translate(-12 -12)" fill={DECK.gold}>
        <SuitShape suit="spades" />
      </g>
    </svg>
  );
}
