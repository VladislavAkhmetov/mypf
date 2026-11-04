"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocale, type Locale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

const NOTICE_KEY = "amazi-locale-notice";

const languages: Array<{ code: Locale; name: string }> = [
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
];

function noticeSeen() {
  try {
    return window.localStorage.getItem(NOTICE_KEY) === "1";
  } catch {
    return true;
  }
}

function markNoticeSeen() {
  try {
    window.localStorage.setItem(NOTICE_KEY, "1");
  } catch {
    /* ignore */
  }
}

/**
 * The Windows XP language bar: a "RU"/"EN" tile in the tray that opens a short menu.
 * When the language was guessed from the browser, a one-time balloon says so and offers the other language.
 */
export function LanguageBar() {
  const { locale, source, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const [balloon, setBalloon] = useState(false);
  const [anchor, setAnchor] = useState<{ right: number; bottom: number; center: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const measure = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    setAnchor({
      right: Math.max(6, window.innerWidth - rect.right - 4),
      bottom: window.innerHeight - rect.top + 6,
      center: window.innerWidth - (rect.left + rect.width / 2),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open && !balloon) return;
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, balloon, measure]);

  // One-time balloon for a language we picked on the visitor's behalf.
  useEffect(() => {
    if (source !== "detected" || locale !== "en" || noticeSeen()) return;
    const show = window.setTimeout(() => {
      markNoticeSeen();
      xpSound.balloon();
      setBalloon(true);
    }, 2600);
    return () => window.clearTimeout(show);
  }, [source, locale]);

  useEffect(() => {
    if (!balloon) return;
    const hide = window.setTimeout(() => setBalloon(false), 16000);
    return () => window.clearTimeout(hide);
  }, [balloon]);

  // Menu: focus the checked item, close on outside click or Escape, arrows move between items.
  useEffect(() => {
    if (!open) return;
    const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>("[role='menuitemradio']") ?? []);
    requestAnimationFrame(() => items().find(item => item.getAttribute("aria-checked") === "true")?.focus());
    const onPointer = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!menuRef.current?.contains(target) && !buttonRef.current?.contains(target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const list = items();
        const index = list.indexOf(document.activeElement as HTMLButtonElement);
        const next = (index + (event.key === "ArrowDown" ? 1 : -1) + list.length) % list.length;
        list[next]?.focus();
      }
    };
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const choose = (code: Locale) => {
    xpSound.click();
    setLocale(code);
    setOpen(false);
    setBalloon(false);
    buttonRef.current?.focus();
  };

  const other = locale === "en" ? "ru" : "en";
  // Any explicit choice (menu, landing switch, Alt+Shift) retires the balloon.
  const showBalloon = balloon && source !== "saved";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        data-ym-goal="tray_language_menu"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={locale === "ru" ? "Язык: русский. Сменить язык" : "Language: English. Change language"}
        title={locale === "ru" ? "Язык (Alt+Shift)" : "Language (Alt+Shift)"}
        onClick={() => {
          xpSound.click();
          setBalloon(false);
          setOpen(value => !value);
        }}
        className="xp-tray-lang"
        style={{ cursor: xpCursors.pointer }}
      >
        {locale.toUpperCase()}
      </button>

      {open && anchor && (
        <div
          ref={menuRef}
          role="menu"
          aria-label={locale === "ru" ? "Язык интерфейса" : "Interface language"}
          className="xp-lang-menu"
          style={{ right: anchor.right, bottom: anchor.bottom }}
        >
          {languages.map(item => (
            <button
              key={item.code}
              type="button"
              role="menuitemradio"
              aria-checked={locale === item.code}
              onClick={() => choose(item.code)}
              className="xp-lang-item"
              style={{ cursor: xpCursors.pointer }}
            >
              <span className="xp-lang-check" aria-hidden="true">{locale === item.code ? "✓" : ""}</span>
              <span className="xp-lang-tile" aria-hidden="true">{item.code.toUpperCase()}</span>
              <span lang={item.code}>{item.name}</span>
            </button>
          ))}
          <div className="xp-lang-hint" aria-hidden="true">Alt+Shift</div>
        </div>
      )}

      {showBalloon && anchor && (
        <div
          role="status"
          className="xp-lang-balloon"
          style={{ right: anchor.right, bottom: anchor.bottom + 6, "--tail": `${Math.max(14, anchor.center - anchor.right - 7)}px` } as React.CSSProperties}
        >
          <div className="xp-balloon-header">
            <span className="flex items-center gap-1.5 text-blue-900">
              <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="7.5" fill="#2f6fd6" /><rect x="7" y="7" width="2" height="5" rx="1" fill="#fff" /><circle cx="8" cy="4.6" r="1.1" fill="#fff" /></svg>
              <span>English it is</span>
            </span>
            <button type="button" className="xp-balloon-close text-slate-500 hover:text-black" aria-label="Close" onClick={() => setBalloon(false)} style={{ cursor: xpCursors.pointer }}>✕</button>
          </div>
          <p className="text-slate-800 leading-snug">
            We picked English based on your browser language. Change it here any time or press Alt+Shift.
          </p>
          <button type="button" lang={other} className="xp-lang-switch" onClick={() => choose(other)} style={{ cursor: xpCursors.pointer }}>
            Переключить на русский
          </button>
        </div>
      )}
    </>
  );
}
