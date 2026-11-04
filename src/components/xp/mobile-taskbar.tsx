"use client";

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import { useWindowManager, type WindowItem } from "./window-manager-context";
import { useLocale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { WindowTypeIcon, shortWindowTitle } from "./window-icon";
import m from "./mobile-taskbar.module.css";
import { localizeTitle } from "@/lib/xp/window-titles";

/**
 * Phone taskbar: a strip of open windows. The active window sits in the centre, its neighbours
 * fade out at the edges. Swiping the strip switches windows once it settles; tapping the
 * active chip opens the window switcher.
 */
export function WindowStrip({ onOpenSwitcher }: { onOpenSwitcher: () => void }) {
  const { windows, activeWindowId, focusWindow } = useWindowManager();
  const { locale } = useLocale();
  const scroller = useRef<HTMLDivElement>(null);
  const latest = useRef({ windows, activeWindowId });
  useEffect(() => { latest.current = { windows, activeWindowId }; });

  const activeIndex = windows.findIndex(win => win.id === activeWindowId && !win.isMinimized);
  const pitchOf = (node: HTMLDivElement) => {
    const first = node.children[0] as HTMLElement | undefined, second = node.children[1] as HTMLElement | undefined;
    return first && second ? second.offsetLeft - first.offsetLeft : first ? first.offsetWidth : 1;
  };

  // Keep the active window centred (also when it changes from outside, e.g. a new window opens).
  const firstRun = useRef(true);
  useEffect(() => {
    const node = scroller.current;
    if (!node || activeIndex < 0) return;
    const left = activeIndex * pitchOf(node);
    if (Math.abs(node.scrollLeft - left) < 2) return;
    node.scrollTo({ left, behavior: firstRun.current ? "instant" : "smooth" });
    firstRun.current = false;
  }, [activeIndex, windows.length]);

  // Switch windows after the strip has stopped moving.
  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    let timer = 0;
    const settle = () => {
      const { windows: list, activeWindowId: active } = latest.current;
      const index = Math.round(node.scrollLeft / pitchOf(node));
      const target = list[Math.max(0, Math.min(list.length - 1, index))];
      if (target && (target.id !== active || target.isMinimized)) { xpSound.click(); focusWindow(target.id); }
    };
    const onScroll = () => { window.clearTimeout(timer); timer = window.setTimeout(settle, 150); };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => { node.removeEventListener("scroll", onScroll); window.clearTimeout(timer); };
  }, [focusWindow]);

  if (windows.length === 0) return <div className={m.strip} aria-hidden="true" />;

  return (
    <div ref={scroller} className={`${m.strip} ${windows.length > 1 ? m.fade : ""}`} role="tablist" aria-label="Windows">
      {windows.map((win, index) => {
        const active = index === activeIndex;
        return (
          <button
            key={win.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={`${m.chip} ${active ? m.active : ""}`}
            title={localizeTitle(win.title, locale)}
            onClick={() => { xpSound.click(); if (active) onOpenSwitcher(); else focusWindow(win.id); }}
          >
            <WindowTypeIcon type={win.type} className="w-4 h-4 flex-shrink-0" />
            <span>{shortWindowTitle(localizeTitle(win.title, locale))}</span>
            {active && windows.length > 1 && <b className={m.badge} aria-label={`${windows.length}`}>{windows.length}</b>}
          </button>
        );
      })}
    </div>
  );
}

interface CardProps { win: WindowItem; active: boolean; onOpen: () => void; onClose: () => void; labels: { current: string; minimized: string; open: string; close: string } }

function Card({ win, active, onOpen, onClose, labels }: CardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ id: -1, x: 0, y: 0, dy: 0, on: false });
  const { locale } = useLocale();

  const down = (event: ReactPointerEvent) => { drag.current = { id: event.pointerId, x: event.clientX, y: event.clientY, dy: 0, on: false }; };
  const move = (event: ReactPointerEvent) => {
    const d = drag.current, card = ref.current;
    if (d.id !== event.pointerId || !card) return;
    const dx = event.clientX - d.x, dy = event.clientY - d.y;
    if (!d.on && dy < -8 && Math.abs(dy) > Math.abs(dx) * 1.3) { d.on = true; (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); }
    if (!d.on) return;
    d.dy = Math.min(0, dy);
    card.style.transition = "none";
    card.style.transform = `translateY(${d.dy}px)`;
    card.style.opacity = String(Math.max(0.2, 1 + d.dy / 320));
  };
  const up = (event: ReactPointerEvent) => {
    const d = drag.current, card = ref.current;
    if (d.id !== event.pointerId || !card) return;
    d.id = -1;
    card.style.transition = "";
    if (d.on && d.dy < -110) {
      card.style.transform = "translateY(-130%)"; card.style.opacity = "0";
      window.setTimeout(onClose, 220);
    } else {
      card.style.transform = ""; card.style.opacity = "";
    }
  };

  return (
    <div ref={ref} className={`${m.card} ${active ? m.cardActive : ""}`} data-card>
      <div className={m.cardTitle}>
        <WindowTypeIcon type={win.type} className="w-4 h-4 flex-shrink-0" />
        <span>{shortWindowTitle(localizeTitle(win.title, locale))}</span>
        <button type="button" className={m.cardClose} aria-label={labels.close} onClick={onClose}>×</button>
      </div>
      <button
        type="button"
        className={m.cardBody}
        onClick={onOpen}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        aria-label={`${labels.open}: ${localizeTitle(win.title, locale)}`}
      >
        <WindowTypeIcon type={win.type} className="w-16 h-16" />
        <strong>{localizeTitle(win.title, locale)}</strong>
        <em>{active ? labels.current : win.isMinimized ? labels.minimized : ""}</em>
      </button>
    </div>
  );
}

/** Card carousel with every open window; swipe a card up to close it. */
export function WindowSwitcher({ onClose }: { onClose: () => void }) {
  const { windows, activeWindowId, focusWindow, closeWindow, minimizeAll } = useWindowManager();
  const { locale } = useLocale();
  const scroller = useRef<HTMLDivElement>(null);
  const labels = locale === "ru"
    ? { current: "Текущее окно", minimized: "Свёрнуто", open: "Открыть", close: "Закрыть окно", desktop: "Рабочий стол" }
    : { current: "Current window", minimized: "Minimized", open: "Open", close: "Close window", desktop: "Show desktop" };

  // Open centred on the active window.
  useEffect(() => {
    const node = scroller.current;
    const card = node?.querySelector<HTMLElement>("[data-active='true']") ?? node?.children[0] as HTMLElement | undefined;
    if (node && card) node.scrollTo({ left: card.offsetLeft + card.offsetWidth / 2 - node.clientWidth / 2, behavior: "instant" });
  }, []);

  // Closing the last window closes the switcher.
  useEffect(() => { if (windows.length === 0) onClose(); }, [windows.length, onClose]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onClose]);

  // Cards shrink and dim away from the centre so the carousel reads as a deck.
  const paint = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    const centre = node.scrollLeft + node.clientWidth / 2;
    Array.from(node.children).forEach(child => {
      const el = child as HTMLElement;
      const dist = Math.min(1, Math.abs(el.offsetLeft + el.offsetWidth / 2 - centre) / el.offsetWidth);
      el.style.setProperty("--near", String(1 - dist));
    });
  }, []);
  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    let frame = 0;
    const schedule = () => { if (!frame) frame = requestAnimationFrame(() => { frame = 0; paint(); }); };
    node.addEventListener("scroll", schedule, { passive: true });
    paint();
    return () => { node.removeEventListener("scroll", schedule); cancelAnimationFrame(frame); };
  }, [paint, windows.length]);

  return (
    <div className={m.overlay} role="dialog" aria-modal="true" aria-label="Windows" onClick={onClose}>
      <div ref={scroller} className={m.deck} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
        {windows.map(win => (
          <div key={win.id} className={m.slot} data-active={win.id === activeWindowId && !win.isMinimized}>
            <Card
              win={win}
              active={win.id === activeWindowId && !win.isMinimized}
              labels={labels}
              onOpen={() => { xpSound.click(); focusWindow(win.id); onClose(); }}
              onClose={() => closeWindow(win.id)}
            />
          </div>
        ))}
      </div>
      <button type="button" className={m.desktop} onClick={event => { event.stopPropagation(); minimizeAll(); onClose(); }}>{labels.desktop}</button>
    </div>
  );
}
