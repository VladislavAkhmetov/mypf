"use client";

import React, { useState } from "react";
import Image from "next/image";
import { site } from "@/data/site";
import { projects } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { useWindowManager } from "./window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { getMinesweeperWindowBounds } from "@/lib/xp/minesweeper-game";
import { minesweeperStore } from "@/lib/xp/games/game-session-store";
import { getWordWindowBounds } from "@/lib/xp/navigation";
import {
  WindowsMediaPlayerIcon,
  InternetExplorerIcon,
  NotepadIcon,
  CmdIcon,
  StoriesIcon,
  MyDocumentsIcon,
  MyComputerIcon,
  ControlPanelIcon,
  TelegramIcon,
  SolitaireIcon,
  ToolsIcon,
  WordDocIcon,
  MinesweeperIcon,
  PaintIcon,
  PdfIcon,
} from "./xp-icons";

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onTurnOffClick: () => void;
}

export function StartMenu({ isOpen, onClose, onTurnOffClick }: StartMenuProps) {
  const { t } = useLocale();
  const { openWindow, openProject, openPortfolio, openProfile } = useWindowManager();
  const [showAllPrograms, setShowAllPrograms] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="xp-start-menu"
      onClick={(e) => e.stopPropagation()}
      style={{ cursor: xpCursors.default }}
    >
      {/* Header */}
      <div className="xp-start-header">
        <Image
          src={site.avatar}
          alt={site.name}
          width={42}
          height={42}
          className="xp-start-avatar"
          unoptimized
        />
        <div>
          <div className="xp-start-username">{site.name}</div>
          <div className="xp-start-userrole">{t(site.role)}</div>
        </div>
      </div>

      {/* 2-Column Body */}
      <div className="xp-start-body relative">
        {/* Left Column (White) */}
        <div className="xp-start-left">
          {/* Portfolio */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openPortfolio();
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"portfolio"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <InternetExplorerIcon className="w-8 h-8 flex-shrink-0" />
            <div>
              <div className="xp-start-item-title">Портфолио</div>
              <div className="xp-start-subtext">Кейсы и интерактивные прототипы</div>
            </div>
          </div>

          {/* E-mail */}
          <a
            href={`mailto:${site.email}`}
            onClick={() => {
              xpSound.click();
              onClose();
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"email"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <div className="w-8 h-8 rounded bg-blue-100 border border-blue-400 grid place-items-center text-sm flex-shrink-0">
              ✉️
            </div>
            <div>
              <div className="xp-start-item-title">Электронная почта</div>
              <div className="xp-start-subtext">{site.email}</div>
            </div>
          </a>

          <div className="h-[1px] bg-slate-200 my-1 mx-2" />

          {/* Windows Media Player */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "media-player",
                type: "media-player",
                title: "Windows Media Player — Атлас волн",
                iconType: "wmp",
                x: 80,
                y: 40,
                width: 540,
                height: 440,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"media-player"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <WindowsMediaPlayerIcon className="w-7 h-7 flex-shrink-0" />
            <span className="font-semibold text-xs">Визуализатор волн</span>
          </div>

          {/* Notepad */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "notepad",
                type: "notepad",
                title: "Блокнот — Безымянный",
                iconType: "notepad",
                x: 70,
                y: 60,
                width: 520,
                height: 380,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"notepad"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <NotepadIcon className="w-7 h-7 flex-shrink-0" />
            <span className="font-semibold text-xs">Блокнот</span>
          </div>

          {/* Command Prompt */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "cmd",
                type: "cmd",
                title: "Командная строка — cmd.exe",
                iconType: "cmd",
                x: 90,
                y: 80,
                width: 560,
                height: 360,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"cmd"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <CmdIcon className="w-7 h-7 flex-shrink-0" />
            <span className="font-semibold text-xs">Командная строка</span>
          </div>

          {/* Tools */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "tools",
                type: "tools",
                title: "Инструменты — Плагины и скрипты",
                iconType: "tools",
                x: 80,
                y: 45,
                width: 760,
                height: 520,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"tools"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <ToolsIcon className="w-7 h-7 flex-shrink-0" />
            <span className="font-semibold text-xs">Инструменты и скрипты</span>
          </div>

          {/* About / Word */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openProfile();
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"word"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <WordDocIcon className="w-7 h-7 flex-shrink-0" />
            <span className="font-semibold text-xs">Обо мне (Word)</span>
          </div>

          {/* Paint Studio */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "paint",
                type: "paint",
                title: "Paint",
                iconType: "paint",
                x: 90,
                y: 45,
                width: 780,
                height: 540,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"paint"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <PaintIcon className="w-7 h-7 flex-shrink-0" />
            <span className="font-semibold text-xs">Paint</span>
          </div>

          {/* Stories */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "stories",
                type: "stories",
                title: "Истории и процессы — Picture Viewer",
                iconType: "stories",
                x: 90,
                y: 70,
                width: 580,
                height: 430,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"stories"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <StoriesIcon className="w-7 h-7 flex-shrink-0" />
            <span className="font-semibold text-xs">Истории студии</span>
          </div>

          {/* For Employers / HR & Leads */}
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "resume",
                type: "resume",
                title: "Резюме_Влад_Ахметов.pdf — Executive Summary",
                iconType: "resume",
                x: 70,
                y: 40,
                width: 680,
                height: 520,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"resume"}'
            className="xp-start-item border border-blue-300 bg-blue-50 hover:bg-[#316ac5]"
            style={{ cursor: xpCursors.pointer }}
          >
            <PdfIcon className="w-7 h-7 flex-shrink-0" />
            <div>
              <div className="xp-start-item-title text-blue-950 font-bold">Для работодателей / HR</div>
              <div className="xp-start-subtext text-blue-800">Резюме, специализация, стек</div>
            </div>
          </div>

          {/* All Programs at bottom */}
          <div className="mt-auto pt-2 border-t border-slate-200">
            <button
              type="button"
              onMouseEnter={() => setShowAllPrograms(true)}
              onClick={() => setShowAllPrograms(!showAllPrograms)}
              data-ym-goal="start_menu_all_programs_toggle"
              className="w-full flex items-center justify-between p-2 rounded hover:bg-[#316ac5] hover:text-white font-bold text-xs text-slate-900"
              style={{ cursor: xpCursors.pointer }}
            >
              <span className="text-slate-900 group-hover:text-white">Все программы</span>
              <span className="text-emerald-600 font-bold">►</span>
            </button>
          </div>
        </div>

        {/* All Programs Flyout Menu */}
        {showAllPrograms && (
          <div
            className="absolute left-[52%] top-0 bottom-0 w-64 bg-white border-2 border-[#0055ea] shadow-2xl z-20 p-2 overflow-y-auto"
            onMouseLeave={() => setShowAllPrograms(false)}
          >
            <div className="text-[11px] text-slate-900 font-bold uppercase mb-2 px-1 border-b border-slate-200 pb-1">
              Проекты портфолио:
            </div>
            {projects.map((p) => (
              <div
                key={p.slug}
                onClick={() => {
                  xpSound.click();
                  onClose();
                  openProject(p.slug);
                }}
                data-ym-goal="start_menu_project"
                data-ym-params={JSON.stringify({ slug: p.slug })}
                className="flex items-center gap-2.5 p-2 rounded hover:bg-[#316ac5] text-slate-900 hover:text-white cursor-pointer text-xs font-semibold transition"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>📁</span>
                <span className="truncate">{p.title}</span>
              </div>
            ))}

            <div className="text-[11px] text-slate-900 font-bold uppercase mt-3 mb-2 px-1 border-b border-slate-200 pb-1">
              Игры и лаборатория:
            </div>
            <div
              onClick={() => {
                xpSound.click();
                onClose();
                openWindow({
                  id: "solitaire",
                  type: "solitaire",
                  title: "Косынка — Maison Solitaire",
                  iconType: "solitaire",
                  x: 60,
                  y: 15,
                  width: typeof window !== "undefined" ? Math.min(960, window.innerWidth - 40) : 960,
                  height: typeof window !== "undefined" ? Math.min(700, window.innerHeight - 75) : 700,
                });
              }}
              data-ym-goal="start_menu_item"
              data-ym-params='{"app":"solitaire"}'
              className="flex items-center gap-2.5 p-2 rounded hover:bg-[#316ac5] text-slate-900 hover:text-white cursor-pointer text-xs font-semibold transition"
              style={{ cursor: xpCursors.pointer }}
            >
              <SolitaireIcon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Косынка Atelier</span>
            </div>

            <div
              onClick={() => {
                xpSound.click();
                onClose();
                const currentDiff = minesweeperStore.getSnapshot().difficulty;
                const bounds = getMinesweeperWindowBounds(currentDiff);
                openWindow({
                  id: "minesweeper",
                  type: "minesweeper",
                  title: "Сапёр — Pulsefield",
                  iconType: "minesweeper",
                  ...bounds,
                });
              }}
              data-ym-goal="start_menu_item"
              data-ym-params='{"app":"minesweeper"}'
              className="flex items-center gap-2.5 p-2 rounded hover:bg-[#316ac5] text-slate-900 hover:text-white cursor-pointer text-xs font-semibold transition"
              style={{ cursor: xpCursors.pointer }}
            >
              <MinesweeperIcon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">Сапёр Pulse</span>
            </div>
          </div>
        )}

        {/* Right Column (Light Blue) */}
        <div className="xp-start-right">
          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "my-documents",
                type: "my-documents",
                title: "Мои документы — Проекты",
                iconType: "folder",
                x: 60,
                y: 50,
                width: 620,
                height: 420,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"my-documents"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <MyDocumentsIcon className="w-6 h-6 flex-shrink-0" />
            <span className="font-bold text-xs">Мои документы</span>
          </div>

          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "my-computer",
                type: "my-computer",
                title: "Мой компьютер",
                iconType: "computer",
                x: 70,
                y: 55,
                width: 580,
                height: 420,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"my-computer"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <MyComputerIcon className="w-6 h-6 flex-shrink-0" />
            <span className="font-bold text-xs">Мой компьютер</span>
          </div>

          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "tools",
                type: "tools",
                title: "Инструменты — Плагины и скрипты",
                iconType: "tools",
                x: 80,
                y: 45,
                width: 760,
                height: 520,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"tools"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <ToolsIcon className="w-6 h-6 flex-shrink-0" />
            <span className="font-bold text-xs">Инструменты</span>
          </div>

          <div
            onClick={() => {
              xpSound.click();
              onClose();
              const bounds = getWordWindowBounds();
              openWindow({
                id: "word",
                type: "word",
                title: "Документы — Влад Ахметов",
                iconType: "word",
                ...bounds,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"word"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <WordDocIcon className="w-6 h-6 flex-shrink-0" />
            <span className="font-bold text-xs">Документы (Word)</span>
          </div>

          <div className="h-[1px] bg-[#9bbfe8] my-1 mx-2" />

          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "display-properties",
                type: "display-properties",
                title: "Свойства: Экран и темы",
                iconType: "control",
                x: 100,
                y: 70,
                width: 540,
                height: 490,
              });
            }}
            data-ym-goal="start_menu_item"
            data-ym-params='{"app":"display-properties"}'
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <ControlPanelIcon className="w-6 h-6 flex-shrink-0" />
            <span className="text-xs">Оформление и темы</span>
          </div>

          <a
            href={site.telegram}
            target="_blank"
            rel="noreferrer"
            data-ym-goal="start_menu_telegram"
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <TelegramIcon className="w-6 h-6 flex-shrink-0" />
            <span className="text-xs font-semibold">Telegram @amazi</span>
          </a>

          <div className="h-[1px] bg-[#9bbfe8] my-1 mx-2" />

          <div
            onClick={() => {
              xpSound.click();
              onClose();
              openWindow({
                id: "cmd",
                type: "cmd",
                title: "Командная строка",
                iconType: "cmd",
                x: 80,
                y: 80,
                width: 540,
                height: 350,
              });
            }}
            data-ym-goal="start_menu_run"
            className="xp-start-item"
            style={{ cursor: xpCursors.pointer }}
          >
            <span className="text-base">⚙️</span>
            <span className="text-xs">Выполнить...</span>
          </div>
        </div>
      </div>

      {/* Footer (Log Off / Turn Off) */}
      <div className="xp-start-footer">
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            onClose();
            onTurnOffClick();
          }}
          data-ym-goal="start_menu_logoff"
          className="xp-start-footer-btn"
          style={{ cursor: xpCursors.pointer }}
        >
          <div className="w-5 h-5 rounded bg-amber-500 border border-white/50 grid place-items-center text-white text-xs font-bold shadow-sm">
            🔑
          </div>
          <span>Выход из системы</span>
        </button>

        <button
          type="button"
          onClick={() => {
            xpSound.click();
            onClose();
            onTurnOffClick();
          }}
          data-ym-goal="start_menu_turnoff"
          className="xp-start-footer-btn font-bold"
          style={{ cursor: xpCursors.pointer }}
        >
          <div className="w-5 h-5 rounded bg-red-600 border border-white/50 grid place-items-center text-white text-xs font-bold shadow-sm">
            ⏻
          </div>
          <span>Выключение</span>
        </button>
      </div>
    </div>
  );
}
