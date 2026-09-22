"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import Image from "next/image";
import { projects, getProject, getAdjacent, Project } from "@/data/projects";
import { PORTFOLIO_DIRECTIONS, FocusDirection } from "@/lib/xp/navigation";
import { useLocale } from "@/lib/i18n";
import { xpSound } from "@/lib/xp/sound";
import { xpCursors } from "@/lib/xp/cursors";
import { InternetExplorerIcon } from "../xp-icons";
import styles from "./portfolio-browser-window.module.css";
import { PortfolioLanding } from "@/components/portfolio/portfolio-landing";
import { AltynSolokLanding } from "./altyn-solok-landing";
import { PrintforgeLanding } from "./printforge-landing";

interface PortfolioBrowserWindowProps {
  initialProjectSlug?: string;
  initialFocus?: FocusDirection;
  notFound?: boolean;
}

/* =========================================================================
   Interactive Specimens for Case Views
   ========================================================================= */

function KoraSpecimen() {
  const [sampleText, setSampleText] = useState("В бумажном фонде архива края букв слоятся, как кора.");
  const [fontSize, setFontSize] = useState(28);

  return (
    <div className="bg-[#1a1c18] text-[#f4f2e9] p-4 sm:p-6 rounded-lg border border-[#3e4235] space-y-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3e4235] pb-3 text-xs font-mono">
        <span className="text-[#a4b58e] uppercase tracking-widest font-bold">
          TYPE SPECIMEN // KORA ARCHIVE GROTESQUE
        </span>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Кегль:</span>
          <input
            type="range"
            min={18}
            max={48}
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-24 h-1.5 bg-[#2c3024] accent-[#a4b58e] rounded"
          />
          <span className="w-8 font-mono text-right">{fontSize}px</span>
        </div>
      </div>

      <div className="min-h-[90px] flex items-center">
        <p
          className="w-full font-black tracking-tight leading-snug outline-none border-b border-transparent focus:border-[#a4b58e] transition"
          style={{ fontSize: `${fontSize}px` }}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => setSampleText(e.currentTarget.textContent || sampleText)}
        >
          {sampleText}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#3e4235] text-[10px] font-mono text-[#a4b58e]">
        <div>
          <span className="text-slate-500 block">НАЧЕРТАНИЕ:</span>
          <strong>Display Regular</strong>
        </div>
        <div>
          <span className="text-slate-500 block">МЕТРИКИ:</span>
          <strong>Cap 740 / X 520</strong>
        </div>
        <div>
          <span className="text-slate-500 block">ОПИЛ:</span>
          <strong>Слоистый срез</strong>
        </div>
        <div>
          <span className="text-slate-500 block">ФОРМАТ:</span>
          <strong>OpenType / WOFF2</strong>
        </div>
      </div>
    </div>
  );
}

function SignalatlasSpecimen() {
  const [band, setBand] = useState<"VHF" | "UHF" | "AM">("VHF");

  return (
    <div className="bg-[#061814] text-[#86efac] p-4 sm:p-6 rounded-lg border border-[#134e40] space-y-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#134e40] pb-3 text-xs font-mono">
        <span className="text-[#34d399] uppercase tracking-widest font-bold">
          INTERFERENCE ATLAS // МЕРТВЫЕ ЗОНЫ РАДИОТИШИНЫ
        </span>
        <div className="flex gap-1">
          {(["VHF", "UHF", "AM"] as const).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => {
                xpSound.click();
                setBand(b);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                band === b ? "bg-[#059669] text-white" : "bg-[#0a2e26] text-[#6ee7b7] hover:text-white"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 bg-[#020d0b] border border-[#0d382e] rounded font-mono text-xs space-y-1">
        <div className="flex justify-between text-slate-400 text-[10px]">
          <span>ДИАПАЗОН: {band}</span>
          <span>УРОВЕНЬ ШУМА: {band === "VHF" ? "14.2 dBµV" : band === "UHF" ? "28.6 dBµV" : "8.1 dBµV"}</span>
        </div>
        <div className="h-10 flex items-center gap-1">
          {[40, 65, 30, 85, 20, 95, 75, 50, 80, 45, 60, 90, 35, 70, 55, 88].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-emerald-500/60 rounded-xs transition-all duration-300"
              style={{
                height: `${band === "VHF" ? h : band === "UHF" ? Math.min(100, h * 1.2) : Math.max(15, h * 0.7)}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NoclipSpecimen() {
  const [activeRoom, setActiveRoom] = useState<string>("room-1");

  return (
    <div className="bg-[#0b1320] text-[#7dd3fc] p-4 sm:p-6 rounded-lg border border-[#1e3a5f] space-y-4 shadow-inner">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1e3a5f] pb-3 text-xs font-mono">
        <span className="text-[#38bdf8] uppercase tracking-widest font-bold">
          SPATIAL OS // ЗАЛЫ КАК СИСТЕМНЫЕ ОКНА
        </span>
        <div className="flex gap-1">
          {["room-1", "room-2", "room-3"].map((r, i) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                xpSound.click();
                setActiveRoom(r);
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition ${
                activeRoom === r ? "bg-[#0284c7] text-white" : "bg-[#0f2744] text-[#bae6fd] hover:text-white"
              }`}
            >
              Зал {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-[#060c16] border border-[#132a48] rounded text-xs space-y-2">
        <div className="font-mono text-[11px] text-sky-400">
          SYSCALL: OPEN_CHAMBER({activeRoom}) → ACTIVE_SURFACE
        </div>
        <p className="text-slate-300">
          {activeRoom === "room-1" && "Зал античных рукописей. Проекция на пол отображает сетку координат фонда."}
          {activeRoom === "room-2" && "Зал оптических приборов. Стенд синхронизирован с гироскопом посетителя."}
          {activeRoom === "room-3" && "Зал акустических следов. Интерактивная зона затухания реверберации."}
        </p>
      </div>
    </div>
  );
}

function GenericSpecimen({ project }: { project: Project }) {
  const { t } = useLocale();

  return (
    <div className="bg-slate-900 text-slate-100 p-4 sm:p-6 rounded-lg border border-slate-700 space-y-3 shadow-inner">
      <div className="flex items-center justify-between border-b border-slate-700 pb-2 text-xs font-mono text-slate-400">
        <span>МАТЕРИАЛ КЕЙСА // {project.slug.toUpperCase()}</span>
        <span>{project.year}</span>
      </div>
      <div className="relative aspect-[16/9] w-full max-w-lg mx-auto rounded overflow-hidden border border-slate-800 bg-black">
        <Image
          src={project.cover}
          alt={project.title}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <p className="text-xs text-slate-300 leading-relaxed pt-2">
        {t(project.body)}
      </p>
    </div>
  );
}

/* =========================================================================
   Portfolio Browser Window Component
   ========================================================================= */

export function PortfolioBrowserWindow({
  initialProjectSlug,
  initialFocus,
  notFound,
}: PortfolioBrowserWindowProps) {
  const { t, locale } = useLocale();

  // Resolve initial state from props or surviving session state
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    if (notFound) return null;
    if (initialProjectSlug) return initialProjectSlug;
    if (typeof window !== "undefined") {
      const search = window.location.search;
      if (search.includes("view=portfolio") && !search.includes("project=")) {
        return null;
      }
      return window.sessionStorage.getItem("amazi-portfolio-slug");
    }
    return null;
  });
  const [prevSlugProp, setPrevSlugProp] = useState<string | undefined>(initialProjectSlug);
  if (initialProjectSlug !== prevSlugProp) {
    setPrevSlugProp(initialProjectSlug);
    setSelectedSlug(initialProjectSlug || null);
  }

  const [focus, setFocus] = useState<FocusDirection | null>(() => {
    if (initialFocus) return initialFocus;
    if (typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("amazi-portfolio-focus");
      if (saved === "communication" || saved === "engineering") return saved;
    }
    return null;
  });
  const [prevFocusProp, setPrevFocusProp] = useState<FocusDirection | undefined>(initialFocus);
  if (initialFocus !== prevFocusProp) {
    setPrevFocusProp(initialFocus);
    setFocus(initialFocus || null);
  }

  const [hasNotFound, setHasNotFound] = useState<boolean>(() => !!notFound);
  const [prevNotFoundProp, setPrevNotFoundProp] = useState<boolean | undefined>(notFound);
  if (notFound !== prevNotFoundProp) {
    setPrevNotFoundProp(notFound);
    setHasNotFound(!!notFound);
    if (notFound) {
      setSelectedSlug(null);
    }
  }

  const [copiedLink, setCopiedLink] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Sync state to sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (selectedSlug) {
        window.sessionStorage.setItem("amazi-portfolio-slug", selectedSlug);
      } else {
        window.sessionStorage.removeItem("amazi-portfolio-slug");
      }
      if (focus) {
        window.sessionStorage.setItem("amazi-portfolio-focus", focus);
      } else {
        window.sessionStorage.removeItem("amazi-portfolio-focus");
      }
    }
  }, [selectedSlug, focus]);

  // Restore catalog scroll position on return
  useLayoutEffect(() => {
    if (!selectedSlug && contentRef.current && typeof window !== "undefined") {
      const saved = window.sessionStorage.getItem("amazi-portfolio-scroll");
      if (saved) {
        contentRef.current.scrollTop = parseFloat(saved) || 0;
      }
    }
  }, [selectedSlug]);

  // Save scroll on unmount / minimize
  useEffect(() => {
    const el = contentRef.current;
    return () => {
      if (el && typeof window !== "undefined") {
        window.sessionStorage.setItem("amazi-portfolio-scroll", String(el.scrollTop));
      }
    };
  }, []);

  // Filter projects by focus direction
  const displayedProjects = React.useMemo(() => {
    if (!focus) return projects;
    const slugs = PORTFOLIO_DIRECTIONS[focus]?.slugs || [];
    return projects.filter((p) => slugs.includes(p.slug));
  }, [focus]);

  const currentProject = selectedSlug ? getProject(selectedSlug) : null;
  const adjacent = selectedSlug ? getAdjacent(selectedSlug) : { prev: null, next: null };

  // Readable address bar value
  const readableAddress = React.useMemo(() => {
    if (selectedSlug) {
      return `portfolio://projects/${selectedSlug}`;
    }
    if (focus) {
      return `portfolio://catalog?focus=${focus}`;
    }
    return `portfolio://catalog`;
  }, [selectedSlug, focus]);

  // Navigation handlers
  const handleOpenProject = (slug: string) => {
    xpSound.click();
    if (contentRef.current && typeof window !== "undefined") {
      window.sessionStorage.setItem(
        "amazi-portfolio-scroll",
        String(contentRef.current.scrollTop)
      );
    }
    setSelectedSlug(slug);
    setHasNotFound(false);

    // Update URL history
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("project", slug);
      if (focus) {
        url.searchParams.set("focus", focus);
      }
      url.searchParams.delete("view");
      window.history.pushState({ project: slug, focus }, "", url.toString());
    }

    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  const handleBack = () => {
    xpSound.click();
    if (selectedSlug) {
      setSelectedSlug(null);

      // Update URL to portfolio catalog (preserving focus and extra query params)
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem("amazi-portfolio-slug");
        const url = new URL(window.location.href);
        url.searchParams.delete("project");
        url.searchParams.set("view", "portfolio");
        if (focus) {
          url.searchParams.set("focus", focus);
        }
        window.history.pushState({ view: "portfolio", focus }, "", url.toString());
      }

      // Restore previous scroll position
      requestAnimationFrame(() => {
        if (contentRef.current && typeof window !== "undefined") {
          const saved = window.sessionStorage.getItem("amazi-portfolio-scroll");
          contentRef.current.scrollTop = saved ? parseFloat(saved) : 0;
        }
      });
    }
  };

  const handleFilterChange = (newFocus: FocusDirection | null) => {
    xpSound.click();
    setFocus(newFocus);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      url.searchParams.set("view", "portfolio");
      if (newFocus) {
        url.searchParams.set("focus", newFocus);
      } else {
        url.searchParams.delete("focus");
      }
      window.history.pushState({ view: "portfolio", focus: newFocus }, "", url.toString());
    }
  };

  const handleCopyLink = () => {
    xpSound.click();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className={styles.browserContainer}>
      {/* 44px Navigation Toolbar: Back Button & Readable Address Bar */}
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={handleBack}
          disabled={!selectedSlug}
          data-ym-goal="portfolio_back_to_catalog"
          className={styles.backBtn}
          aria-label="Назад к каталогу"
          title={selectedSlug ? "Назад к каталогу проектов" : "Назад"}
          style={{ cursor: selectedSlug ? xpCursors.pointer : "default" }}
        >
          <span aria-hidden="true">←</span>
          <span>Назад</span>
        </button>

        {/* Read-only Address Bar */}
        <div className={styles.addressBar} title="Текущий адрес">
          <InternetExplorerIcon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className={styles.addressText}>{readableAddress}</span>
        </div>
      </div>

      {/* Main Content Viewport: replacement point for future landing */}
      <div ref={contentRef} className={styles.contentViewport}>
        {selectedSlug && currentProject ? (
          currentProject.slug === "altyn-solok" ? (
            <AltynSolokLanding
              project={currentProject}
              adjacent={adjacent}
              onOpenProject={handleOpenProject}
            />
          ) : currentProject.slug === "printforge" ? (
            <PrintforgeLanding
              project={currentProject}
              adjacent={adjacent}
              onOpenProject={handleOpenProject}
            />
          ) : (
            /* =============================================================
               Case View (Project Dossier)
               ============================================================= */
            <div className="p-4 sm:p-8 max-w-5xl mx-auto w-full space-y-6">
              {/* Classification Header */}
            <div className="border-b-2 border-slate-900 pb-4 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>DOSSIER // DE-{currentProject.year}-{currentProject.slug.toUpperCase()}</span>
                <span>АРХИВ ДИЗАЙН-ИНЖЕНЕРА</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {currentProject.title}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-blue-800 leading-snug">
                {t(currentProject.kicker)}
              </p>
            </div>

            {/* Interactive Domain Specimen */}
            <div>
              {currentProject.slug === "kora" && <KoraSpecimen />}
              {currentProject.slug === "signalatlas" && <SignalatlasSpecimen />}
              {currentProject.slug === "noclip" && <NoclipSpecimen />}
              {currentProject.slug !== "kora" &&
                currentProject.slug !== "signalatlas" &&
                currentProject.slug !== "noclip" && (
                  <GenericSpecimen project={currentProject} />
                )}
            </div>

            {/* Design Engineering Anatomy */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b pb-1">
                Анатомия решения
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    01 // Контекст & Ограничения
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {t(currentProject.body)}
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    02 // Логика & Грамматика
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    Построение строгой модульной системы, исключающей случайные декоративные решения. Форма подчинена физическим свойствам носителя и условиям считывания.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    03 // Код & Реализация
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    Модель и код объединены в одном цикле проверки: от интерактивных прототипов до стабильного рендеринга без просадок по производительности на целевых экранах.
                  </p>
                </div>
              </div>
            </div>

            {/* Deliverables Spec Sheet */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Спецификация артефактов и сдачи
              </h3>
              <div className="border border-slate-300 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <tbody>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-700 w-44">Тип поставки:</td>
                      <td className="py-2 px-3 text-slate-900">
                        Интерактивная система, шрифтовые файлы / интерфейсный модуль
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="py-2 px-3 font-semibold text-slate-700">Стек и инструменты:</td>
                      <td className="py-2 px-3 text-blue-900 font-medium">
                        {currentProject.tags[locale].join(" • ")} • React • TypeScript • Canvas
                      </td>
                    </tr>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <td className="py-2 px-3 font-semibold text-slate-700">Готовность:</td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">
                        Архивировано в портфолио ({currentProject.year})
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions & Adjacent Navigation */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {currentProject.href && (
                  <a
                    href={currentProject.href}
                    target="_blank"
                    rel="noreferrer"
                    data-ym-goal="portfolio_external_link"
                    data-ym-params={JSON.stringify({ slug: currentProject.slug, href: currentProject.href })}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow-xs flex items-center gap-1.5 transition"
                    style={{ cursor: xpCursors.pointer }}
                  >
                    <span>{currentProject.linkLabel ? t(currentProject.linkLabel) : "Смотреть проект"}</span>
                    <span>↗</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  data-ym-goal="portfolio_copy_link"
                  data-ym-params={JSON.stringify({ slug: currentProject.slug })}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs rounded shadow-2xs transition"
                  style={{ cursor: xpCursors.pointer }}
                >
                  {copiedLink ? "✓ Ссылка скопирована" : "Скопировать ссылку"}
                </button>
              </div>

              {/* Next / Prev Project */}
              <div className="flex items-center gap-2 text-xs">
                {adjacent.prev && (
                  <button
                    type="button"
                    onClick={() => handleOpenProject(adjacent.prev!.slug)}
                    data-ym-goal="portfolio_adjacent_project"
                    data-ym-params={JSON.stringify({ slug: adjacent.prev.slug, dir: "prev" })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-medium border border-slate-200"
                    style={{ cursor: xpCursors.pointer }}
                  >
                    ← {adjacent.prev.title}
                  </button>
                )}
                {adjacent.next && (
                  <button
                    type="button"
                    onClick={() => handleOpenProject(adjacent.next!.slug)}
                    data-ym-goal="portfolio_adjacent_project"
                    data-ym-params={JSON.stringify({ slug: adjacent.next.slug, dir: "next" })}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded font-medium border border-slate-200"
                    style={{ cursor: xpCursors.pointer }}
                  >
                    {adjacent.next.title} →
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      ) : (
          <PortfolioLanding
            projects={displayedProjects}
            focus={focus}
            scrollContainer={contentRef}
            onFocusChange={handleFilterChange}
            onOpenProject={handleOpenProject}
            notFound={hasNotFound}
          />
        )}
      </div>
    </div>
  );
}
