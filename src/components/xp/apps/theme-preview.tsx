"use client";

import React, { type CSSProperties } from "react";
import type { XpTheme } from "../window-manager-context";
import { DEFAULT_WALLPAPER_SRC } from "@/lib/xp/wallpapers";
import { useLocale } from "@/lib/i18n";

// A miniature desktop drawn with the real theme tokens from src/styles/xp.css.
// The `data-xp-theme` attribute scopes the CSS variables, so the preview can never drift from the actual theme.
// All sizes are in cqw (percent of the preview's own width), so it scales to any card or monitor.

const u = (n: number) => `${n}cqw`;

interface CaptionStyle {
  background: string;
  border: string;
  radius: string;
  color: string;
  closeBackground: string;
  closeColor: string;
}

const captions: Record<XpTheme, CaptionStyle> = {
  "luna-blue": {
    background: "linear-gradient(180deg, #5b9bf8 0%, #2a64e0 55%, #1b4fc8 100%)",
    border: "1px solid #ffffffcc",
    radius: u(0.9),
    color: "#fff",
    closeBackground: "linear-gradient(180deg, #e8866a 0%, #d2431f 55%, #b8300f 100%)",
    closeColor: "#fff",
  },
  "luna-silver": {
    background: "linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 55%, #94a3b8 100%)",
    border: "1px solid #ffffffcc",
    radius: u(0.9),
    color: "#334155",
    closeBackground: "linear-gradient(180deg, #f4a193 0%, #dc5a46 55%, #b83a28 100%)",
    closeColor: "#fff",
  },
  classic: {
    background: "#d4d0c8",
    border: "1px solid",
    radius: "0",
    color: "#000",
    closeBackground: "#d4d0c8",
    closeColor: "#000",
  },
  "royale-noir": {
    background: "linear-gradient(180deg, #334155 0%, #1e293b 100%)",
    border: "1px solid #38bdf8aa",
    radius: u(0.9),
    color: "#e2e8f0",
    closeBackground: "linear-gradient(180deg, #e11d48 0%, #9f1239 100%)",
    closeColor: "#fff",
  },
};

function Caption({ theme, glyph, close }: { theme: XpTheme; glyph: "min" | "max" | "close"; close?: boolean }) {
  const c = captions[theme];
  const classic = theme === "classic";
  const style: CSSProperties = {
    width: u(4.6),
    height: u(4.2),
    background: close ? c.closeBackground : c.background,
    color: close ? c.closeColor : c.color,
    border: c.border,
    borderRadius: c.radius,
    ...(classic ? { borderColor: "#fff #404040 #404040 #fff" } : null),
    display: "grid",
    placeItems: "center",
    flex: "none",
  };
  return (
    <span style={style}>
      {glyph === "min" && <i style={{ width: u(2), height: u(0.6), background: "currentColor", transform: `translateY(${u(0.9)})` }} />}
      {glyph === "max" && <i style={{ width: u(2), height: u(1.8), border: `${u(0.35)} solid currentColor`, borderTopWidth: u(0.7) }} />}
      {glyph === "close" && (
        <svg viewBox="0 0 10 10" width={u(2.2)} height={u(2.2)} aria-hidden="true">
          <path d="M1.5 1.5l7 7M8.5 1.5l-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      )}
    </span>
  );
}

function Frame({ theme, active, style, children }: { theme: XpTheme; active: boolean; style: CSSProperties; children?: React.ReactNode }) {
  const classic = theme === "classic";
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        padding: u(0.7),
        background: active ? "var(--xp-titlebar-border)" : "var(--xp-titlebar-inactive-border)",
        borderRadius: classic ? 0 : `${u(1.2)} ${u(1.2)} 0 0`,
        boxShadow: `${u(0.3)} ${u(0.7)} ${u(1.8)} #0006`,
        ...(classic ? { background: "#d4d0c8", border: "1px solid", borderColor: "#fff #404040 #404040 #fff", padding: u(0.5) } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Titlebar({ theme, active, title, withControls }: { theme: XpTheme; active: boolean; title?: string; withControls: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: u(0.8),
        height: u(6.4),
        padding: `0 ${u(0.8)} 0 ${u(1.4)}`,
        background: active ? "var(--xp-titlebar-bg)" : "var(--xp-titlebar-inactive-bg)",
        color: active ? "var(--xp-titlebar-text)" : "var(--xp-titlebar-inactive-text)",
        textShadow: active ? "var(--xp-titlebar-text-shadow)" : "none",
        borderRadius: theme === "classic" ? 0 : `${u(1)} ${u(1)} 0 0`,
        fontSize: u(3),
        fontWeight: 700,
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <span style={{ width: u(2.6), height: u(2.6), borderRadius: u(0.5), background: "currentColor", opacity: 0.85, flex: "none" }} />
      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>{title}</span>
      {withControls && (
        <span style={{ display: "flex", gap: u(0.7) }}>
          <Caption theme={theme} glyph="min" />
          <Caption theme={theme} glyph="max" />
          <Caption theme={theme} glyph="close" close />
        </span>
      )}
    </div>
  );
}

export function ThemePreview({
  theme,
  wallpaper,
  detail = true,
  className,
}: {
  theme: XpTheme;
  wallpaper: string;
  /** Show text (large preview) or abstract bars (small thumbnails). */
  detail?: boolean;
  className?: string;
}) {
  const { tr } = useLocale();
  const classic = theme === "classic";
  const bar = (w: number, strong = false): CSSProperties => ({
    height: u(1.5),
    width: u(w),
    borderRadius: u(0.4),
    background: strong ? "var(--xp-select-blue)" : "#c9ced6",
  });

  return (
    <div
      data-xp-theme={theme}
      className={className}
      aria-hidden="true"
      style={{
        containerType: "inline-size",
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 10",
        overflow: "hidden",
        backgroundImage: wallpaper.startsWith("/") ? `url(${wallpaper}), url(${DEFAULT_WALLPAPER_SRC})` : wallpaper,
        backgroundSize: "cover",
        backgroundPosition: "center",
        fontFamily: "var(--xp-font)",
      }}
    >
      {/* Inactive window behind */}
      <Frame theme={theme} active={false} style={{ left: u(4), top: u(5), width: u(50), height: u(34) }}>
        <Titlebar theme={theme} active={false} title={detail ? tr("Проводник", "Explorer") : undefined} withControls={false} />
        <div style={{ flex: 1, background: "var(--xp-menu-bg)" }} />
      </Frame>

      {/* Active window */}
      <Frame theme={theme} active style={{ left: u(24), top: u(15), width: u(60), height: u(46) }}>
        <Titlebar theme={theme} active title={detail ? tr("Активное окно", "Active window") : undefined} withControls />
        <div style={{ height: u(4.4), display: "flex", alignItems: "center", gap: u(2.4), padding: `0 ${u(1.6)}`, background: "var(--xp-menu-bg)", fontSize: u(2.6), color: classic || theme === "royale-noir" ? (theme === "royale-noir" ? "#cbd5e1" : "#000") : "#222" }}>
          {detail ? <><span>{tr("Файл", "File")}</span><span>{tr("Вид", "View")}</span><span>{tr("Справка", "Help")}</span></> : <><i style={bar(5)} /><i style={bar(4)} /></>}
        </div>
        <div style={{ flex: 1, background: theme === "royale-noir" ? "#0f172a" : "#fff", padding: u(2), display: "flex", flexDirection: "column", gap: u(1.6) }}>
          <i style={{ ...bar(30, true), height: u(2.2) }} />
          <i style={{ ...bar(42), background: theme === "royale-noir" ? "#334155" : "#c9ced6" }} />
          <i style={{ ...bar(36), background: theme === "royale-noir" ? "#334155" : "#c9ced6" }} />
        </div>
      </Frame>

      {/* Taskbar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: u(8),
          display: "flex",
          alignItems: "stretch",
          gap: u(1.2),
          background: "var(--xp-taskbar-bg)",
          borderTop: `1px solid var(--xp-taskbar-border)`,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            padding: `0 ${u(3)} 0 ${u(2)}`,
            margin: classic ? `${u(0.8)} 0 ${u(0.8)} ${u(0.8)}` : 0,
            background: "var(--xp-start-btn-bg)",
            borderRadius: classic ? 0 : `0 ${u(2.4)} ${u(2.4)} 0`,
            boxShadow: classic ? "none" : "var(--xp-start-btn-shadow)",
            ...(classic ? { border: "1px solid", borderColor: "#fff #404040 #404040 #fff" } : null),
            color: classic ? "#000" : "#fff",
            fontSize: u(4.4),
            fontWeight: 800,
            fontStyle: classic ? "normal" : "italic",
            textShadow: classic ? "none" : "1px 1px 1px #0006",
            letterSpacing: "-0.02em",
          }}
        >
          {detail ? tr("Пуск", "start") : <i style={{ width: u(5), height: u(2), borderRadius: u(0.5), background: "currentColor", opacity: 0.9 }} />}
        </span>
        <span style={{ alignSelf: "center", width: u(15), height: u(5.4), background: "var(--xp-task-btn-focused-bg)", borderRadius: classic ? 0 : u(1), ...(classic ? { border: "1px solid", borderColor: "#404040 #fff #fff #404040" } : null) }} />
        <span style={{ alignSelf: "center", width: u(15), height: u(5.4), background: "var(--xp-task-btn-bg)", borderRadius: classic ? 0 : u(1), ...(classic ? { border: "1px solid", borderColor: "#fff #404040 #404040 #fff" } : null) }} />
        <span style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: `0 ${u(2)}`, background: "var(--xp-tray-bg)", borderLeft: "1px solid var(--xp-tray-border)", color: classic ? "#000" : "#fff", fontSize: u(3.2) }}>
          {detail ? "14:00" : <i style={{ width: u(6), height: u(1.6), borderRadius: u(0.4), background: "currentColor", opacity: 0.8 }} />}
        </span>
      </div>
    </div>
  );
}
