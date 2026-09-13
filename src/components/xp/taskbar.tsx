"use client";

import React, { useState, useEffect } from "react";
import { useWindowManager } from "./window-manager-context";
import { useLocale } from "@/lib/i18n";
import { setMuted, getMuted, xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import {
  WindowsFlagIcon,
  SpeakerTrayIcon,
  NetworkTrayIcon,
  WindowsMediaPlayerIcon,
  InternetExplorerIcon,
  SolitaireIcon,
  ToolsIcon,
  WordDocIcon,
  MinesweeperIcon,
  PaintIcon,
} from "./xp-icons";

interface TaskbarProps {
  isStartOpen: boolean;
  onToggleStart: () => void;
}

export function Taskbar({ isStartOpen, onToggleStart }: TaskbarProps) {
  const { windows, activeWindowId, focusWindow, minimizeWindow, minimizeAll, openWindow } = useWindowManager();
  const { locale, setLocale } = useLocale();

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

  const toggleLanguage = () => {
    xpSound.click();
    setLocale(locale === "ru" ? "en" : "ru");
  };

  return (
    <div className="xp-taskbar" style={{ cursor: xpCursors.default }}>
      {/* Start Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          xpSound.click();
          onToggleStart();
        }}
        className={`xp-start-btn ${isStartOpen ? "is-active" : ""}`}
        style={{ cursor: xpCursors.pointer }}
      >
        <WindowsFlagIcon className="xp-flag-icon" />
        <span>{locale === "ru" ? "пуск" : "start"}</span>
      </button>

      {/* Quick Launch */}
      <div className="xp-quick-launch hidden sm:flex">
        {/* Show Desktop */}
        <button
          type="button"
          onClick={() => minimizeAll()}
          className="xp-quick-btn"
          title="Свернуть все окна (Показать рабочий стол)"
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
      </div>

      {/* Running Windows Tabs List */}
      <div className="xp-task-list">
        {windows.map((win) => {
          const isFocused = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              type="button"
              onClick={() => {
                if (isFocused) {
                  minimizeWindow(win.id);
                } else {
                  focusWindow(win.id);
                }
              }}
              className={`xp-task-btn ${isFocused ? "is-focused" : ""}`}
              style={{ cursor: xpCursors.pointer }}
              title={win.title}
            >
              <div className="w-3.5 h-3.5 flex-shrink-0">
                {win.type === "starter" && <span>🪟</span>}
                {win.type === "solitaire" && <SolitaireIcon className="w-3.5 h-3.5" />}
                {win.type === "tools" && <ToolsIcon className="w-3.5 h-3.5" />}
                {win.type === "word" && <WordDocIcon className="w-3.5 h-3.5" />}
                {win.type === "minesweeper" && <MinesweeperIcon className="w-3.5 h-3.5" />}
                {win.type === "paint" && <PaintIcon className="w-3.5 h-3.5" />}
                {win.type === "resume" && <span>📄</span>}
                {win.type === "media-player" && <WindowsMediaPlayerIcon className="w-3.5 h-3.5" />}
                {win.type === "project" && <span>📁</span>}
                {win.type === "notepad" && <span>📝</span>}
                {win.type === "my-computer" && <span>💻</span>}
                {win.type === "my-documents" && <span>📂</span>}
                {win.type === "stories" && <span>🖼️</span>}
                {win.type === "cmd" && <span>📟</span>}
                {win.type === "display-properties" && <span>⚙️</span>}
                {win.type === "recycle-bin" && <span>🗑️</span>}
              </div>
              <span className="xp-task-btn-title">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* System Tray (Notification Area) */}
      <div className="xp-tray">
        {/* Language Switcher Button (RU / EN) */}
        <button
          type="button"
          onClick={toggleLanguage}
          className="xp-tray-btn xp-tray-lang"
          title={`Язык: ${locale.toUpperCase()} (нажмите для переключения)`}
          style={{ cursor: xpCursors.pointer }}
        >
          {locale.toUpperCase()}
        </button>

        {/* Volume Icon (Toggle Mute) */}
        <button
          type="button"
          onClick={toggleMute}
          className="xp-tray-btn"
          title={muted ? "Звук выключен (нажмите для включения)" : "Громкость 100% (нажмите для выключения)"}
          style={{ cursor: xpCursors.pointer }}
        >
          <SpeakerTrayIcon className="w-3.5 h-3.5" muted={muted} />
        </button>

        {/* Network Monitor Icon */}
        <div className="hidden sm:flex items-center opacity-85" title="Подключение по локальной сети: 100 Мбит/с">
          <NetworkTrayIcon className="w-4 h-4" />
        </div>

        {/* Clock */}
        <div className="xp-tray-clock" title={dateStr}>
          {timeStr}
        </div>
      </div>
    </div>
  );
}
