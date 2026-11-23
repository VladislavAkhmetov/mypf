"use client";

import React, { useState } from "react";
import { useWindowManager, XpTheme } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { ThemePreview } from "./theme-preview";
import { WALLPAPERS, wallpaperText, DEFAULT_WALLPAPER_SRC } from "@/lib/xp/wallpapers";
import { useLocale } from "@/lib/i18n";

interface ThemeOption {
  id: XpTheme;
  name: string;
  subtitle: string;
  description: string;
}

const themeOptionsFor = (tr: Tr): ThemeOption[] => [
  {
    id: "luna-blue",
    name: tr("Luna Blue (Классический синий)", "Luna Blue (Classic blue)"),
    subtitle: tr("Оригинальная палитра Windows XP", "The original Windows XP palette"),
    description: tr("Культовый синий глянец, изумрудная кнопка «Пуск», высокая насыщенность и мягкие блики.", "The iconic blue gloss, an emerald Start button, rich saturation and soft highlights."),
  },
  {
    id: "luna-silver",
    name: tr("Luna Silver (Металлик)", "Luna Silver (Metallic)"),
    subtitle: tr("Сдержанная графическая эстетика", "Restrained graphic look"),
    description: tr("Шлифованный алюминий, контрастный графит, нейтральная подача для фокуса на работах.", "Brushed aluminium and contrasting graphite, a neutral look that keeps the focus on the work."),
  },
  {
    id: "classic",
    name: "Windows Classic (2000 Pro)",
    subtitle: tr("Индустриальная геометрия и фаски", "Industrial geometry and bevels"),
    description: tr("Прямоугольные формы, чистый синий градиент, серое полотно #d4d0c8 и осязаемый bevel-объем.", "Rectangular shapes, a clean blue gradient, the grey #d4d0c8 canvas and tactile bevels."),
  },
  {
    id: "royale-noir",
    name: tr("Royale Noir (Темная тема)", "Royale Noir (Dark theme)"),
    subtitle: tr("Обсидиановый монохром с неоном", "Obsidian monochrome with neon"),
    description: tr("Глубокий полуночный сланец, минимальные блики и аккуратный электрический акцент.", "Deep midnight slate, minimal highlights and a careful electric accent."),
  },
];

type Tr = (ru: string, en: string) => string;

export function DisplayPropertiesDialog() {
  const {
    wallpaper,
    setWallpaper,
    theme,
    setTheme,
    closeWindow,
  } = useWindowManager();
  const { tr, locale } = useLocale();
  const themeOptions = themeOptionsFor(tr);
  const [activeTab, setActiveTab] = useState<"themes" | "wallpapers">("themes");
  const [selectedTheme, setSelectedTheme] = useState<XpTheme>(theme);
  const [hoverTheme, setHoverTheme] = useState<XpTheme | null>(null);
  const [selectedWp, setSelectedWp] = useState<string>(wallpaper);

  const shownTheme = hoverTheme ?? selectedTheme;
  const shownThemeObj = themeOptions.find((t) => t.id === shownTheme) || themeOptions[0];

  const handleApply = () => {
    xpSound.click();
    setTheme(selectedTheme);
    setWallpaper(selectedWp);
  };

  const handleOk = () => {
    xpSound.click();
    setTheme(selectedTheme);
    setWallpaper(selectedWp);
    closeWindow("display-properties");
  };

  return (
    <div className="flex-1 flex flex-col bg-[#ece9d8] p-3 text-xs select-none min-h-0">
      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#9bbfe8] mb-3">
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            setActiveTab("themes");
          }}
          className={`px-3 py-1.5 border-t border-x rounded-t font-bold -mb-[1px] transition text-xs ${
            activeTab === "themes"
              ? "bg-white border-[#7a9eb5] text-blue-950 z-10 shadow-sm"
              : "bg-[#e2dfce] border-transparent text-slate-600 hover:text-black"
          }`}
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Темы", "Themes")}
        </button>
        <button
          type="button"
          onClick={() => {
            xpSound.click();
            setActiveTab("wallpapers");
          }}
          className={`px-3 py-1.5 border-t border-x rounded-t font-bold -mb-[1px] transition text-xs ${
            activeTab === "wallpapers"
              ? "bg-white border-[#7a9eb5] text-blue-950 z-10 shadow-sm"
              : "bg-[#e2dfce] border-transparent text-slate-600 hover:text-black"
          }`}
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Фон рабочего стола", "Desktop")}
        </button>
      </div>

      {/* Monitor: shows the theme under the pointer, or the selected one */}
      <div className="flex flex-col items-center mb-3">
        <div className="w-[17rem] max-w-full bg-[#d0d5dd] border-2 border-slate-500 rounded p-1.5 shadow-md flex flex-col items-center">
          <div className="w-full rounded border border-slate-600 overflow-hidden">
            <ThemePreview theme={shownTheme} wallpaper={selectedWp} />
          </div>
          <div className="w-12 h-2 bg-slate-400 mt-1 rounded-sm shadow-inner" />
        </div>
        <div className="mt-1.5 text-[11px] text-slate-600" aria-live="polite">
          {hoverTheme && hoverTheme !== selectedTheme ? tr("Предпросмотр: ", "Preview: ") : tr("Выбрана: ", "Selected: ")}
          <b className="text-slate-900">{shownThemeObj.name.split(" (")[0]}</b>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 flex flex-col min-h-0 mb-3 bg-white border border-slate-400 rounded p-2 overflow-y-auto">
        {activeTab === "themes" ? (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-800 border-b border-slate-200 pb-1">
              {tr("Тема оформления", "Theme")}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label={tr("Тема оформления", "Theme")}>
              {themeOptions.map((opt) => {
                const isSelected = selectedTheme === opt.id;
                const isCurrent = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => {
                      xpSound.click();
                      setSelectedTheme(opt.id);
                    }}
                    onMouseEnter={() => setHoverTheme(opt.id)}
                    onMouseLeave={() => setHoverTheme(null)}
                    onFocus={() => setHoverTheme(opt.id)}
                    onBlur={() => setHoverTheme(null)}
                    className={`p-2 rounded border transition text-left flex flex-col gap-2 ${
                      isSelected
                        ? "border-[#0055ea] bg-blue-50/80 ring-1 ring-[#0055ea]"
                        : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                    style={{ cursor: xpCursors.pointer }}
                  >
                    <div className={`rounded overflow-hidden border ${isSelected ? "border-[#0055ea]" : "border-slate-300"}`}>
                      <ThemePreview theme={opt.id} wallpaper={selectedWp} detail={false} />
                    </div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs">{opt.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold whitespace-nowrap">
                          {tr("Сейчас", "Now")}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 leading-snug">{opt.description}</div>
                    <div data-xp-theme={opt.id} className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60 mt-auto">
                      <span className="text-[9px] text-slate-400">{tr("Цвета:", "Colours:")}</span>
                      {[
                        ["var(--xp-titlebar-bg)", tr("Заголовок окна", "Title bar")],
                        ["var(--xp-start-btn-bg)", tr("Кнопка «Пуск»", "Start button")],
                        ["var(--xp-taskbar-bg)", tr("Панель задач", "Taskbar")],
                        ["var(--xp-select-blue)", tr("Выделение", "Selection")],
                      ].map(([background, title]) => (
                        <span key={title} className="w-4 h-3 rounded-xs border border-black/20 inline-block" style={{ background }} title={title} />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1">
              <span className="font-bold text-slate-800 text-[11px]">
                {tr("Выберите рисунок рабочего стола:", "Choose a desktop background:")}
              </span>
              {selectedWp !== DEFAULT_WALLPAPER_SRC && (
                <button
                  type="button"
                  onClick={() => {
                    xpSound.click();
                    setSelectedWp(DEFAULT_WALLPAPER_SRC);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[10px] text-slate-700"
                  style={{ cursor: xpCursors.pointer }}
                >
                  {tr("По умолчанию (Bliss)", "Default (Bliss)")}
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto pr-1">
              {WALLPAPERS.map((wp) => {
                const isSelected = selectedWp === wp.src;
                return (
                  <div
                    key={wp.id}
                    onClick={() => {
                      xpSound.click();
                      setSelectedWp(wp.src);
                    }}
                    className={`px-2.5 py-1.5 rounded transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? "bg-[#316ac5] text-white font-bold"
                        : "hover:bg-slate-100 text-slate-800"
                    }`}
                    style={{ cursor: xpCursors.pointer }}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs truncate">{wallpaperText(wp, locale).name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                        {wallpaperText(wp, locale).desc}
                      </div>
                      {wallpaperText(wp, locale).region && (
                        <div className={`text-[9px] ${isSelected ? "text-blue-200" : "text-blue-700 font-medium"}`}>
                          {tr("Регион", "Region")}: {wallpaperText(wp, locale).region}
                        </div>
                      )}
                    </div>
                    <div
                      className="w-9 h-6 rounded border border-black/30 shadow-xs flex-shrink-0"
                      style={{
                        background: wp.src.startsWith("/") ? `url(${wp.src}) center/cover` : wp.src,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Buttons: OK, Cancel, Apply */}
      <div className="flex justify-end gap-2 pt-2 border-t border-slate-300">
        <button
          type="button"
          onClick={handleOk}
          className="px-4 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-200 border border-slate-400 rounded text-xs shadow-xs font-semibold text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("ОК", "OK")}
        </button>
        <button
          type="button"
          onClick={() => closeWindow("display-properties")}
          className="px-4 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-200 border border-slate-400 rounded text-xs shadow-xs text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Отмена", "Cancel")}
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-200 border border-slate-400 rounded text-xs shadow-xs text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          {tr("Применить", "Apply")}
        </button>
      </div>
    </div>
  );
}
