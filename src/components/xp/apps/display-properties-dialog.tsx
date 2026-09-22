"use client";

import React, { useState } from "react";
import { useWindowManager, XpTheme } from "../window-manager-context";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

interface ThemeOption {
  id: XpTheme;
  name: string;
  subtitle: string;
  titlebarBg: string;
  startBtnBg: string;
  taskbarBg: string;
  description: string;
}

const themeOptions: ThemeOption[] = [
  {
    id: "luna-blue",
    name: "Luna Blue (Классический синий)",
    subtitle: "Оригинальная палитра Windows XP",
    titlebarBg: "linear-gradient(180deg, #0058ee 0%, #3593ff 10%, #0054e3 40%, #0030b4 100%)",
    startBtnBg: "linear-gradient(180deg, #44a530 0%, #2c841a 50%, #226f12 100%)",
    taskbarBg: "linear-gradient(180deg, #316ac5 0%, #1742b6 30%, #163da8 100%)",
    description: "Культовый синий глянец, изумрудная кнопка «Пуск», высокая насыщенность и мягкие блики.",
  },
  {
    id: "luna-silver",
    name: "Luna Silver (Металлик)",
    subtitle: "Сдержанная графическая эстетика",
    titlebarBg: "linear-gradient(180deg, #e2e8f0 0%, #94a3b8 50%, #475569 100%)",
    startBtnBg: "linear-gradient(180deg, #64748b 0%, #475569 50%, #334155 100%)",
    taskbarBg: "linear-gradient(180deg, #94a3b8 0%, #475569 50%, #334155 100%)",
    description: "Шлифованный алюминий, контрастный графит, нейтральная подача для фокуса на работах.",
  },
  {
    id: "classic",
    name: "Windows Classic (2000 Pro)",
    subtitle: "Индустриальная геометрия и фаски",
    titlebarBg: "linear-gradient(90deg, #000080 0%, #1084d0 100%)",
    startBtnBg: "#d4d0c8",
    taskbarBg: "#d4d0c8",
    description: "Прямоугольные формы, чистый синий градиент, серое полотно #d4d0c8 и осязаемый bevel-объем.",
  },
  {
    id: "royale-noir",
    name: "Royale Noir (Темная тема)",
    subtitle: "Обсидиановый монохром с неоном",
    titlebarBg: "linear-gradient(180deg, #334155 0%, #0f172a 50%, #020617 100%)",
    startBtnBg: "linear-gradient(180deg, #0284c7 0%, #0369a1 50%, #075985 100%)",
    taskbarBg: "linear-gradient(180deg, #1e293b 0%, #0f172a 50%, #020617 100%)",
    description: "Глубокий полуночный сланец, минимальные блики и аккуратный электрический акцент.",
  },
];

import { WALLPAPERS } from "@/lib/xp/wallpapers";

export function DisplayPropertiesDialog() {
  const {
    wallpaper,
    setWallpaper,
    wallpaperSource,
    geoInfo,
    resetWallpaperToGeo,
    theme,
    setTheme,
    closeWindow,
  } = useWindowManager();
  const [activeTab, setActiveTab] = useState<"themes" | "wallpapers">("themes");
  const [selectedTheme, setSelectedTheme] = useState<XpTheme>(theme);
  const [selectedWp, setSelectedWp] = useState<string>(wallpaper);
  const [isDetecting, setIsDetecting] = useState(false);

  const currentThemeObj = themeOptions.find((t) => t.id === selectedTheme) || themeOptions[0];

  const handleApply = () => {
    xpSound.click();
    setTheme(selectedTheme);
    setWallpaper(selectedWp, "user");
  };

  const handleOk = () => {
    xpSound.click();
    setTheme(selectedTheme);
    setWallpaper(selectedWp, "user");
    closeWindow("display-properties");
  };

  const handleAutoGeo = async () => {
    xpSound.click();
    setIsDetecting(true);
    try {
      const newWp = await resetWallpaperToGeo();
      if (newWp) {
        setSelectedWp(newWp);
      }
    } finally {
      setIsDetecting(false);
    }
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
          Темы оформления (Themes)
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
          Фоновый рисунок (Wallpapers)
        </button>
      </div>

      {/* Monitor CRT Preview */}
      <div className="flex justify-center mb-3">
        <div className="w-56 h-36 bg-[#d0d5dd] border-2 border-slate-500 rounded p-1.5 shadow-md flex flex-col items-center">
          {/* CRT Screen Tube */}
          <div
            className="w-full h-28 rounded border border-slate-600 overflow-hidden relative flex flex-col justify-between"
            style={{
              background: selectedWp.startsWith("/") ? `url(${selectedWp}) center/cover` : selectedWp,
            }}
          >
            {/* Simulated Mini XP Window inside preview */}
            <div className="m-1.5 rounded shadow overflow-hidden border border-slate-700 bg-[#ece9d8] w-36">
              {/* Window Titlebar */}
              <div
                className="h-4 px-1.5 flex items-center justify-between text-[8px] font-bold text-white"
                style={{ background: currentThemeObj.titlebarBg }}
              >
                <span className="truncate">Активное окно</span>
                <div className="flex gap-0.5">
                  <span className="w-2 h-2 rounded-xs bg-red-500 inline-block" />
                </div>
              </div>
              {/* Window Body */}
              <div className="p-1 text-[7px] text-slate-800 bg-white leading-tight">
                Design-engineering token preview
              </div>
            </div>

            {/* Simulated Mini Taskbar inside preview */}
            <div
              className="h-3.5 w-full flex items-center justify-between px-1"
              style={{ background: currentThemeObj.taskbarBg }}
            >
              <div
                className="h-2.5 px-1 rounded-xs flex items-center text-[7px] font-bold text-white italic"
                style={{ background: currentThemeObj.startBtnBg }}
              >
                Пуск
              </div>
              <div className="text-[6px] text-white opacity-80">14:00</div>
            </div>
          </div>
          {/* Monitor Stand Base */}
          <div className="w-12 h-2 bg-slate-400 mt-1 rounded-sm shadow-inner" />
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 flex flex-col min-h-0 mb-3 bg-white border border-slate-400 rounded p-2 overflow-y-auto">
        {activeTab === "themes" ? (
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1">
              Системные стили оформления (CSS Tokens):
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {themeOptions.map((opt) => {
                const isSelected = selectedTheme === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      xpSound.click();
                      setSelectedTheme(opt.id);
                    }}
                    className={`p-2.5 rounded border transition text-left cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#0055ea] bg-blue-50/80 ring-1 ring-[#0055ea]"
                        : "border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                    }`}
                    style={{ cursor: xpCursors.pointer }}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-bold text-slate-900 text-xs">{opt.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">
                            Активна
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-snug mb-2">{opt.description}</div>
                    </div>
                    {/* Swatch chips */}
                    <div className="flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
                      <span className="text-[9px] text-slate-400 font-mono">Токены:</span>
                      <span
                        className="w-4 h-3 rounded-xs border border-black/20 shadow-xs inline-block"
                        style={{ background: opt.titlebarBg }}
                        title="Titlebar"
                      />
                      <span
                        className="w-4 h-3 rounded-xs border border-black/20 shadow-xs inline-block"
                        style={{ background: opt.startBtnBg }}
                        title="Start Button"
                      />
                      <span
                        className="w-4 h-3 rounded-xs border border-black/20 shadow-xs inline-block"
                        style={{ background: opt.taskbarBg }}
                        title="Taskbar"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Geo status & auto-detection banner */}
            <div className="bg-[#f0f4f9] border border-[#b2c8e6] rounded p-2 flex items-center justify-between text-[11px]">
              <div>
                <div className="font-semibold text-slate-800">
                  Режим:{" "}
                  <span className="font-normal text-blue-900">
                    {wallpaperSource === "user"
                      ? "Ручной выбор (сохранен)"
                      : wallpaperSource === "geo"
                      ? "Автоматически по IP"
                      : "По умолчанию"}
                  </span>
                </div>
                {geoInfo && (
                  <div className="text-[10px] text-slate-500">
                    Определенная локация: {geoInfo.city ? `${geoInfo.city}, ` : ""}{geoInfo.country}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleAutoGeo}
                disabled={isDetecting}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 active:bg-slate-200 border border-[#7a9eb5] rounded text-[11px] font-medium text-slate-800 shadow-xs flex items-center gap-1 disabled:opacity-50"
                style={{ cursor: xpCursors.pointer }}
              >
                <span>🌍</span>
                <span>{isDetecting ? "Определение..." : "Определить по IP"}</span>
              </button>
            </div>

            <span className="font-bold text-slate-800 text-[11px] block mb-1">
              Выберите рисунок рабочего стола:
            </span>
            <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
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
                      <div className="text-xs truncate">{wp.name}</div>
                      <div className={`text-[10px] truncate ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                        {wp.desc}
                      </div>
                      {wp.region && (
                        <div className={`text-[9px] ${isSelected ? "text-blue-200" : "text-blue-700 font-medium"}`}>
                          Регион: {wp.region}
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
          ОК
        </button>
        <button
          type="button"
          onClick={() => closeWindow("display-properties")}
          className="px-4 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-200 border border-slate-400 rounded text-xs shadow-xs text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          Отмена
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="px-4 py-1.5 bg-white hover:bg-slate-50 active:bg-slate-200 border border-slate-400 rounded text-xs shadow-xs text-slate-900"
          style={{ cursor: xpCursors.pointer }}
        >
          Применить
        </button>
      </div>
    </div>
  );
}
