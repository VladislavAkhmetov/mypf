import React from "react";
import type { ToolPlatform } from "@/data/tools";

// Windows XP–style file and toolbar icons (Luna: soft gradients, 1px dark outline).

function Page({ id, children }: { id: string; children?: React.ReactNode }) {
  return (
    <>
      <defs>
        <linearGradient id={`${id}-page`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dfe7f3" />
        </linearGradient>
        <linearGradient id={`${id}-fold`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#b9c8de" />
        </linearGradient>
      </defs>
      <path d="M9 3h21l10 10v31H9z" fill="#000" opacity=".12" transform="translate(1.5 1.5)" />
      <path d="M9 3h21l10 10v31H9z" fill={`url(#${id}-page)`} stroke="#7a8ca8" strokeWidth="1" />
      <path d="M30 3v10h10" fill={`url(#${id}-fold)`} stroke="#7a8ca8" strokeWidth="1" strokeLinejoin="round" />
      {children}
    </>
  );
}

export function ToolFileIcon({ platform, size = 48 }: { platform: ToolPlatform; size?: number }) {
  const id = `tfi-${platform}`;
  let badge: React.ReactNode;
  if (platform === "figma") {
    // Plug-in: a puzzle piece.
    badge = (
      <>
        <defs>
          <linearGradient id={`${id}-pz`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#c08bff" />
            <stop offset="1" stopColor="#7b3fe4" />
          </linearGradient>
        </defs>
        <path d="M16 24h5a3.2 3.2 0 1 1 6 0h5v5a3.2 3.2 0 1 1 0 6v5H16v-5a3.2 3.2 0 1 0 0-6z" fill={`url(#${id}-pz)`} stroke="#4b1fa0" strokeWidth="1" strokeLinejoin="round" />
        <path d="M18 26h3" stroke="#fff" strokeOpacity=".6" strokeWidth="1.2" strokeLinecap="round" />
      </>
    );
  } else if (platform === "illustrator") {
    // Script: gear over the page with a code line.
    badge = (
      <>
        <defs>
          <radialGradient id={`${id}-g`} cx=".35" cy=".3" r=".8">
            <stop offset="0" stopColor="#ffe08a" />
            <stop offset="1" stopColor="#d98a00" />
          </radialGradient>
        </defs>
        <path d="M14 18h14M14 22h10M14 26h12" stroke="#7a8ca8" strokeWidth="1.4" strokeLinecap="round" />
        <g transform="translate(29 33)">
          <path d="M-1.6-9h3.2l.7 2.6 2.4 1 2.3-1.4 2.3 2.3-1.4 2.3 1 2.4 2.6.7v3.2l-2.6.7-1 2.4 1.4 2.3-2.3 2.3-2.3-1.4-2.4 1-.7 2.6h-3.2l-.7-2.6-2.4-1-2.3 1.4-2.3-2.3 1.4-2.3-1-2.4-2.6-.7v-3.2l2.6-.7 1-2.4-1.4-2.3 2.3-2.3 2.3 1.4 2.4-1z" fill={`url(#${id}-g)`} stroke="#8a5300" strokeWidth=".9" strokeLinejoin="round" />
          <circle r="3" fill="#fff6d6" stroke="#8a5300" strokeWidth=".9" />
        </g>
      </>
    );
  } else if (platform === "web") {
    // Web page: blue globe.
    badge = (
      <>
        <defs>
          <radialGradient id={`${id}-gl`} cx=".35" cy=".3" r=".85">
            <stop offset="0" stopColor="#bfe3ff" />
            <stop offset=".55" stopColor="#3b8de6" />
            <stop offset="1" stopColor="#1349a8" />
          </radialGradient>
        </defs>
        <circle cx="25" cy="31" r="10" fill={`url(#${id}-gl)`} stroke="#0d3a85" strokeWidth="1" />
        <path d="M15.5 31h19M25 21c-3.5 3-3.5 17 0 20M25 21c3.5 3 3.5 17 0 20M17.5 25.5h15M17.5 36.5h15" fill="none" stroke="#e8f4ff" strokeOpacity=".75" strokeWidth=".9" />
        <path d="M19 26c2 1 3 0 4 2s-1 3 1 4 3-1 4 1" fill="none" stroke="#3fae3f" strokeWidth="2.2" strokeLinecap="round" opacity=".9" />
      </>
    );
  } else {
    // Template: blueprint grid.
    badge = (
      <>
        <rect x="14" y="19" width="22" height="20" fill="#2f6fd0" stroke="#163f86" strokeWidth="1" />
        <path d="M14 24h22M14 29h22M14 34h22M19.5 19v20M25 19v20M30.5 19v20" stroke="#cfe2ff" strokeOpacity=".55" strokeWidth=".7" />
        <path d="M17 36l6-11 5 7 3-4 4 8" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
      </>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <Page id={id}>{badge}</Page>
    </svg>
  );
}

export function FolderIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <defs>
        <linearGradient id="xp-folder" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe9a6" />
          <stop offset="1" stopColor="#f2c14e" />
        </linearGradient>
      </defs>
      <path d="M1 3.5h5l1.2 1.5H15v8.5H1z" fill="url(#xp-folder)" stroke="#b98a1f" strokeWidth=".8" />
      <path d="M1 6h14" stroke="#fff6d8" strokeWidth=".8" />
    </svg>
  );
}

type ToolbarGlyph = "back" | "forward" | "up" | "search" | "folders" | "views";

export function ToolbarGlyphIcon({ name }: { name: ToolbarGlyph }) {
  if (name === "back" || name === "forward") {
    const flip = name === "forward";
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <defs>
          <radialGradient id={`xp-nav-${name}`} cx=".35" cy=".3" r=".9">
            <stop offset="0" stopColor="#b9f0a6" />
            <stop offset=".6" stopColor="#3fae3f" />
            <stop offset="1" stopColor="#1d6e1d" />
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="10" fill={`url(#xp-nav-${name})`} stroke="#195c19" strokeWidth="1" />
        <path d={flip ? "M9 7l5 5-5 5M14 12H6" : "M15 7l-5 5 5 5M10 12h8"} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "up") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M2 7h7l2 2h11v12H2z" fill="#f2c14e" stroke="#b98a1f" strokeWidth="1" />
        <path d="M12 19v-7M8.5 15l3.5-3.5 3.5 3.5" fill="none" stroke="#1d6e1d" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "search") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10" cy="10" r="6.5" fill="#d8ecff" stroke="#3a5f8f" strokeWidth="1.6" />
        <path d="M7 8a3.5 3.5 0 0 1 3-2" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" fill="none" />
        <path d="M15 15l6 6" stroke="#6b4a1f" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "folders") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 5h6l2 2h10v12H3z" fill="#f2c14e" stroke="#b98a1f" strokeWidth="1" />
        <path d="M3 9h18" stroke="#fff6d8" strokeWidth="1" />
        <path d="M6 13h5M6 16h8" stroke="#8a6a1f" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="4" width="8" height="7" fill="#7aa7e8" stroke="#2a5aa8" />
      <rect x="13" y="4" width="8" height="7" fill="#7aa7e8" stroke="#2a5aa8" />
      <rect x="3" y="13" width="8" height="7" fill="#7aa7e8" stroke="#2a5aa8" />
      <rect x="13" y="13" width="8" height="7" fill="#7aa7e8" stroke="#2a5aa8" />
    </svg>
  );
}
