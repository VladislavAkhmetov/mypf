import React from "react";
import type { HelpSandbox } from "@/data/help-topics";

// 32px topic icons in the Windows XP Help and Support style.
export function TopicIcon({ kind, size = 32 }: { kind: HelpSandbox; size?: number }) {
  if (kind === "nodes") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <path d="M10 9c6 0 6 7 12 7M10 23c6 0 6-7 12-7" fill="none" stroke="#2a5aa8" strokeWidth="1.6" />
        <rect x="2" y="5" width="9" height="8" rx="1.5" fill="#7fb4ff" stroke="#1d4fa6" />
        <rect x="2" y="19" width="9" height="8" rx="1.5" fill="#9be07a" stroke="#2f7a2c" />
        <rect x="21" y="12" width="9" height="8" rx="1.5" fill="#ffd166" stroke="#a6740a" />
      </svg>
    );
  }
  if (kind === "autolayout") {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="3" y="4" width="26" height="24" rx="2" fill="#fff" stroke="#7b61ff" strokeWidth="1.4" strokeDasharray="3 2" />
        <rect x="7" y="8" width="18" height="4" rx="1" fill="#a78bfa" />
        <rect x="7" y="14" width="18" height="4" rx="1" fill="#c4b5fd" />
        <rect x="7" y="20" width="11" height="4" rx="1" fill="#ddd6fe" />
        <path d="M5 13h2M5 19h2" stroke="#f24822" strokeWidth="1.2" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 5h24a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H14l-6 5v-5H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill="#fff8d6" stroke="#b08a1a" strokeWidth="1.2" />
      <path d="M7 10h18M7 14h14M7 18h9" stroke="#8a6a1f" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="25" cy="18" r="4.5" fill="#3fae3f" stroke="#1d6e1d" />
      <path d="M23 18l1.5 1.5L27 16.5" fill="none" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function NavArrow({ dir }: { dir: "back" | "forward" }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <radialGradient id={`help-nav-${dir}`} cx=".35" cy=".3" r=".9">
          <stop offset="0" stopColor="#b9f0a6" />
          <stop offset=".6" stopColor="#3fae3f" />
          <stop offset="1" stopColor="#1d6e1d" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill={`url(#help-nav-${dir})`} stroke="#195c19" />
      <path d={dir === "forward" ? "M9 7l5 5-5 5M14 12H6" : "M15 7l-5 5 5 5M10 12h8"} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 12 12 4l9 8" fill="none" stroke="#a33" strokeWidth="2" strokeLinejoin="round" />
      <path d="M6 11v9h4.5v-5h3v5H18v-9" fill="#f6e3b4" stroke="#7a5d14" strokeWidth="1.2" />
    </svg>
  );
}
