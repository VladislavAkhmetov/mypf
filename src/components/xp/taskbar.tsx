"use client";

import React, { useState, useEffect } from "react";
import { useWindowManager } from "./window-manager-context";
import { useLocale } from "@/lib/i18n";
import { setMuted, getMuted, xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { WindowsFlagIcon, SpeakerTrayIcon, NetworkTrayIcon, WindowsMediaPlayerIcon, InternetExplorerIcon } from "./xp-icons";
import { WindowTypeIcon } from "./window-icon";
import { WindowStrip, WindowSwitcher } from "./mobile-taskbar";
import { useCompactViewport } from "@/lib/xp/viewport";
import { LanguageBar } from "./language-bar";
import { localizeTitle } from "@/lib/xp/window-titles";

interface TaskbarProps {
  isStartOpen: boolean;
  onToggleStart: () => void;
}

export function Taskbar({ isStartOpen, onToggleStart }: TaskbarProps) {
  const { windows, activeWindowId, focusWindow, minimizeWindow, minimizeAll, openWindow } = useWindowManager();
  const { locale, tr } = useLocale();
  const compact = useCompactViewport();
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const closeSwitcher = React.useCallback(() => setSwitcherOpen(false), []);
  const showSwitcher = switcherOpen && compact;

  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [muted, setMutedState] = useState(() => (typeof window !== "undefined" ? getMuted() : true));

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: locale === "en",
        }),
      );
      setDateStr(
        now.toLocaleDateString(locale === "ru" ? "ru-RU" : "en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [locale]);

  const toggleMute = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    setMutedState(nextMuted);
    if (!nextMuted) xpSound.click();
  };

  return (
    <div className="xp-taskbar" style={{ cursor: xpCursors.default }}>
      {/* Start Button */}
      <button
        type="button"
        data-ym-goal="start_button_click"
        onClick={(e) => {
          e.stopPropagation();
          xpSound.click();
          setSwitcherOpen(false);
          onToggleStart();
        }}
        className={`xp-start-btn ${isStartOpen ? "is-active" : ""}`}
        style={{ cursor: xpCursors.pointer }}
      >
        <WindowsFlagIcon className="xp-flag-icon" />
        <span>{locale === "ru" ? "пуск" : "start"}</span>
      </button>

      {/* Quick Launch */}
      {!compact && <div className="xp-quick-launch hidden sm:flex">
        {/* Show Desktop */}
        <button
          type="button"
          onClick={() => minimizeAll()}
          className="xp-quick-btn"
          title={tr("Свернуть все окна (Показать рабочий стол)", "Minimize all windows (Show desktop)")}
          style={{ cursor: xpCursors.pointer }}
        >
          <div className="w-4 h-4 bg-sky-100 border border-sky-400 rounded-sm grid place-items-center text-[9px] shadow-sm">
            🖥️
          </div>
        </button>

        {/* Internet Explorer */}
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            openWindow({
              id: "notepad",
              type: "notepad",
              title: "About_Vlad.txt - Блокнот",
              iconType: "notepad",
              x: 80,
              y: 60,
              width: 520,
              height: 380,
            });
          }}
          className="xp-quick-btn"
          title="Internet Explorer"
          style={{ cursor: xpCursors.pointer }}
        >
          <InternetExplorerIcon className="w-4 h-4" />
        </button>

        {/* Windows Media Player */}
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            openWindow({
              id: "media-player",
              type: "media-player",
              title: "Windows Media Player - Showreel 2026",
              iconType: "wmp",
              x: 80,
              y: 40,
              width: 540,
              height: 440,
            });
          }}
          className="xp-quick-btn"
          title="Windows Media Player"
          style={{ cursor: xpCursors.pointer }}
        >
          <WindowsMediaPlayerIcon className="w-4 h-4" />
        </button>
      </div>}

      {/* Phone: strip of windows with faded neighbours */}
      {compact && <WindowStrip onOpenSwitcher={() => setSwitcherOpen(true)} />}

      {/* Running Windows Tabs List */}
      {!compact && <div className="xp-task-list">
        {windows.map((win) => {
          const isFocused = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              type="button"
              data-ym-goal="taskbar_tab_click"
              data-ym-params={JSON.stringify({ windowId: win.id, title: win.title })}
              onClick={() => {
                if (isFocused) {
                  minimizeWindow(win.id);
                } else {
                  focusWindow(win.id);
                }
              }}
              className={`xp-task-btn ${isFocused ? "is-focused" : ""}`}
              style={{ cursor: xpCursors.pointer }}
              title={localizeTitle(win.title, locale)}
            >
              <div className="w-3.5 h-3.5 flex-shrink-0"><WindowTypeIcon type={win.type} className="w-3.5 h-3.5" /></div>
              <span className="xp-task-btn-title">{localizeTitle(win.title, locale)}</span>
            </button>
          );
        })}
      </div>}

      {/* System Tray (Notification Area) */}
      <div className="xp-tray">
        {/* Language bar (RU / EN menu, Alt+Shift) */}
        <LanguageBar />

        {/* Volume Icon (Toggle Mute) */}
        {!compact && <button
          type="button"
          data-ym-goal="tray_toggle_volume"
          onClick={toggleMute}
          className="xp-tray-btn"
          title={muted ? tr("Звук выключен (нажмите для включения)", "Sound off (click to turn on)") : tr("Громкость 100% (нажмите для выключения)", "Volume 100% (click to mute)")}
          style={{ cursor: xpCursors.pointer }}
        >
          <SpeakerTrayIcon className="w-3.5 h-3.5" muted={muted} />
        </button>}

        {/* Network Monitor Icon */}
        {!compact && <div className="hidden sm:flex items-center opacity-85" title={tr("Подключение по локальной сети: 100 Мбит/с", "Local Area Connection: 100 Mbps")}>
          <NetworkTrayIcon className="w-4 h-4" />
        </div>}

        {/* Clock */}
        <div className="xp-tray-clock" data-ym-goal="tray_clock_click" title={dateStr}>
          {timeStr}
        </div>
      </div>

      {showSwitcher && <WindowSwitcher onClose={closeSwitcher} />}
    </div>
  );
}
