import React from "react";

export const PULSE_COLORS = {
  bg: "#0B1127",
  casing: "#172244",
  casingBorder: "#273766",
  cellClosed: "#405DE8",
  cellBevel: "#2B44BA",
  cellHighlight: "#728AFF",
  cellOpen: "#202E53",
  cellOpenBorder: "#182442",
  text: "#F4F7FF",
  flag: "#FF6B81",
  revealAccent: "#57E4FF",
  victory: "#C3F66A",
};

export const NUMBER_COLORS: Record<number, string> = {
  1: "#79D7FF", // Bright Sky Cyan
  2: "#ABEA91", // Soft Lime Green
  3: "#FF93AA", // Coral Rose
  4: "#C8B3FF", // Electric Lavender
  5: "#FFC58F", // Warm Amber
  6: "#7CF0DF", // Seafoam Mint
  7: "#F3F6FF", // Crisp White
  8: "#D3DCF0", // Slate Silver
};

// Author Vector Mascot with 4 Expressive States
export function MascotFace({
  state,
  isPressing,
  className = "w-10 h-10",
}: {
  state: "ready" | "playing" | "won" | "lost";
  isPressing: boolean;
  className?: string;
}) {
  // Eye and Mouth expressions
  if (state === "won") {
    // Joy / Cool Sunglasses
    return (
      <svg viewBox="0 0 40 40" className={className}>
        <circle cx="20" cy="20" r="18" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        {/* Cool Sunglasses */}
        <polygon points="7,14 18,14 16,21 8,21" fill="#0F172A" />
        <polygon points="22,14 33,14 32,21 24,21" fill="#0F172A" />
        <line x1="17" y1="16" x2="23" y2="16" stroke="#0F172A" strokeWidth="2" />
        {/* Glare on glasses */}
        <line x1="9" y1="16" x2="14" y2="16" stroke="#57E4FF" strokeWidth="1" strokeLinecap="round" />
        <line x1="24" y1="16" x2="29" y2="16" stroke="#57E4FF" strokeWidth="1" strokeLinecap="round" />
        {/* Big Smile */}
        <path d="M 12 25 Q 20 33 28 25" fill="none" stroke="#92400E" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (state === "lost") {
    // Scorched / X_X eyes / dizzy
    return (
      <svg viewBox="0 0 40 40" className={className}>
        <circle cx="20" cy="20" r="18" fill="#F87171" stroke="#DC2626" strokeWidth="1.5" />
        {/* Left X eye */}
        <line x1="10" y1="13" x2="16" y2="19" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="16" y1="13" x2="10" y2="19" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        {/* Right X eye */}
        <line x1="24" y1="13" x2="30" y2="19" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="30" y1="13" x2="24" y2="19" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
        {/* Sad Wavy Mouth */}
        <path d="M 13 28 Q 17 24 20 28 Q 23 32 27 28" fill="none" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (isPressing) {
    // Tensed / Holding breath / Round O mouth
    return (
      <svg viewBox="0 0 40 40" className={className}>
        <circle cx="20" cy="20" r="18" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
        {/* Wide Alert Eyes */}
        <circle cx="13" cy="16" r="3.5" fill="#1E293B" />
        <circle cx="27" cy="16" r="3.5" fill="#1E293B" />
        <circle cx="12" cy="15" r="1" fill="#FFFFFF" />
        <circle cx="26" cy="15" r="1" fill="#FFFFFF" />
        {/* Surprise O Mouth */}
        <circle cx="20" cy="27" r="3.5" fill="#92400E" />
      </svg>
    );
  }

  // Normal / Calm confident smile
  return (
    <svg viewBox="0 0 40 40" className={className}>
      <circle cx="20" cy="20" r="18" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.5" />
      {/* Calm Eyes */}
      <circle cx="13" cy="16" r="2.5" fill="#1E293B" />
      <circle cx="27" cy="16" r="2.5" fill="#1E293B" />
      {/* Friendly Smile */}
      <path d="M 13 24 Q 20 30 27 24" fill="none" stroke="#92400E" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// 3D Volumetric Coral Flag Icon
export function FlagIcon({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      {/* Base */}
      <ellipse cx="12" cy="21" rx="6" ry="1.8" fill="#1E293B" opacity="0.6" />
      <path d="M 8 20 L 16 20 L 14 18 L 10 18 Z" fill="#94A3B8" />
      {/* Pole */}
      <line x1="12" y1="4" x2="12" y2="18" stroke="#F1F5F9" strokeWidth="2" strokeLinecap="round" />
      {/* Pennant Flag */}
      <path
        d="M 12 4 L 3 8.5 L 12 13 Z"
        fill="#FF6B81"
        stroke="#E11D48"
        strokeWidth="0.8"
      />
      {/* Gold Finial */}
      <circle cx="12" cy="3" r="1.5" fill="#FACC15" />
    </svg>
  );
}

// Volumetric Spiked Mine Icon
export function MineIcon({
  isExploded = false,
  className = "w-5 h-5",
  style,
}: {
  isExploded?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const coreFill = isExploded ? "#EF4444" : "#0F172A";
  const spikeColor = isExploded ? "#B91C1C" : "#334155";

  return (
    <svg viewBox="0 0 24 24" className={className} style={style}>
      {/* Spikes */}
      <line x1="12" y1="2" x2="12" y2="22" stroke={spikeColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="2" y1="12" x2="22" y2="12" stroke={spikeColor} strokeWidth="2.2" strokeLinecap="round" />
      <line x1="5" y1="5" x2="19" y2="19" stroke={spikeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="19" y1="5" x2="5" y2="19" stroke={spikeColor} strokeWidth="2" strokeLinecap="round" />

      {/* Main Core Sphere */}
      <circle cx="12" cy="12" r="6.5" fill={coreFill} />
      {/* Highlight Glint */}
      <circle cx="10" cy="10" r="1.8" fill={isExploded ? "#FCA5A5" : "#64748B"} />
    </svg>
  );
}

// Misplaced Flag Icon (Crossed-out Red X)
export function MisflaggedIcon({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={style}>
      <MineIcon className="w-full h-full opacity-60" />
      <svg viewBox="0 0 24 24" className="absolute inset-0 w-full h-full">
        <line x1="4" y1="4" x2="20" y2="20" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
        <line x1="20" y1="4" x2="4" y2="20" stroke="#EF4444" strokeWidth="2.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}
