"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocale, type Locale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { reachGoal } from "@/lib/analytics";
import styles from "./floating-language-bar.module.css";

const STORAGE_KEY = "xp-floating-lang-minimized";

export function FloatingLanguageBar() {
  const { locale, setLocale, tr } = useLocale();
  const [minimized, setMinimized] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const dragStart = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const barRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sync minimized state with localStorage and external events (e.g. from tray)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "1") setMinimized(true);
    } catch {}

    const handleRestore = () => {
      setMinimized(false);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    };

    window.addEventListener("xp-restore-lang-bar", handleRestore);
    return () => window.removeEventListener("xp-restore-lang-bar", handleRestore);
  }, []);

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node) && !barRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleSwitch = useCallback(
    (target: Locale) => {
      if (target === locale) return;
      xpSound.click();
      reachGoal("floating_lang_switch", { from: locale, to: target });
      setLocale(target);
    },
    [locale, setLocale]
  );

  const handleMinimize = useCallback(() => {
    xpSound.minimize();
    setMinimized(true);
    setMenuOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
    window.dispatchEvent(new CustomEvent("xp-lang-bar-minimized"));
  }, []);

  const handleResetPosition = useCallback(() => {
    setDragOffset(null);
    setMenuOpen(false);
  }, []);

  // Dragging logic for desktop
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    // Don't drag on mobile
    if (window.innerWidth < 768) return;
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragStart.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: dragOffset?.x ?? 0,
      initialY: dragOffset?.y ?? 0,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.startX;
    const dy = e.clientY - dragStart.current.startY;
    const newX = dragStart.current.initialX + dx;
    const newY = Math.max(0, Math.min(window.innerHeight - 50, dragStart.current.initialY + dy));
    setDragOffset({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    // If released near top edge (within 25px), snap back to top edge
    if (dragOffset && dragOffset.y < 25) {
      setDragOffset(prev => (prev ? { x: prev.x, y: 0 } : null));
    }
  };

  if (minimized) return null;

  const dynamicStyle: React.CSSProperties = {
    cursor: xpCursors.default,
    ...(dragOffset
      ? {
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
          right: "88px",
        }
      : {}),
  };

  return (
    <div
      ref={barRef}
      className={styles.bar}
      style={dynamicStyle}
      role="toolbar"
      aria-label={tr("Языковая панель Windows XP", "Windows XP Language Bar")}
    >
      {/* Authentic XP Drag Grip */}
      <div
        className={styles.grip}
        title={tr("Перетащите или дважды кликните для возврата наверх", "Drag to move or double-click to reset")}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onDoubleClick={handleResetPosition}
        style={{ cursor: xpCursors.move || "grab" }}
      >
        <div className={styles.gripCol}>
          <div className={styles.gripDot} />
          <div className={styles.gripDot} />
          <div className={styles.gripDot} />
        </div>
        <div className={styles.gripCol}>
          <div className={styles.gripDot} />
          <div className={styles.gripDot} />
          <div className={styles.gripDot} />
        </div>
      </div>

      {/* Globe micro-icon */}
      <div className={styles.globeIcon} aria-hidden="true" title={tr("Язык интерфейса", "Interface language")}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="#ffffff" strokeWidth="1.2" fill="#1b5ec8" />
          <ellipse cx="8" cy="8" rx="3.2" ry="6.5" stroke="#ffffff" strokeWidth="1" />
          <line x1="1.5" y1="8" x2="14.5" y2="8" stroke="#ffffff" strokeWidth="1" />
          <line x1="3" y1="4.5" x2="13" y2="4.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />
          <line x1="3" y1="11.5" x2="13" y2="11.5" stroke="#ffffff" strokeWidth="0.8" opacity="0.85" />
        </svg>
      </div>

      {/* Tactile EN / RU Buttons */}
      <div className={styles.buttons} role="group" aria-label={tr("Выбор языка", "Select language")}>
        <button
          type="button"
          onClick={() => handleSwitch("en")}
          className={`${styles.langBtn} ${locale === "en" ? styles.active : ""}`}
          style={{ cursor: xpCursors.pointer }}
          title={tr("Переключить на английский", "Switch to English")}
          aria-pressed={locale === "en"}
        >
          EN
          {locale === "en" && <span className={styles.activeDot} aria-hidden="true" />}
        </button>

        <button
          type="button"
          onClick={() => handleSwitch("ru")}
          className={`${styles.langBtn} ${locale === "ru" ? styles.active : ""}`}
          style={{ cursor: xpCursors.pointer }}
          title={tr("Переключить на русский", "Switch to Russian")}
          aria-pressed={locale === "ru"}
        >
          RU
          {locale === "ru" && <span className={styles.activeDot} aria-hidden="true" />}
        </button>
      </div>

      {/* Desktop XP micro controls */}
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.ctrlBtn}
          title={tr("Свернуть в панель задач (трей)", "Minimize to taskbar notification area")}
          onClick={handleMinimize}
          style={{ cursor: xpCursors.pointer }}
          aria-label={tr("Свернуть в трей", "Minimize to tray")}
        >
          <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
            <line x1="1" y1="6" x2="7" y2="6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        <button
          type="button"
          className={styles.ctrlBtn}
          title={tr("Параметры языковой панели", "Language bar options")}
          onClick={() => setMenuOpen(prev => !prev)}
          style={{ cursor: xpCursors.pointer }}
          aria-label={tr("Параметры", "Options")}
          aria-expanded={menuOpen}
        >
          <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 2.5L4 5L6.5 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Options Dropdown Menu */}
      {menuOpen && (
        <div ref={menuRef} className={styles.menu} role="menu">
          <button
            type="button"
            className={styles.menuItem}
            onClick={handleResetPosition}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>✓</span>
            <span>{tr("Закрепить у верхнего края", "Dock to top edge")}</span>
          </button>
          <button
            type="button"
            className={styles.menuItem}
            onClick={handleMinimize}
            style={{ cursor: xpCursors.pointer }}
          >
            <span>_</span>
            <span>{tr("Свернуть в трей", "Minimize to tray")}</span>
          </button>
          <div className={styles.menuDivider} />
          <div className="px-2.5 py-1 text-slate-500 text-[10px]">
            {tr("Быстрое переключение: Alt+Shift", "Quick switch: Alt+Shift")}
          </div>
        </div>
      )}
    </div>
  );
}
