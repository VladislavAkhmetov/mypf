"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Project } from "@/data/projects";
import { useLocale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";

interface PrintforgeLandingProps {
  project: Project;
  adjacent?: { prev: Project | null; next: Project | null };
  onOpenProject?: (slug: string) => void;
}

type TabKey = "layouts" | "colors" | "dpi" | "health" | "packaging";

export function PrintforgeLanding({
  project,
  adjacent,
  onOpenProject,
}: PrintforgeLandingProps) {
  const { locale } = useLocale();
  const [copied, setCopied] = useState(false);
  const [copiedManifest, setCopiedManifest] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("layouts");
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const liveUrl = "http://localhost:3005";
  const manifestPath = "D:\\dev\\printforge\\print-ready-figma-plugin\\packages\\figma-plugin\\manifest.json";

  const togglePlay = () => {
    xpSound.click();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    xpSound.click();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleCopyLink = () => {
    xpSound.click();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyManifest = () => {
    xpSound.click();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(manifestPath);
      setCopiedManifest(true);
      setTimeout(() => setCopiedManifest(false), 2000);
    }
  };

  const tabsInfo: Record<
    TabKey,
    {
      title: { ru: string; en: string };
      badge: string;
      desc: { ru: string; en: string };
      image: string;
      features: { ru: string[]; en: string[] };
    }
  > = {
    layouts: {
      title: { ru: "Сетки и припуски (Bleed)", en: "Layouts & Bleed Margins" },
      badge: "ISO 12647-2",
      desc: {
        ru: "Автоматический расчёт обрезных полей (BleedBox), чистового формата (TrimBox) и дообрезного формата (MediaBox). Генерация 4 направляющих линий безопасности на канвасе Figma и пресеты полиграфии.",
        en: "Automatic calculation of TrimBox, BleedBox, and MediaBox. Generation of 4 safety cut guide lines directly on Figma canvas with standard print presets.",
      },
      image: "/placeholders/covers/printforge/tab_properties_2x.png",
      features: {
        ru: [
          "Пресеты визиток (EU 85×55, US 3.5×2\", JP 91×55)",
          "Европейский и международный ряд ISO A6..A1, плакаты, флаеры",
          "Точный Bleed 2мм / 3мм / 5мм с выносом направляющих",
          "Кастомные размеры в мм и дюймах с выбором ориентации",
        ],
        en: [
          "Business Card presets (EU 85×55, US 3.5×2\", JP 91×55)",
          "ISO A6..A1 standard formats, posters, flyers",
          "Precision 2mm / 3mm / 5mm bleed margins with guide snapping",
          "Custom dimensions in mm or inches with portrait/landscape toggles",
        ],
      },
    },
    colors: {
      title: { ru: "CMYK и цветовые профили ICC", en: "CMYK & ICC Profiles" },
      badge: "20+ ICC Profiles",
      desc: {
        ru: "Калиброванная конвертация макетов из экранного sRGB в офсетные и цифровые CMYK-пространства. Мониторинг суммарного краскопереноса (TAC) для предотвращения отмарывания краски.",
        en: "Calibrated color conversion from screen sRGB to offset and digital CMYK profiles. Real-time Total Area Coverage (TAC) monitoring to prevent offset ink smearing.",
      },
      image: "/placeholders/covers/printforge/tab_colors_2x.png",
      features: {
        ru: [
          "Европейские профили: PSO Coated v3 (FOGRA39), FOGRA52, FOGRA27",
          "Американские стандарты: GRACoL 2006 Coated, US Web Coated SWOP",
          "Азиатские профили: Japan Color 2001 / 2002 / 2003 Web",
          "Сканирование палитры документа и детекция плашечных цветов",
        ],
        en: [
          "European profiles: PSO Coated v3 (FOGRA39), FOGRA52, FOGRA27",
          "North America standards: GRACoL 2006, US Web Coated SWOP",
          "Asian profiles: Japan Color 2001 / 2002 / 2003 Web",
          "Document palette scan and spot color assignment",
        ],
      },
    },
    dpi: {
      title: { ru: "Аудит разрешения (DPI)", en: "DPI Preflight Auditor" },
      badge: "300+ DPI Target",
      desc: {
        ru: "Сканирование всех встроенных растровых изображений в выбранном фрейме. Расчёт эффективного DPI с учётом экранного масштабирования и предупреждение о пикселизации при печати.",
        en: "Deep scan of all embedded raster layers in the frame. Calculates effective DPI factoring in canvas scaling and warns against print pixelation.",
      },
      image: "/placeholders/covers/printforge/tab_dpi_2x.png",
      features: {
        ru: [
          "Целевые пресеты: 72 (Screen), 150 (Draft), 300 (Print ⭐), 600 (Ultra)",
          "Цветовая индикация: зелёный (печать готова), жёлтый (предупреждение)",
          "Детальный расчёт физических пикселей к миллиметрам макета",
          "Быстрый переход к проблемному слою на холсте в один клик",
        ],
        en: [
          "Target presets: 72 (Screen), 150 (Draft), 300 (Print ⭐), 600 (Ultra)",
          "Status pills: green (optimal), yellow (warning: low resolution)",
          "Exact pixel-to-millimeter physical print dimension math",
          "One-click focus to locate low-res layer on Figma canvas",
        ],
      },
    },
    health: {
      title: { ru: "Pre-flight проверка качества", en: "Pre-flight Health Check" },
      badge: "Zero Print Errors",
      desc: {
        ru: "Комплексный чеклист перед запуском в тираж: проверка глубокого чёрного (Rich Black), тонких волосяных линий (Hairlines < 0.25 pt), непереведённых в кривые шрифтов и вылетов за безопасные поля.",
        en: "Prepress safety audit before press run: checks Rich Black vs True Black, hairline strokes (< 0.25 pt), unoutlined live text, and bleed violations.",
      },
      image: "/placeholders/covers/printforge/tab_health_2x.png",
      features: {
        ru: [
          "Проверка наложения краски (Overprint) и тонких линий",
          "Авто-определение текстовых слоёв без кривых (Font outlines)",
          "Контроль элементов ближе 3–5 мм к линии реза",
          "Инструмент Auto-Fix All для автоматического исправления",
        ],
        en: [
          "Overprint inspection and hairline stroke detection",
          "Automatic identification of uncurved typography",
          "Safety margin violations within 3-5mm from cut lines",
          "Auto-Fix All utility for one-click correction",
        ],
      },
    },
    packaging: {
      title: { ru: "Упаковка и ножи (Dielines)", en: "Packaging & Dielines" },
      badge: "Spot Cut & Crease",
      desc: {
        ru: "Маркировка векторов для вырубных и биговочных штампов. Автоматическое выделение линий ножа в специальные спотовые плашечные каналы (Spot Colors) для режущих плоттеров и типографий.",
        en: "Designation of vector paths for die-cutting and folding dies. Automated separation of knife lines into dedicated spot color channels for die-cutters.",
      },
      image: "/placeholders/covers/printforge/tab_packaging_2x.png",
      features: {
        ru: [
          "Линии резки (CUT Contour): сплошной 100% Magenta",
          "Линии сгиба/биговки (FOLD / Crease): пунктирный Cyan",
          "Технические слои (TECH Layer): выборочный УФ-лак, фольга, тиснение",
          "Очистка и сброс меток штампа в один клик",
        ],
        en: [
          "Cut Contour: Solid 100% Spot Magenta for knife cutters",
          "Fold / Crease: Dashed Spot Cyan for scoring machines",
          "Technical Finish Layers: Spot UV varnish, hot foil stamping, embossing",
          "One-click dieline cleanup and batch tag management",
        ],
      },
    },
  };

  return (
    <div
      className="w-full min-h-full flex-1 flex flex-col bg-[#080d16] text-[#f1f5f9] p-4 sm:p-8 lg:p-12 space-y-12"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Manrope', sans-serif" }}
    >
      <div className="max-w-6xl mx-auto w-full space-y-12">
        {/* =========================================================
            01. HEADER: Title, Subtitle, Badges & Action Buttons
            ========================================================= */}
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-2 border-b border-slate-800/80">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-sky-500/10 border border-sky-400/30 text-sky-400 font-mono text-xs font-bold rounded-full">
                FIGMA PLUGIN • v3.0.6
              </span>
              <span className="px-3 py-1 bg-rose-500/10 border border-rose-400/30 text-rose-400 font-mono text-xs font-bold rounded-full">
                ISO 12647 CMYK
              </span>
              <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-mono text-xs font-bold rounded-full">
                LIVE CLOUD API
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              {project.title}
              <span className="text-sky-400 text-2xl sm:text-4xl font-normal ml-3 opacity-80">
                (PrintPlix)
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
              {locale === "en"
                ? "Professional prepress plugin and cloud conversion pipeline for Figma: calibrated CMYK color conversion, automated bleed setup, DPI asset auditing, and spot dieline packaging channels."
                : "Профессиональный prepress-плагин и облачный пайплайн для полиграфии в Figma: калиброванная CMYK-конвертация по ISO 12647, автоматический расчёт припусков (Bleed), аудит разрешения DPI и подготовка ножей для упаковки."}
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-sky-500/25 transition-all duration-200"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>{locale === "en" ? "Open Local Plugin" : "Открыть локальный плагин"}</span>
              <span className="text-base">↗</span>
            </a>

            <button
              type="button"
              onClick={handleCopyManifest}
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl border border-slate-700 transition"
              style={{ cursor: xpCursors.pointer }}
              title={manifestPath}
            >
              <span>{copiedManifest ? (locale === "en" ? "✓ Path Copied" : "✓ Путь скопирован") : (locale === "en" ? "Copy Manifest Path" : "Путь к manifest.json")}</span>
            </button>
          </div>
        </header>

        {/* =========================================================
            02. SCREENCAST WITH DYNAMIC CURSOR ZOOM
            ========================================================= */}
        <section className="space-y-3" aria-label="Скринкаст плагина">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="uppercase tracking-wider font-bold text-sky-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {locale === "en" ? "Interactive Screencast (Cursor Zoom & Real UI)" : "Скринкаст с зумом на курсоре (Живой UI плагина)"}
            </span>
            <span className="font-mono opacity-70">1920 × 1080 • VP9 / H.264 • 60 FPS</span>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl bg-[#0d1424] border border-slate-800">
            {/* Window Top Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0a0f1c] border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs font-mono text-slate-400 bg-black/40 px-4 py-1.5 rounded-full max-w-md w-full text-center truncate border border-slate-800">
                printforge://figma-plugin/screencast-preview.webm
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-sky-300 transition"
                  style={{ cursor: xpCursors.pointer }}
                  title={isPlaying ? "Пауза" : "Воспроизведение"}
                >
                  {isPlaying ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="6 4 20 12 6 20 6 4" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="p-1.5 rounded-lg hover:bg-white/10 hover:text-sky-300 transition"
                  style={{ cursor: xpCursors.pointer }}
                  title={isMuted ? "Включить звук" : "Выключить звук"}
                >
                  {isMuted ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Screencast Video Player */}
            <div className="relative aspect-[16/9] w-full bg-[#0a0f1c]">
              <video
                ref={videoRef}
                src="/placeholders/covers/printforge.webm"
                poster="/placeholders/covers/printforge.jpg"
                autoPlay
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          </div>
        </section>

        {/* =========================================================
            03. CORE MODULES DEEP-DIVE & RETINA TAB SHOWCASE
            ========================================================= */}
        <section className="space-y-6 pt-4" aria-label="Модули предпечатной подготовки">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {locale === "en" ? "Core Prepress Modules & Architecture" : "Ключевые модули предпечатной подготовки"}
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              {locale === "en"
                ? "Click any module below to inspect Retina screenshots of the real plugin and technical capabilities."
                : "Выберите модуль ниже, чтобы изучить Retina-скриншоты реального плагина и технические детали реализации."}
            </p>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800">
            {(Object.keys(tabsInfo) as TabKey[]).map((key) => {
              const tab = tabsInfo[key];
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    xpSound.click();
                    setActiveTab(key);
                  }}
                  className={`flex-1 min-w-[140px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-sky-500 text-slate-950 shadow-md shadow-sky-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                  style={{ cursor: xpCursors.pointer }}
                >
                  <span>{locale === "en" ? tab.title.en : tab.title.ru}</span>
                </button>
              );
            })}
          </div>

          {/* Active Module Card */}
          {activeTab && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 bg-[#0c1322] rounded-2xl border border-slate-800 shadow-xl items-center">
              <div className="lg:col-span-5 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-400/10 border border-sky-400/30 text-sky-400 font-mono text-xs font-bold rounded-md">
                  {tabsInfo[activeTab].badge}
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {locale === "en" ? tabsInfo[activeTab].title.en : tabsInfo[activeTab].title.ru}
                </h3>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {locale === "en" ? tabsInfo[activeTab].desc.en : tabsInfo[activeTab].desc.ru}
                </p>

                <ul className="space-y-2.5 pt-2">
                  {(locale === "en" ? tabsInfo[activeTab].features.en : tabsInfo[activeTab].features.ru).map(
                    (f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                        <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                          ✓
                        </span>
                        <span>{f}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>

              {/* Screenshot Frame (Click to Zoom) */}
              <div className="lg:col-span-7">
                <div
                  className="rounded-xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950/60 group relative cursor-pointer"
                  onClick={() => setSelectedScreenshot(tabsInfo[activeTab].image)}
                  title="Нажмите для увеличения"
                >
                  <div className="relative aspect-[720/750] w-full max-w-[540px] mx-auto">
                    <Image
                      src={tabsInfo[activeTab].image}
                      alt={tabsInfo[activeTab].title.ru}
                      fill
                      className="object-contain group-hover:scale-[1.02] transition duration-300"
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 bg-sky-500/0 group-hover:bg-sky-500/5 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition px-4 py-2 bg-slate-900/90 text-sky-300 text-xs font-semibold rounded-full border border-sky-400/40 shadow-lg">
                      {locale === "en" ? "🔍 View Fullscreen Retina" : "🔍 Открыть в полном размере (Retina)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================
            04. LIVE INTERACTIVE PLUGIN SANDBOX (IFRAME)
            ========================================================= */}
        <section className="space-y-4 pt-4" aria-label="Интерактивный плагин онлайн">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {locale === "en" ? "Live Local Plugin Sandbox" : "Интерактивный просмотр плагина"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                {locale === "en"
                  ? "Direct interaction with the live running plugin server (http://localhost:3005)"
                  : "Прямое взаимодействие с живым локальным сервером плагина (http://localhost:3005)"}
              </p>
            </div>
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1.5"
            >
              <span>{locale === "en" ? "Open in New Tab" : "В новой вкладке"}</span>
              <span>↗</span>
            </a>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
            <div className="flex items-center justify-between px-4 py-3 bg-[#0c1220] border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs font-mono text-slate-400">http://localhost:3005</div>
              <span className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> ONLINE
              </span>
            </div>
            <div className="w-full flex justify-center bg-[#f4f6fb] p-4 sm:p-8">
              <div className="w-full max-w-[760px] h-[780px] rounded-2xl overflow-hidden shadow-2xl border border-slate-300/80 bg-white">
                <iframe
                  src={liveUrl}
                  className="w-full h-full border-none"
                  title="PrintPlix Live Sandbox"
                />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            05. TECHNICAL ARCHITECTURE & PIPELINE
            ========================================================= */}
        <section className="space-y-6 pt-4" aria-label="Техническая архитектура">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {locale === "en" ? "Technical Stack & Cloud Pipeline" : "Технический стек и облачный конвейер"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-400 flex items-center justify-center font-bold text-lg font-mono">
                TS
              </div>
              <h4 className="font-bold text-base text-white">Figma Plugin Bridge</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Двунаправленная шина обмена сообщениями между песочницей Figma (`code.ts`) и React 18 UI с Motion-анимациями и i18n поддержкой.
              </p>
            </div>

            <div className="p-6 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-400/30 text-rose-400 flex items-center justify-center font-bold text-lg font-mono">
                YC
              </div>
              <h4 className="font-bold text-base text-white">Serverless Raster Engine</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Yandex Cloud Serverless Containers с Ghostscript, LittleCMS (lcms2) и libvips для генерации 300/600 DPI CMYK TIFF и PDF с боксами.
              </p>
            </div>

            <div className="p-6 bg-slate-900/70 rounded-2xl border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 flex items-center justify-center font-bold text-lg font-mono">
                SB
              </div>
              <h4 className="font-bold text-base text-white">Supabase Quota & Waitlist</h4>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Хранение состояния бесплатных экспортов (0/30), валидация токенов пользователей Figma, сбор отзывов и синхронизация очередей.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            06. BOTTOM BAR: Navigation & Share Call to Action
            ========================================================= */}
        <footer className="pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-full transition-colors"
              style={{ cursor: xpCursors.pointer }}
            >
              <span>{locale === "en" ? "Launch Plugin" : "Запустить плагин"}</span>
              <span>↗</span>
            </a>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full font-medium text-xs border border-slate-700 transition"
              style={{ cursor: xpCursors.pointer }}
            >
              {copied
                ? locale === "en" ? "✓ Link Copied" : "✓ Ссылка скопирована"
                : locale === "en" ? "Copy Project Link" : "Скопировать ссылку"}
            </button>
          </div>

          {adjacent && (adjacent.prev || adjacent.next) && onOpenProject && (
            <div className="flex items-center gap-2 text-xs">
              {adjacent.prev && (
                <button
                  type="button"
                  onClick={() => onOpenProject(adjacent.prev!.slug)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full font-medium border border-slate-700 transition"
                  style={{ cursor: xpCursors.pointer }}
                >
                  ← {adjacent.prev.title}
                </button>
              )}
              {adjacent.next && (
                <button
                  type="button"
                  onClick={() => onOpenProject(adjacent.next!.slug)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full font-medium border border-slate-700 transition"
                  style={{ cursor: xpCursors.pointer }}
                >
                  {adjacent.next.title} →
                </button>
              )}
            </div>
          )}
        </footer>
      </div>

      {/* Fullscreen Screenshot Modal */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setSelectedScreenshot(null)}
        >
          <div className="relative max-w-4xl max-h-[92vh] w-full h-full flex items-center justify-center">
            <Image
              src={selectedScreenshot}
              alt="Plugin Screenshot Full"
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
